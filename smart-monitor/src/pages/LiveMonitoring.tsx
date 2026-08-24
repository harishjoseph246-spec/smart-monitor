import React, { useEffect, useState } from 'react';
import { Radio, Settings, Clock } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { SensorCard } from '../components/SensorCard';
import { StatusBadge } from '../components/StatusBadge';
import { HealthGauge } from '../components/HealthGauge';
import { AnomalyCard } from '../components/AnomalyCard';
import { LiveChart } from '../components/LiveChart';
import { severityColor } from '../utils/format';
import { SensorKey } from '../types';

type TimeRange = '1H' | '15M' | 'LIVE';

export function LiveMonitoring() {
  const { equipment, focusEquipmentId, setFocusEquipmentId } = useMonitoring();
  const [selected, setSelected] = useState(focusEquipmentId ?? equipment[0]?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>('LIVE');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (focusEquipmentId) setSelected(focusEquipmentId);
  }, [focusEquipmentId]);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const eq = equipment.find((e) => e.id === selected) ?? equipment[0];
  if (!eq) return null;

  const syncMs = tick % 2 === 0 ? 100 : 150;

  return (
    <div className="space-y-5">
      {/* Equipment selector pills */}
      <div className="flex flex-wrap items-center gap-2">
        {equipment.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setSelected(e.id);
              setFocusEquipmentId(e.id);
            }}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-ring ${
              e.id === selected
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                e.status === 'Critical'
                  ? 'bg-red-500 animate-pulseDot'
                  : e.status === 'Warning'
                  ? 'bg-amber-500 animate-pulseDot'
                  : 'bg-emerald-500'
              }`}
            />
            {e.id} — {e.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* Equipment header card */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HealthGauge score={eq.health} size={72} />
            <div>
              <div className="text-xs font-mono font-semibold text-blue-600 mb-0.5">{eq.id}</div>
              <div className="font-display font-bold text-gray-900 text-lg leading-tight">{eq.name}</div>
              <div className="text-xs text-gray-500 mb-2">{eq.location}</div>
              <StatusBadge status={eq.status} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Radio size={12} className="animate-pulseDot" />
              Sync: {syncMs}ms
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {(['1H', '15M', 'LIVE'] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus-ring ${
                    timeRange === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus-ring">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Sensor cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {(Object.keys(eq.sensors) as SensorKey[]).map((k) => (
          <SensorCard key={k} sensor={eq.sensors[k]} />
        ))}
      </div>

      {/* Live Analytics + Anomaly Engine */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">Live Sensor Analytics</h3>
              <p className="text-xs text-gray-500 mt-0.5">Real-time telemetry and historical correlation</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={13} />
              Updated {tick % 3 === 0 ? '0.4' : tick % 3 === 1 ? '0.9' : '1.4'}s ago
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {(Object.keys(eq.sensors) as SensorKey[]).map((k) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    {eq.sensors[k].label}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      eq.sensors[k].severity === 'critical'
                        ? 'text-red-600'
                        : eq.sensors[k].severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {eq.sensors[k].value}
                    <span className="text-xs text-gray-400 font-normal ml-0.5">{eq.sensors[k].unit}</span>
                  </span>
                </div>
                <LiveChart
                  data={eq.sensors[k].history}
                  color={severityColor(eq.sensors[k].severity)}
                  height={80}
                  showAxes
                  unit={eq.sensors[k].unit}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <AnomalyCard eq={eq} />
        </div>
      </div>
    </div>
  );
}
