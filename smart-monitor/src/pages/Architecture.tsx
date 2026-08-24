import React from 'react';
import { Search } from 'lucide-react';
import { ArchitectureDiagram, FlowStrip } from '../components/ArchitectureDiagram';
import { useMonitoring } from '../context/MonitoringContext';

export function ArchitecturePage() {
  const { systemOnline } = useMonitoring();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">6-Layer IoT Stack</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Real-time mapping of data flow from physical equipment through edge processing,
            intelligence layers, and up to the presentation layer. Click any layer to expand details.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            systemOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-100 text-gray-500'
          }`}>
            <span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-emerald-500 animate-pulseDot' : 'bg-gray-400'}`} />
            {systemOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </div>
        </div>
      </div>

      {/* Flow strip */}
      <div className="card p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-3">Data Flow Pipeline</div>
        <FlowStrip />
      </div>

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* Extensibility note */}
      <div className="card p-6">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Real-World Extensibility</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          This prototype uses simulated sensor data generated in-browser using a realistic random-walk model.
          In a production deployment, ESP32 modules, PLCs, RTUs, or industrial IoT gateways publish live sensor
          data over MQTT or REST APIs into the same Data Ingestion layer — no changes required to the processing,
          alerting, inspection, or reporting layers above it.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Edge Devices', desc: 'ESP32, Raspberry Pi, PLCs, RTUs' },
            { label: 'Protocols', desc: 'MQTT, OPC-UA, Modbus, REST, WebSocket' },
            { label: 'Cloud Ready', desc: 'AWS IoT, Azure IoT Hub, Google Cloud IoT' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-bold text-gray-700 mb-0.5">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
