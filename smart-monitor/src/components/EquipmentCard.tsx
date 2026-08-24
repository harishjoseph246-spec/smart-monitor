// =============================================================================
// COMPONENTS / EquipmentCard.tsx
// =============================================================================
// Summary card for one Equipment asset shown in the Dashboard equipment grid.
// Clicking it navigates to Live Monitoring with that equipment pre-selected
// (sets focusEquipmentId in context).
//
// Shows: name, ID, status dot, health score + gauge, key sensor readings,
// and a temperature sparkline at the bottom.
// =============================================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Equipment } from '../types';
import { StatusBadge } from './StatusBadge';
import { HealthGauge } from './HealthGauge';
import { LiveChart } from './LiveChart';
import { severityColor } from '../utils/format';
import { useMonitoring } from '../context/MonitoringContext';

export function EquipmentCard({ eq }: { eq: Equipment }) {
  const navigate = useNavigate();
  const { setFocusEquipmentId } = useMonitoring();

  // Navigate to Live Monitoring and pre-select this equipment.
  const handleClick = () => {
    setFocusEquipmentId(eq.id);
    navigate('/live-monitoring');
  };

  const isCritical = eq.status === 'Critical';
  const isWarning = eq.status === 'Warning';

  return (
    <div
      className={`card p-5 cursor-pointer hover:shadow-md transition-all animate-rise ${
        isCritical
          ? 'border-red-200 bg-red-50/30'
          : isWarning
          ? 'border-amber-200 bg-amber-50/20'
          : ''
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 mt-0.5 ${
              isCritical
                ? 'bg-red-500 animate-pulseDot'
                : isWarning
                ? 'bg-amber-500 animate-pulseDot'
                : 'bg-emerald-500'
            }`}
          />
          <div>
            <div className="font-semibold text-gray-900 text-sm">{eq.name}</div>
            <div className="text-xs text-gray-500 font-mono">{eq.id}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isCritical || isWarning) && (
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isCritical
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {eq.status}
            </span>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Health Score */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <div className="eyebrow mb-0.5">Health Score</div>
          <div
            className={`font-bold text-3xl font-mono ${
              isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-900'
            }`}
          >
            {eq.health}
            <span className="text-lg text-gray-400">%</span>
          </div>
        </div>
        <div className="ml-auto">
          <HealthGauge score={eq.health} size={60} />
        </div>
      </div>

      {/* Sensor grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        {(['temperature', 'vibration', 'current', 'pressure'] as const).map((key) => {
          const s = eq.sensors[key];
          if (!s) return null;
          const isAbnormal = s.severity !== 'normal';
          return (
            <div key={key}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  isAbnormal ? (s.severity === 'critical' ? 'text-red-500' : 'text-amber-500') : 'text-gray-500'
                }`}
              >
                {s.label.split(' ')[0]}
              </div>
              <div
                className={`font-semibold font-mono text-sm ${
                  isAbnormal ? (s.severity === 'critical' ? 'text-red-600' : 'text-amber-600') : 'text-gray-900'
                }`}
              >
                {s.value} <span className="text-gray-400 font-normal text-xs">{s.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sparkline */}
      <div className="h-12 -mx-1">
        <LiveChart
          data={eq.sensors.temperature.history}
          color={isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6'}
          height={48}
        />
      </div>
    </div>
  );
}
