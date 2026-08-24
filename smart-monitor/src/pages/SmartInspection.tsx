import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Send, Save, History } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { InspectionStepper } from '../components/InspectionStepper';
import { StatusBadge } from '../components/StatusBadge';
import { Inspection } from '../types';

export function SmartInspectionPage() {
  const { equipment, focusEquipmentId, autoAssessInspection, submitInspection } = useMonitoring();
  const [selected, setSelected] = useState(focusEquipmentId ?? equipment[0]?.id);
  const [progress, setProgress] = useState(0);
  const [inspector, setInspector] = useState('TECH-4892 (J. Doe)');
  const [observations, setObservations] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState<'monitor' | 'schedule' | 'shutdown'>('monitor');
  const [submitted, setSubmitted] = useState<Inspection | null>(null);

  useEffect(() => {
    if (focusEquipmentId) setSelected(focusEquipmentId);
  }, [focusEquipmentId]);

  useEffect(() => {
    setProgress(0);
    setSubmitted(null);
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? (clearInterval(timer), 100) : p + 20));
    }, 350);
    return () => clearInterval(timer);
  }, [selected]);

  const eq = equipment.find((e) => e.id === selected) ?? equipment[0];
  const assessment = useMemo(() => (eq ? autoAssessInspection(eq.id) : null), [eq, autoAssessInspection]);

  if (!eq || !assessment) return null;

  const checksShown = assessment.checks.map((c, i) => ({
    ...c,
    result: progress >= (i + 1) * (100 / assessment.checks.length) ? c.result : ('pending' as const),
  }));

  // Auto-select recommended action based on assessment
  const recommendedAction: 'monitor' | 'schedule' | 'shutdown' =
    assessment.result === 'FAIL' ? 'schedule' : assessment.result === 'WARNING' ? 'schedule' : 'monitor';

  const handleSubmit = () => {
    const inspection = submitInspection({
      equipmentId: eq.id,
      inspector,
      findings: observations,
      comments: '',
      correctiveAction:
        correctiveAction === 'shutdown'
          ? 'Immediate Shutdown'
          : correctiveAction === 'schedule'
          ? 'Schedule Maintenance (High Priority)'
          : 'Continue Operation (Monitor)',
    });
    setSubmitted(inspection);
  };

  const handleSaveDraft = () => {
    alert('Draft saved locally.');
  };

  // Stepper steps
  const steps = [
    { label: 'Parameter Check', done: progress >= 33 },
    { label: 'Visual Findings', done: progress >= 66, active: progress >= 33 && progress < 100 },
    { label: 'Final Assessment', done: progress >= 100, active: progress >= 66 && progress < 100 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Inspection Workflow</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span>Asset ID:</span>
            <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">{eq.id}</span>
            <span>({eq.name})</span>
          </div>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <History size={14} /> View Past Inspections
        </button>
      </div>

      {/* Equipment pills */}
      <div className="flex flex-wrap gap-2">
        {equipment.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-ring ${
              e.id === selected
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                e.status === 'Critical' ? 'bg-red-500 animate-pulseDot' : e.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {e.id}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Inspection progress */}
        <div className="space-y-4">
          {/* Progress stepper */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Current Progress</h3>
            <div className="flex items-center gap-3 mb-6">
              {steps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                        step.done
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : step.active
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ${
                      step.done ? 'text-blue-700' : step.active ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 rounded-full transition-colors ${step.done ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <InspectionStepper checks={checksShown} progress={progress} />

            {/* Result card */}
            {progress >= 100 && (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  assessment.result === 'FAIL'
                    ? 'border-red-200 bg-red-50'
                    : assessment.result === 'WARNING'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Inspection Result</div>
                <div
                  className={`font-display text-2xl font-bold mb-2 ${
                    assessment.result === 'FAIL' ? 'text-red-600' : assessment.result === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {assessment.result}
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {assessment.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400" />
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-semibold">Recommended:</span> {assessment.recommendedAction}
                </div>
              </div>
            )}
          </div>

          {/* Vibration trend + peak value */}
          {progress >= 50 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                  Vibration Trend (24H)
                </div>
                <div className="flex items-end gap-1 h-14">
                  {eq.sensors.vibration.history.slice(-8).map((pt, i) => {
                    const maxV = Math.max(...eq.sensors.vibration.history.slice(-8).map((x) => x.v), 1);
                    const pct = (pt.v / maxV) * 100;
                    const isCrit = pt.v >= (eq.thresholds.vibration?.criticalHigh ?? 6);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${Math.max(10, pct)}%`,
                          background: isCrit ? '#ef4444' : i >= 5 ? '#6366f1' : '#e5e7eb',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={`card p-4 ${eq.sensors.vibration.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Peak Value</div>
                <div className={`font-bold text-3xl font-mono ${eq.sensors.vibration.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                  {eq.sensors.vibration.value}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {eq.sensors.vibration.severity !== 'normal' ? (
                    <>Exceeds threshold by{' '}
                      <span className="font-semibold text-red-600">
                        {Math.max(0, eq.sensors.vibration.value - (eq.thresholds.vibration?.warningHigh ?? 3)).toFixed(1)}{eq.sensors.vibration.unit}
                      </span>
                      {'. Immediate inspection required.'}
                    </>
                  ) : 'Within normal range.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Inspector input */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardCheck size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Inspector Input</h3>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div className="font-semibold text-emerald-700">Inspection Submitted</div>
              <div className="text-sm text-gray-500">
                Inspection <span className="font-mono font-semibold text-blue-600">{submitted.id}</span> recorded for {eq.id}.
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Head to Reports to generate the PDF, or Inspection History to view the full log.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Inspector ID */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Inspector ID / Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🪪</span>
                  <input
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="TECH-ID (Name)"
                    className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {/* Visual Observations */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Visual Observations</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detail any visible wear, leaks, or anomalies observed during the physical inspection..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors resize-none"
                />
                <div className="flex justify-end text-[10px] text-gray-400 mt-1">{observations.length} / 500</div>
              </div>

              {/* Recommended Action */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Recommended Action</label>
                <div className="space-y-2">
                  {([
                    { key: 'monitor', label: 'Continue Operation (Monitor)' },
                    { key: 'schedule', label: 'Schedule Maintenance (High Priority)' },
                    { key: 'shutdown', label: 'Immediate Shutdown' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                        correctiveAction === opt.key
                          ? opt.key === 'shutdown'
                            ? 'border-red-400 bg-red-50'
                            : opt.key === 'schedule'
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="action"
                        value={opt.key}
                        checked={correctiveAction === opt.key}
                        onChange={() => setCorrectiveAction(opt.key)}
                        className="accent-blue-600"
                      />
                      <span
                        className={`text-sm font-medium ${
                          correctiveAction === opt.key
                            ? opt.key === 'shutdown'
                              ? 'text-red-700'
                              : opt.key === 'schedule'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Save Draft
                </button>
                <button
                  disabled={progress < 100}
                  onClick={handleSubmit}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Assessment <Send size={13} />
                </button>
              </div>
              {progress < 100 && (
                <p className="text-xs text-gray-400 text-center">Waiting for automated checks to complete…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
