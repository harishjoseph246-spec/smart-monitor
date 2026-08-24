// =============================================================================
// RULES / thresholds.ts
// =============================================================================
// Single source of truth for all sensor threshold values and severity logic.
//
// Design intent:
//   - No threshold values are hard-coded inside UI components.
//   - Each Equipment gets its own deep-copy of DEFAULT_THRESHOLDS so per-asset
//     limits can be adjusted without affecting other equipment.
//   - evaluateSeverity() is called every simulation tick (in MonitoringContext)
//     and by the anomaly / health engines — keep it fast and pure.
// =============================================================================
import { EquipmentThresholdSet, Severity, SensorKey, Thresholds } from '../types';

/**
 * Centralized rule engine configuration.
 * Thresholds are NOT hard-coded inside UI components — every component
 * reads from this service so limits can be changed per-equipment without
 * touching presentation code.
 */
/**
 * Default warning / critical limits applied to every new equipment asset.
 * Units: temperature=°C, current=A, voltage=V, vibration=mm/s, pressure=bar.
 * Voltage has both high and low bounds; the others are high-only.
 */
export const DEFAULT_THRESHOLDS: EquipmentThresholdSet = {
  temperature: { warningHigh: 75, criticalHigh: 90 },
  current: { warningHigh: 15, criticalHigh: 20 },
  voltage: { warningLow: 210, warningHigh: 250, criticalLow: 190, criticalHigh: 265 },
  vibration: { warningHigh: 3, criticalHigh: 6 },
  pressure: { warningHigh: 8, criticalHigh: 11 },
};

/** Deep-clone the defaults so each Equipment instance owns independent thresholds. */
export function cloneDefaultThresholds(): EquipmentThresholdSet {
  return JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS));
}

/** Evaluate a single sensor value against its configured thresholds. */
export function evaluateSeverity(value: number, t: Thresholds): Severity {
  if (t.criticalLow !== undefined && value < t.criticalLow) return 'critical';
  if (value > t.criticalHigh) return 'critical';
  if (t.warningLow !== undefined && value < t.warningLow) return 'warning';
  if (value > t.warningHigh) return 'warning';
  return 'normal';
}

/**
 * Display metadata for each sensor: human-readable label and SI unit string.
 * Used by alert messages, PDF reports, and the InspectionStepper table header.
 */
export const SENSOR_META: Record<SensorKey, { label: string; unit: string }> = {
  temperature: { label: 'Temperature', unit: '°C' },
  current: { label: 'Current', unit: 'A' },
  voltage: { label: 'Voltage', unit: 'V' },
  vibration: { label: 'Vibration', unit: 'mm/s' },
  pressure: { label: 'Pressure', unit: 'bar' },
};

/** Numeric rank used to compare two Severity values: normal=0, warning=1, critical=2. */
export function severityRank(s: Severity): number {
  return s === 'critical' ? 2 : s === 'warning' ? 1 : 0;
}

/** Reduce a list of severities to the single worst one. Used to derive Equipment.status. */
export function worstSeverity(list: Severity[]): Severity {
  return list.reduce<Severity>((acc, s) => (severityRank(s) > severityRank(acc) ? s : acc), 'normal');
}
