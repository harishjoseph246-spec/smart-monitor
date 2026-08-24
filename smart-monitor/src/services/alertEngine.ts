// =============================================================================
// SERVICES / alertEngine.ts
// =============================================================================
// Converts raw sensor severity transitions into structured Alert objects that
// are stored in MonitoringContext and displayed on the Alerts page.
//
// Two factory functions:
//   buildAlert      → single-sensor alert (one parameter crossed a threshold)
//   buildMultiAlert → multi-sensor alert (3+ sensors abnormal simultaneously)
//
// Called from MonitoringContext.tick() via queueMicrotask so UI updates
// stay batched and don't block the simulation loop.
// =============================================================================
import { Alert, Equipment, Severity, SensorKey } from '../types';
import { SENSOR_META } from '../rules/thresholds';

// Module-level counter gives each alert a unique sequential ID (ALT-0001, ALT-0002 …).
let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

// Standard recommended-action strings keyed by severity, included in every alert.
const ACTIONS: Record<Severity, string> = {
  normal: 'No action required.',
  warning: 'Schedule inspection within 24 hours and monitor trend closely.',
  critical: 'Immediate equipment shutdown and inspection required.',
};

/**
 * Build a single-sensor Alert when one parameter crosses its warning or critical threshold.
 * @param eq        The equipment that triggered the alert.
 * @param key       Which sensor exceeded its limit.
 * @param severity  'warning' or 'critical' — never 'normal'.
 * @param value     The sensor value at the moment of threshold crossing.
 * @param threshold The exact threshold value that was exceeded.
 */
export function buildAlert(
  eq: Equipment,
  key: SensorKey,
  severity: Severity,
  value: number,
  threshold: number
): Alert {
  const meta = SENSOR_META[key];
  const label = severity === 'critical' ? 'CRITICAL' : 'WARNING';
  return {
    id: nextId('ALT'),
    equipmentId: eq.id,
    equipmentName: eq.name,
    parameter: key,
    value,
    threshold,
    severity,
    timestamp: new Date().toISOString(),
    status: 'Open',
    recommendedAction: ACTIONS[severity],
    message: `${label}: ${meta.label} on ${eq.id} is ${value}${meta.unit} (threshold ${threshold}${meta.unit}).`,
  };
}

/**
 * Build a multi-sensor Alert when 3+ parameters are abnormal simultaneously.
 * Uses `parameter: 'multi'` and null value/threshold since no single sensor is responsible.
 */
export function buildMultiAlert(eq: Equipment, severity: Severity): Alert {
  return {
    id: nextId('ALT'),
    equipmentId: eq.id,
    equipmentName: eq.name,
    parameter: 'multi',
    value: null,
    threshold: null,
    severity,
    timestamp: new Date().toISOString(),
    status: 'Open',
    recommendedAction: ACTIONS[severity],
    message: `${severity === 'critical' ? 'CRITICAL CONDITION DETECTED' : 'Warning'}: Multiple abnormal parameters on ${eq.id}. ${severity === 'critical' ? 'Immediate inspection required.' : ''}`,
  };
}
