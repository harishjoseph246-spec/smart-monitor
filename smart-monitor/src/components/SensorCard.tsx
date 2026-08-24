// =============================================================================
// COMPONENTS / SensorCard.tsx
// =============================================================================
// Card for one live sensor reading.  Used in the Live Monitoring sensor row
// (one card per sensor, 5 total per equipment).
// Shows: label, severity badge, current value + unit, and a sparkline chart.
// Border and background are tinted red/amber when the sensor is abnormal.
// =============================================================================
import React from 'react';
import { SensorReading } from '../types';
import { severityColor, severityLabel } from '../utils/format';
import { LiveChart } from './LiveChart';

const SEV_STYLES = {
  normal: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', value: 'text-gray-900' },
  warning: { badge: 'bg-amber-50 text-amber-700 border-amber-200', value: 'text-amber-600' },
  critical: { badge: 'bg-red-50 text-red-700 border-red-200', value: 'text-red-600' },
};

export function SensorCard({ sensor }: { sensor: SensorReading }) {
  const color = severityColor(sensor.severity);
  const styles = SEV_STYLES[sensor.severity];

  return (
    <div className={`card p-4 ${sensor.severity === 'critical' ? 'border-red-200 bg-red-50/30' : sensor.severity === 'warning' ? 'border-amber-200 bg-amber-50/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow">{sensor.label}</div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${styles.badge}`}>
          {severityLabel(sensor.severity)}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={`font-bold text-3xl font-mono ${styles.value}`}>{sensor.value}</span>
        <span className="text-sm text-gray-400 font-medium">{sensor.unit}</span>
      </div>

      <div className="-mx-1">
        <LiveChart data={sensor.history} color={color} height={48} />
      </div>
    </div>
  );
}
