// =============================================================================
// CONTEXT / MonitoringContext.tsx
// =============================================================================
// The single global store for the entire application.  Everything that changes
// at runtime lives here:  equipment state, alerts, activity log, inspections,
// toast notifications, simulation control, and demo orchestration.
//
// Key responsibilities:
//   tick()             — runs every 1 500 ms while systemOnline is true.
//                        Advances all sensor simulations, re-evaluates severity,
//                        updates health + anomaly scores, and fires side-effects
//                        (alerts / toasts / activity entries) via queueMicrotask.
//   simulateWarning()  — switches an equipment's scenario to 'warning', pulling
//                        sensors toward warning-level target values.
//   simulateCritical() — same but for critical targets.
//   resetToNormal()    — returns an equipment to its baseline scenario.
//   toggleSystem()     — pauses / resumes the tick interval.
//   submitInspection() — merges auto-assessment with inspector input, stores the
//                        Inspection record, and updates lastInspection on the asset.
//   startFullDemo()    — orchestrates the ~60-second hackathon demo sequence using
//                        window.setTimeout stages.
//
// State shape is exposed via the MonitoringState interface and consumed by every
// page and most components through the useMonitoring() hook.
// =============================================================================
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityEvent,
  Alert,
  Equipment,
  Inspection,
  InspectionCheck,
  ScenarioTarget,
  SensorKey,
  Severity,
} from '../types';
import { createSeedEquipment } from '../data/equipment';
import { initSimState, SCENARIO_TARGETS, SimState, stepSensor } from '../simulation/sensorSimulator';
import { evaluateSeverity, SENSOR_META, worstSeverity } from '../rules/thresholds';
import { computeHealth, statusFromHealthAndSeverity } from '../services/healthEngine';
import { detectAnomalies } from '../services/anomalyEngine';
import { buildAlert, buildMultiAlert } from '../services/alertEngine';

// A toast notification shown in the bottom-right corner for up to 6 seconds.
export interface Toast {
  id: string;
  severity: Severity;
  title: string;
  message: string;
}

// Per-equipment scenario mode stored in a ref (not state) to avoid
// triggering re-renders when a scenario changes — only tick() reads it.
type ScenarioMode = 'normal' | 'warning' | 'critical';

// Everything exposed to consumers via useMonitoring().
interface MonitoringState {
  equipment: Equipment[];
  alerts: Alert[];
  activity: ActivityEvent[];
  inspections: Inspection[];
  toasts: Toast[];
  systemOnline: boolean;
  demoRunning: boolean;
  demoLabel: string | null;
  focusEquipmentId: string | null;
  reportEquipmentId: string | null;
  toggleSystem: () => void;
  simulateWarning: (eqId?: string) => void;
  simulateCritical: (eqId?: string) => void;
  resetToNormal: (eqId?: string) => void;
  resolveAlert: (id: string) => void;
  dismissToast: (id: string) => void;
  submitInspection: (input: {
    equipmentId: string;
    inspector: string;
    findings: string;
    comments: string;
    correctiveAction: string;
  }) => Inspection;
  autoAssessInspection: (equipmentId: string) => Omit<
    Inspection,
    'id' | 'inspector' | 'findings' | 'comments' | 'correctiveAction' | 'status' | 'date'
  >;
  startFullDemo: (navigate: (path: string) => void) => void;
  setFocusEquipmentId: (id: string | null) => void;
  clearReportEquipment: () => void;
  addEquipment: (eq: Equipment) => void;
  updateThresholds: (eqId: string, thresholds: Equipment['thresholds']) => void;
}

const MonitoringContext = createContext<MonitoringState | null>(null);

// Activity entries are timestamped with HH:MM:SS in 24-h format.
function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// Module-level counter for activity event IDs — avoids key collisions
// when React reconciles the activity list after rapid back-to-back ticks.
let activityCounter = 0;
function activityId() {
  activityCounter += 1;
  return `act-${activityCounter}`;
}

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(() => createSeedEquipment());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([
    { id: activityId(), timestamp: nowLabel(), message: 'System initialized. All equipment nominal.', severity: 'normal' },
  ]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [systemOnline, setSystemOnline] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoLabel, setDemoLabel] = useState<string | null>(null);
  const [focusEquipmentId, setFocusEquipmentId] = useState<string | null>(null);
  const [reportEquipmentId, setReportEquipmentId] = useState<string | null>(null);

  const simRef = useRef<Map<string, Map<SensorKey, SimState>>>(new Map());
  const scenarioRef = useRef<Map<string, ScenarioMode>>(new Map());
  const prevSeverityRef = useRef<Map<string, Map<SensorKey, Severity>>>(new Map());

  // init sim state
  useEffect(() => {
    equipment.forEach((eq) => {
      const m = new Map<SensorKey, SimState>();
      (Object.keys(eq.baseline) as SensorKey[]).forEach((k) => m.set(k, initSimState(eq.baseline[k])));
      simRef.current.set(eq.id, m);
      scenarioRef.current.set(eq.id, 'normal');
      prevSeverityRef.current.set(eq.id, new Map());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushToast = useCallback((severity: Severity, title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, severity, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  }, []);

  const pushActivity = useCallback((message: string, severity: Severity, eqId?: string) => {
    setActivity((prev) => [{ id: activityId(), timestamp: nowLabel(), message, severity, equipmentId: eqId }, ...prev].slice(0, 60));
  }, []);

  const tick = useCallback(() => {
    setEquipment((prev) =>
      prev.map((eq) => {
        const simMap = simRef.current.get(eq.id)!;
        const mode = scenarioRef.current.get(eq.id) ?? 'normal';
        const target: ScenarioTarget = SCENARIO_TARGETS[mode];
        const prevSevMap = prevSeverityRef.current.get(eq.id)!;

        const newSensors = { ...eq.sensors };
        let abnormalCount = 0;
        const newTransitions: { key: SensorKey; sev: Severity; value: number; threshold: number }[] = [];

        (Object.keys(eq.baseline) as SensorKey[]).forEach((key) => {
          const state = simMap.get(key)!;
          const tgt = (target as any)[key] as number | undefined;
          const next = stepSensor(key, state, eq.baseline[key], tgt);
          simMap.set(key, next);

          const sensor = eq.sensors[key];
          const severity = evaluateSeverity(next.value, eq.thresholds[key]);
          if (severity !== 'normal') abnormalCount++;

          const history = [...sensor.history, { t: Date.now(), v: next.value }].slice(-40);

          newSensors[key] = { ...sensor, value: next.value, severity, history };

          const prevSev = prevSevMap.get(key) ?? 'normal';
          if (severity !== prevSev && severity !== 'normal') {
            const th = severity === 'critical' ? eq.thresholds[key].criticalHigh : eq.thresholds[key].warningHigh;
            newTransitions.push({ key, sev: severity, value: next.value, threshold: th });
          }
          prevSevMap.set(key, severity);
        });

        const worst = worstSeverity((Object.keys(newSensors) as SensorKey[]).map((k) => newSensors[k].severity));
        const status = mode === 'normal' && worst === 'normal'
          ? (eq.status === 'Maintenance' ? 'Maintenance' : 'Running')
          : statusFromHealthAndSeverity(worst);

        const updatedEq: Equipment = {
          ...eq,
          sensors: newSensors,
          status,
        };
        updatedEq.health = computeHealth(updatedEq);
        const anomaly = detectAnomalies(updatedEq);
        updatedEq.anomalyScore = anomaly.score;
        updatedEq.anomalyMessages = anomaly.messages;

        // side-effect: alerts/activity for new severity transitions
        if (newTransitions.length) {
          queueMicrotask(() => {
            newTransitions.forEach((tr) => {
              const alert = buildAlert(updatedEq, tr.key, tr.sev, tr.value, tr.threshold);
              setAlerts((a) => [alert, ...a]);
              setEquipment((eqs) => eqs.map((e) => (e.id === updatedEq.id ? { ...e, alertCount: e.alertCount + 1 } : e)));
              pushActivity(
                `${updatedEq.id} ${SENSOR_META[tr.key].label.toLowerCase()} ${tr.sev === 'critical' ? 'reached critical level' : 'crossed warning threshold'} (${tr.value}${SENSOR_META[tr.key].unit})`,
                tr.sev,
                updatedEq.id
              );
              pushToast(
                tr.sev,
                tr.sev === 'critical' ? 'CRITICAL' : 'WARNING',
                `${updatedEq.id} ${SENSOR_META[tr.key].label.toLowerCase()} is ${tr.sev === 'critical' ? 'critical' : 'above normal'}.`
              );
            });
            if (abnormalCount >= 3) {
              const multi = buildMultiAlert(updatedEq, worst === 'critical' ? 'critical' : 'warning');
              setAlerts((a) => [multi, ...a]);
              pushActivity(`Multiple sensor abnormalities detected on ${updatedEq.id}`, worst, updatedEq.id);
            }
          });
        }

        return updatedEq;
      })
    );
  }, [pushActivity, pushToast]);

  useEffect(() => {
    if (!systemOnline) return;
    const interval = setInterval(tick, 1500);
    return () => clearInterval(interval);
  }, [systemOnline, tick]);

  const setScenario = useCallback((eqId: string, mode: ScenarioMode) => {
    scenarioRef.current.set(eqId, mode);
  }, []);

  const simulateWarning = useCallback(
    (eqId = 'M-001') => {
      setScenario(eqId, 'warning');
      pushActivity(`Warning scenario triggered on ${eqId}`, 'warning', eqId);
      pushToast('warning', 'WARNING', 'Abnormal equipment condition detected.');
    },
    [setScenario, pushActivity, pushToast]
  );

  const simulateCritical = useCallback(
    (eqId = 'M-001') => {
      setScenario(eqId, 'critical');
      pushActivity(`Critical fault scenario triggered on ${eqId}`, 'critical', eqId);
      pushToast('critical', 'CRITICAL CONDITION DETECTED', 'Immediate inspection required.');
    },
    [setScenario, pushActivity, pushToast]
  );

  const resetToNormal = useCallback(
    (eqId = 'M-001') => {
      setScenario(eqId, 'normal');
      pushActivity(`${eqId} reset to normal operating range`, 'normal', eqId);
      pushToast('normal', 'RESET', `${eqId} restored to normal condition.`);
    },
    [setScenario, pushActivity, pushToast]
  );

  const toggleSystem = useCallback(() => {
    setSystemOnline((v) => !v);
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a)));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const buildChecks = useCallback((eq: Equipment): InspectionCheck[] => {
    const checks: InspectionCheck[] = (Object.keys(eq.sensors) as SensorKey[]).map((key) => {
      const sev = eq.sensors[key].severity;
      return {
        key,
        label: SENSOR_META[key].label,
        result: sev === 'critical' ? 'fail' : sev === 'warning' ? 'warning' : 'pass',
      };
    });
    const worst = worstSeverity((Object.keys(eq.sensors) as SensorKey[]).map((k) => eq.sensors[k].severity));
    checks.push({ key: 'final', label: 'Final Assessment', result: worst === 'critical' ? 'fail' : worst === 'warning' ? 'warning' : 'pass' });
    return checks;
  }, []);

  const autoAssessInspection = useCallback(
    (equipmentId: string) => {
      const eq = equipment.find((e) => e.id === equipmentId)!;
      const checks = buildChecks(eq);
      const worst = worstSeverity((Object.keys(eq.sensors) as SensorKey[]).map((k) => eq.sensors[k].severity));
      const result: Inspection['result'] = worst === 'critical' ? 'FAIL' : worst === 'warning' ? 'WARNING' : 'PASS';
      const reasons: string[] = [];
      (Object.keys(eq.sensors) as SensorKey[]).forEach((key) => {
        const s = eq.sensors[key];
        if (s.severity === 'critical') reasons.push(`${SENSOR_META[key].label} exceeded critical threshold (${s.value}${s.unit}).`);
        else if (s.severity === 'warning') reasons.push(`${SENSOR_META[key].label} is above the normal operating range (${s.value}${s.unit}).`);
      });
      if (reasons.length === 0) reasons.push('All monitored parameters are within normal operating range.');
      const criticalIssues = (Object.keys(eq.sensors) as SensorKey[]).filter((k) => eq.sensors[k].severity === 'critical').length;
      const recommendedAction =
        result === 'FAIL'
          ? 'Immediate equipment shutdown and inspection required.'
          : result === 'WARNING'
          ? 'Schedule maintenance within 24-48 hours and continue close monitoring.'
          : 'No action required. Continue routine monitoring.';

      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        result,
        criticalIssues,
        checks,
        reasons,
        recommendedAction,
      };
    },
    [equipment, buildChecks]
  );

  const submitInspection = useCallback(
    (input: { equipmentId: string; inspector: string; findings: string; comments: string; correctiveAction: string }) => {
      const auto = autoAssessInspection(input.equipmentId);
      const inspection: Inspection = {
        id: `INS-${String(inspections.length + 1).padStart(4, '0')}`,
        date: new Date().toISOString(),
        status: 'Completed',
        inspector: input.inspector || 'Unassigned Inspector',
        findings: input.findings,
        comments: input.comments,
        correctiveAction: input.correctiveAction,
        ...auto,
      };
      setInspections((prev) => [inspection, ...prev]);
      setEquipment((prev) => prev.map((e) => (e.id === input.equipmentId ? { ...e, lastInspection: inspection.date } : e)));
      pushActivity(`Inspection ${inspection.id} completed on ${input.equipmentId}: ${inspection.result}`, inspection.result === 'FAIL' ? 'critical' : inspection.result === 'WARNING' ? 'warning' : 'normal', input.equipmentId);
      return inspection;
    },
    [autoAssessInspection, inspections.length, pushActivity]
  );

  const clearReportEquipment = useCallback(() => setReportEquipmentId(null), []);

  // Add a brand-new equipment asset at runtime and initialise its sim state.
  const addEquipment = useCallback((eq: Equipment) => {
    setEquipment((prev) => [...prev, eq]);
    const m = new Map<SensorKey, SimState>();
    (Object.keys(eq.baseline) as SensorKey[]).forEach((k) => m.set(k, initSimState(eq.baseline[k])));
    simRef.current.set(eq.id, m);
    scenarioRef.current.set(eq.id, 'normal');
    prevSeverityRef.current.set(eq.id, new Map());
    pushActivity(`New equipment ${eq.id} (${eq.name}) added to registry`, 'normal', eq.id);
    pushToast('normal', 'EQUIPMENT ADDED', `${eq.name} (${eq.id}) registered successfully.`);
  }, [pushActivity, pushToast]);

  // Update threshold configuration for one equipment asset.
  const updateThresholds = useCallback((eqId: string, thresholds: Equipment['thresholds']) => {
    setEquipment((prev) => prev.map((e) => e.id === eqId ? { ...e, thresholds } : e));
    pushActivity(`Thresholds updated for ${eqId}`, 'normal', eqId);
    pushToast('normal', 'THRESHOLDS SAVED', `${eqId} threshold configuration updated.`);
  }, [pushActivity, pushToast]);

  const startFullDemo = useCallback(
    (navigate: (path: string) => void) => {
      if (demoRunning) return;
      setDemoRunning(true);

      // All 4 equipment IDs in demo order
      const allIds = ['M-001', 'P-002', 'T-003', 'E-004'];
      const timers: number[] = [];
      const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

      // --- Reset all to normal first ---
      allIds.forEach((id) => resetToNormal(id));
      setDemoLabel('Stage 1 · Normal monitoring — all equipment');
      navigate('/dashboard');

      // --- M-001: Warning (6s) ---
      at(6000, () => {
        setDemoLabel('Stage 2 · M-001 Industrial Motor — warning detected');
        simulateWarning('M-001');
        navigate('/live-monitoring');
      });

      // --- M-001: Critical (16s) ---
      at(16000, () => {
        setDemoLabel('Stage 3 · M-001 — critical fault, alerts firing');
        simulateCritical('M-001');
      });

      // --- P-002: Warning (24s) ---
      at(24000, () => {
        setDemoLabel('Stage 4 · P-002 Water Pump — warning detected');
        simulateWarning('P-002');
      });

      // --- P-002: Critical (32s) ---
      at(32000, () => {
        setDemoLabel('Stage 5 · P-002 — critical fault');
        simulateCritical('P-002');
      });

      // --- T-003: Warning (38s) ---
      at(38000, () => {
        setDemoLabel('Stage 6 · T-003 Transformer — warning detected');
        simulateWarning('T-003');
      });

      // --- E-004: Warning (44s) ---
      at(44000, () => {
        setDemoLabel('Stage 7 · E-004 Control Panel — warning detected');
        simulateWarning('E-004');
      });

      // --- Open inspection for M-001 (50s) ---
      at(50000, () => {
        setDemoLabel('Stage 8 · Smart Inspection — M-001');
        setFocusEquipmentId('M-001');
        navigate('/inspection');
      });

      // --- Auto-submit inspection for M-001 (58s) ---
      at(58000, () => {
        setDemoLabel('Stage 9 · Inspection submitted — M-001 FAIL');
        submitInspection({
          equipmentId: 'M-001',
          inspector: 'Auto-Demo Inspector',
          findings: 'Demo: temperature and vibration exceeded critical thresholds.',
          comments: 'Generated by Full Hackathon Demo.',
          correctiveAction: 'Shut down motor, inspect bearings and cooling system.',
        });
      });

      // --- Auto-submit inspection for P-002 (64s) ---
      at(64000, () => {
        setDemoLabel('Stage 9b · Inspection submitted — P-002');
        submitInspection({
          equipmentId: 'P-002',
          inspector: 'Auto-Demo Inspector',
          findings: 'Demo: pressure and current exceeded critical thresholds.',
          comments: 'Generated by Full Hackathon Demo.',
          correctiveAction: 'Shut down pump, inspect seals and impeller.',
        });
      });

      // --- Reports page (70s) ---
      at(70000, () => {
        setDemoLabel('Stage 10 · Generating inspection report');
        setReportEquipmentId('M-001');
        navigate('/reports');
      });

      // --- Analytics page (80s) ---
      at(80000, () => {
        setDemoLabel('Stage 11 · Analytics — system-wide risk overview');
        navigate('/analytics');
      });

      // --- Reset all to normal (90s) ---
      at(90000, () => {
        setDemoLabel('Stage 12 · Resetting all equipment to normal');
        allIds.forEach((id) => resetToNormal(id));
        navigate('/dashboard');
      });

      // --- Done (100s) ---
      at(100000, () => {
        setDemoLabel(null);
        setDemoRunning(false);
      });
    },
    [demoRunning, resetToNormal, simulateWarning, simulateCritical, submitInspection]
  );

  const value: MonitoringState = {
    equipment,
    alerts,
    activity,
    inspections,
    toasts,
    systemOnline,
    demoRunning,
    demoLabel,
    focusEquipmentId,
    reportEquipmentId,
    toggleSystem,
    simulateWarning,
    simulateCritical,
    resetToNormal,
    resolveAlert,
    dismissToast,
    submitInspection,
    autoAssessInspection,
    startFullDemo,
    setFocusEquipmentId,
    clearReportEquipment,
    addEquipment,
    updateThresholds,
  };

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) throw new Error('useMonitoring must be used within MonitoringProvider');
  return ctx;
}
