import React from 'react';
import { Power, Bell, Shield, Database, Info } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';

export function SettingsPage() {
  const { systemOnline, toggleSystem, equipment } = useMonitoring();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-gray-900 text-xl">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">System configuration and preferences.</p>
      </div>

      {/* System Monitoring toggle */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Power size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">System Monitoring</div>
            <div className="text-xs text-gray-500">Pause or resume the real-time sensor simulation loop.</div>
          </div>
          <button
            onClick={toggleSystem}
            className={`ml-auto relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-ring ${
              systemOnline ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                systemOnline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${systemOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
          <span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-emerald-500 animate-pulseDot' : 'bg-gray-400'}`} />
          {systemOnline ? 'Simulation running — sensors update every 1.5s' : 'Simulation paused — sensor values frozen'}
        </div>
      </div>

      {/* Notifications (placeholder) */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Notifications</div>
            <div className="text-xs text-gray-500">Configure alert thresholds and notification channels.</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Critical alerts', desc: 'Immediate toast notification' },
            { label: 'Warning alerts', desc: 'Notification after 30s delay' },
            { label: 'Inspection completed', desc: 'Summary notification' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <div className="relative inline-flex h-6 w-10 items-center rounded-full bg-blue-600">
                <span className="inline-block h-4 w-4 rounded-full bg-white shadow-sm translate-x-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitored Equipment */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Database size={16} className="text-gray-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Monitored Equipment</div>
            <div className="text-xs text-gray-500">{equipment.length} assets registered</div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">ID</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden sm:table-cell">Location</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipment.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-blue-600">{e.id}</td>
                  <td className="px-3 py-2.5 text-gray-800 text-xs font-medium">{e.name}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell">{e.location}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      e.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      e.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      e.status === 'Running' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* About */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Info size={16} className="text-gray-600" />
          </div>
          <div className="font-semibold text-gray-900 text-sm">About</div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          IND-CORE Smart Real-Time Monitoring &amp; Inspection System — Inspection v4.2.
          Sensor data is simulated in-browser with a gradual, realistic random-walk model.
          See the Architecture page for how real ESP32 / IoT hardware connects to the same pipeline.
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>React 18 + TypeScript + Vite</span>
        </div>
      </div>
    </div>
  );
}
