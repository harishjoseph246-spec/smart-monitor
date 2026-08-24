import React, { useState } from 'react';
import { Plus, Settings2, X, ChevronDown } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { StatusBadge } from '../components/StatusBadge';
import { HealthGauge } from '../components/HealthGauge';
import { LiveChart } from '../components/LiveChart';
import { Equipment, SensorKey } from '../types';
import { SENSOR_META } from '../rules/thresholds';
import { severityColor } from '../utils/format';

type FilterType = 'All Types' | 'Motors' | 'Pumps' | 'Transformers' | 'Panels';

const TYPE_MAP: Record<FilterType, string[]> = {
  'All Types': [],
  'Motors': ['Motor'],
  'Pumps': ['Pump'],
  'Transformers': ['Transformer'],
  'Panels': ['Control Panel'],
};

export function EquipmentPage() {
  const { equipment } = useMonitoring();
  const [detail, setDetail] = useState<Equipment | null>(null);
  const [filter, setFilter] = useState<FilterType>('All Types');

  const totalAssets = equipment.length;
  const active = equipment.filter((e) => e.status === 'Running' || e.status === 'Idle').length;
  const critical = equipment.filter((e) => e.status === 'Critical').length;
  const maintenanceDue = equipment.filter((e) => e.status === 'Maintenance' || e.health < 60).length;

  const displayed = filter === 'All Types'
    ? equipment
    : equipment.filter((e) => TYPE_MAP[filter].includes(e.type));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Equipment Registry</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all active industrial assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Settings2 size={14} /> Configure Thresholds
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Add New Equipment
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={totalAssets} icon="📦" />
        <StatCard label="Active" value={active} icon="✅" color="text-emerald-600" />
        <StatCard label="Critical" value={critical} icon="⚠️" color="text-red-600" highlight={critical > 0} />
        <StatCard label="Maintenance Due" value={maintenanceDue} icon="🔧" color="text-amber-600" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['All Types', 'Motors', 'Pumps', 'Transformers', 'Panels'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
                filter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            Sort by: Status (Critical First) <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Equipment cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayed.map((eq) => (
          <EquipmentRegistryCard key={eq.id} eq={eq} onView={() => setDetail(eq)} />
        ))}
        {displayed.length === 0 && (
          <div className="col-span-3 card p-12 text-center text-gray-400">
            No equipment of this type found.
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="card max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div>
                <div className="text-xs font-mono font-semibold text-blue-600">{detail.id}</div>
                <div className="font-display font-bold text-gray-900 text-lg">{detail.name}</div>
                <div className="text-sm text-gray-500">{detail.type} · {detail.location}</div>
              </div>
              <div className="ml-auto">
                <StatusBadge status={detail.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <Field label="Manufacturer" value={detail.manufacturer} />
              <Field label="Model" value={detail.model} />
              <Field label="Installed" value={detail.installationDate} />
              <Field label="Last Inspection" value={detail.lastInspection ? new Date(detail.lastInspection).toLocaleDateString() : 'Never'} />
              <Field label="Alert Count" value={String(detail.alertCount)} />
              <Field label="Anomaly Score" value={`${detail.anomalyScore}%`} />
            </div>

            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Threshold Configuration</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Sensor</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Warning</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Critical</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(Object.keys(detail.thresholds) as SensorKey[]).map((k) => {
                      const t = detail.thresholds[k];
                      return (
                        <tr key={k}>
                          <td className="px-3 py-2.5 text-gray-700 font-medium">{SENSOR_META[k].label}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-amber-600">
                            {t.warningHigh}{SENSOR_META[k].unit}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-red-600">
                            {t.criticalHigh}{SENSOR_META[k].unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <HealthGauge score={detail.health} size={56} />
              <div className="flex-1">
                <LiveChart
                  data={detail.sensors.temperature.history}
                  color={severityColor(detail.sensors.temperature.severity)}
                  height={56}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EquipmentRegistryCard({ eq, onView }: { eq: Equipment; onView: () => void }) {
  const isCrit = eq.status === 'Critical';
  const isWarn = eq.status === 'Warning';
  const isOnline = eq.status === 'Running' || eq.status === 'Idle';

  const primaryMetric = (() => {
    if (eq.type === 'Motor' || eq.type === 'Transformer') return { label: 'Key Metrics', sensor: 'vibration' as SensorKey };
    if (eq.type === 'Pump') return { label: 'Key Metrics', sensor: 'pressure' as SensorKey };
    return { label: 'Key Metrics', sensor: 'temperature' as SensorKey };
  })();

  const sensor = eq.sensors[primaryMetric.sensor];

  return (
    <div className={`card p-5 ${isCrit ? 'border-red-200' : isWarn ? 'border-amber-200' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${
            isCrit ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {eq.type.replace('Control Panel', 'Control Panel').toUpperCase() === 'MOTOR' ? '⚡ HEAVY MOTOR' :
             eq.type.toUpperCase() === 'PUMP' ? '💧 CENTRIFUGAL PUMP' :
             eq.type.toUpperCase() === 'TRANSFORMER' ? '⚡ TRANSFORMER' : '📋 CONTROL PANEL'}
          </div>
          <div className="font-display font-bold text-gray-900 text-base">{eq.id}</div>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
          isCrit ? 'bg-red-50 text-red-700 border-red-200' :
          isWarn ? 'bg-amber-50 text-amber-700 border-amber-200' :
          isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {isCrit ? '🔴 CRITICAL' : isWarn ? '🟡 WARNING' : isOnline ? '🟢 ONLINE' : eq.status.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
        <div>
          <div className="text-gray-400 font-medium">Manufacturer</div>
          <div className="text-gray-700 font-semibold">{eq.manufacturer}</div>
        </div>
        <div>
          <div className="text-gray-400 font-medium">Install Date</div>
          <div className="text-gray-700 font-semibold">{eq.installationDate}</div>
        </div>
      </div>

      {/* Key metric */}
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">{primaryMetric.label}</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs font-medium">{sensor?.label?.split(' ')[0] ?? 'Sensor'}</span>
            <span
              className={`ml-2 font-bold font-mono ${
                sensor?.severity === 'critical' ? 'text-red-600' : sensor?.severity === 'warning' ? 'text-amber-600' : 'text-gray-900'
              }`}
            >
              {sensor?.value} <span className="text-xs text-gray-400 font-normal">{sensor?.unit}</span>
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (sensor?.value ?? 0) / (sensor?.key === 'vibration' ? 10 : sensor?.key === 'temperature' ? 120 : sensor?.key === 'pressure' ? 15 : 100) * 100)}%`,
              background: sensor?.severity === 'critical' ? '#ef4444' : sensor?.severity === 'warning' ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
      </div>

      <button
        onClick={onView}
        className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition-colors text-right"
      >
        View Details →
      </button>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'text-gray-900', highlight = false }: {
  label: string; value: number; icon: string; color?: string; highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? 'border-red-200 bg-red-50/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-1">{label}</div>
          <div className={`font-bold text-3xl font-mono ${color}`}>{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${highlight ? 'bg-red-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm text-gray-700 font-medium mt-0.5">{value}</div>
    </div>
  );
}
