import { SensorKey, ScenarioTarget } from '../types';

/**
 * Realistic gradual sensor-value simulator.
 *
 * Instead of pure randomness, each tick nudges the value a small step
 * toward a slowly-drifting "target", producing organic curves like
 * 64 -> 65 -> 65.4 -> 66 -> 65.7 rather than noisy jumps.
 *
 * This module stands in for a real IoT gateway. In production the same
 * shape of data (SensorReading ticks) would arrive over MQTT/REST from
 * an ESP32, PLC or RTU — nothing downstream would need to change.
 */

export interface SimState {
  value: number;
  drift: number; // slow-moving wander target offset
}

/**
 * Per-sensor step noise magnitude (controls how "jittery" each reading looks).
 * Smaller = smoother curve. Tuned so the 1.5s tick produces realistic variation.
 */
const STEP_NOISE: Record<SensorKey, number> = {
  temperature: 0.35,
  current: 0.25,
  voltage: 0.6,
  vibration: 0.12,
  pressure: 0.08,
};

/**
 * How fast the slow-moving drift target wanders per tick.
 * Keeps readings "alive" even when no scenario is active.
 */
const DRIFT_SPEED: Record<SensorKey, number> = {
  temperature: 0.06,
  current: 0.08,
  voltage: 0.1,
  vibration: 0.05,
  pressure: 0.04,
};

/** Create the initial simulation state for a sensor starting at its baseline value. */
export function initSimState(baseline: number): SimState {
  return { value: baseline, drift: 0 };
}

/**
 * Advance one tick. If `target` is set (demo scenario active), the value is
 * gently pulled toward that target instead of the normal baseline, so
 * transitions look like a real fault developing rather than snapping.
 */
export function stepSensor(
  key: SensorKey,
  state: SimState,
  baseline: number,
  target?: number
): SimState {
  const pull = target !== undefined ? target : baseline + state.drift;

  // slow random-walk drift around baseline for organic variation
  const nextDrift = target !== undefined
    ? state.drift
    : clamp(state.drift + (Math.random() - 0.5) * DRIFT_SPEED[key], -baseline * 0.06, baseline * 0.06);

  const gap = pull - state.value;
  const step = gap * (target !== undefined ? 0.35 : 0.25) + (Math.random() - 0.5) * STEP_NOISE[key];
  const nextValue = round(state.value + step, key);

  return { value: nextValue, drift: nextDrift };
}

function round(v: number, key: SensorKey): number {
  if (key === 'voltage') return Math.round(v * 10) / 10;
  return Math.round(v * 10) / 10;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Pre-defined sensor target values for each demo scenario mode.
 *   normal   → no override; sensors drift around their equipment baseline
 *   warning  → values nudged to just above warning thresholds
 *   critical → values pushed well above critical thresholds
 * These are partial: only the sensors that should deviate are listed.
 */
export const SCENARIO_TARGETS: Record<'warning' | 'critical' | 'normal', ScenarioTarget> = {
  normal: {},
  warning: { temperature: 85, current: 18, voltage: 235, vibration: 4.5, pressure: 6 },
  critical: { temperature: 105, current: 28, voltage: 270, vibration: 8.2, pressure: 12.5 },
};
