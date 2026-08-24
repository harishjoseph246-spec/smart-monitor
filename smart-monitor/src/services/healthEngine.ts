// =============================================================================
// SERVICES / healthEngine.ts
// =============================================================================
// Computes a 0–100 "health score" for each Equipment based on its current
// sensor severities. The score drives the HealthGauge component and the
// equipment status badge color.
//
// Penalty model (subtracted from 100):
//   -8  per sensor in warning state
//   -22 per sensor in critical state
//   -6  bonus penalty if exactly 2 sensors are abnormal simultaneously
//   -12 bonus penalty if 3+ sensors are abnormal simultaneously
// Final score is clamped to [2, 100] so gauges never show zero.
// =============================================================================
import { Equipment, Severity, SensorKey } from '../types';
import { evaluateSeverity } from '../rules/thresholds';

export type HealthBand = 'Excellent' | 'Good' | 'Warning' | 'Critical';

/** Map a health score to a plain-English band label shown below the HealthGauge. */
export function healthBand(score: number): HealthBand {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Warning';
  return 'Critical';
}

/** Map a health score to a colour hex string used by HealthGauge and chart strokes. */
export function healthColor(score: number): string {
  if (score >= 90) return '#22C55E';
  if (score >= 75) return '#5B9BFF';
  if (score >= 50) return '#F5A623';
  return '#EF4444';
}

/**
 * Compute an overall health score (0-100) from current sensor severities.
 * Each sensor contributes a penalty based on how far it is past its
 * threshold; critical sensors are weighted more heavily and multiple
 * simultaneous abnormal parameters compound the penalty.
 */
export function computeHealth(eq: Equipment): number {
  const keys = Object.keys(eq.sensors) as SensorKey[];
  let penalty = 0;
  let abnormalCount = 0;

  for (const key of keys) {
    const sensor = eq.sensors[key];
    const t = eq.thresholds[key];
    const sev: Severity = evaluateSeverity(sensor.value, t);
    if (sev === 'warning') {
      penalty += 8;
      abnormalCount++;
    } else if (sev === 'critical') {
      penalty += 22;
      abnormalCount++;
    }
  }

  if (abnormalCount >= 3) penalty += 12; // multiple simultaneous abnormalities
  else if (abnormalCount === 2) penalty += 6;

  const score = Math.max(2, Math.min(100, Math.round(100 - penalty)));
  return score;
}

/**
 * Derive Equipment.status from the worst current sensor severity.
 * Called every tick after computeHealth() to keep the status badge in sync.
 */
export function statusFromHealthAndSeverity(worst: Severity): Equipment['status'] {
  if (worst === 'critical') return 'Critical';
  if (worst === 'warning') return 'Warning';
  return 'Running';
}
