import { Equipment, SensorKey } from '../types';
import { evaluateSeverity } from '../rules/thresholds';

/**
 * SMART ANOMALY ENGINE
 *
 * For this prototype, anomaly detection is rule-based and statistical:
 * it looks at rate-of-change against recent history and deviation from
 * each sensor's configured thresholds. No trained ML model is used or
 * claimed. The interface (equipment -> {score, messages}) is shaped so
 * a real trained model (e.g. an isolation forest or LSTM over the same
 * sensor history) could be swapped in later without touching callers.
 */
export interface AnomalyResult {
  score: number; // 0-100
  messages: string[];
  risk: 'Low' | 'Moderate' | 'High' | 'Severe';
}

/**
 * Compute rate-of-change over the last 4 history points.
 * Returns the raw delta (positive = rising, negative = falling).
 * Used to detect rapid spikes that aren't yet above the threshold.
 */
function rateOfChange(history: { t: number; v: number }[]): number {
  if (history.length < 4) return 0;
  const recent = history.slice(-4);
  const delta = recent[recent.length - 1].v - recent[0].v;
  return delta;
}

/**
 * Score breakdown (additive):
 *   +14 per sensor in warning state
 *   +30 per sensor in critical state
 *   +12 if a rapid temperature rise is detected (roc > 6°C)
 *   +10 if a current spike is detected (roc > 4A)
 *   +8  for abnormal vibration
 *   +8  for voltage fluctuation
 *   +6  for pressure abnormality
 *   +18 if 3+ sensors are simultaneously abnormal
 * Final score is clamped to [0, 100].
 */
export function detectAnomalies(eq: Equipment): AnomalyResult {
  const keys = Object.keys(eq.sensors) as SensorKey[];
  const messages: string[] = [];
  let score = 0;
  let abnormal = 0;

  for (const key of keys) {
    const sensor = eq.sensors[key];
    const sev = evaluateSeverity(sensor.value, eq.thresholds[key]);
    const roc = rateOfChange(sensor.history);

    if (sev !== 'normal') {
      abnormal++;
      score += sev === 'critical' ? 30 : 14;
    }

    if (key === 'temperature' && roc > 6) {
      score += 12;
      messages.push('Potential overheating detected — rapid temperature rise.');
    }
    if (key === 'current' && roc > 4) {
      score += 10;
      messages.push('Current spike detected beyond normal ramp rate.');
    }
    if (key === 'vibration' && sev !== 'normal') {
      score += 8;
      messages.push('Abnormal vibration pattern detected.');
    }
    if (key === 'voltage' && sev !== 'normal') {
      score += 8;
      messages.push('Voltage fluctuation outside stable band.');
    }
    if (key === 'pressure' && sev !== 'normal') {
      score += 6;
      messages.push('Pressure abnormality detected.');
    }
  }

  if (abnormal >= 3) {
    score += 18;
    messages.push('Multiple sensor abnormalities detected simultaneously.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (messages.length === 0 && score === 0) {
    messages.push('No unusual sensor trends — all parameters within statistical norm.');
  }

  const risk: AnomalyResult['risk'] =
    score >= 70 ? 'Severe' : score >= 45 ? 'High' : score >= 20 ? 'Moderate' : 'Low';

  return { score, messages: Array.from(new Set(messages)), risk };
}
