// =============================================================================
// COMPONENTS / ArchitectureDiagram.tsx
// =============================================================================
// Renders the interactive 6-layer IoT architecture diagram shown on the
// Architecture page.  Each layer is an accordion card with:
//   - Layer ID, icon, title, protocols, and latency in the collapsed header
//   - Description, optional task badges, and an efficacy progress bar when expanded
//
// FlowStrip renders the linear data-flow pipeline ("Live Data → … → Report")
// shown above the diagram.
// =============================================================================
import React, { useState } from 'react';
import { Cpu, Database, Gauge, Layers, Radio, MonitorSmartphone, ChevronDown, ChevronUp } from 'lucide-react';

const LAYERS = [
  {
    id: 'L1',
    icon: Layers,
    title: 'Physical Edge',
    label: 'L1: PHYSICAL EDGE',
    desc: 'Industrial machines, motors, pumps, transformers, control panels',
    protocols: 'Modbus, OPC-UA',
    latency: '~5ms',
    efficacy: 92,
    color: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', text: 'text-blue-600' },
  },
  {
    id: 'L2',
    icon: Gauge,
    title: 'Sensor Layer',
    label: 'L2: SENSOR LAYER',
    desc: 'Temperature · Current · Voltage · Vibration · Pressure sensors',
    protocols: 'I²C, SPI, Analog',
    latency: '~2ms',
    efficacy: 98,
    color: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', bar: 'bg-indigo-500', text: 'text-indigo-600' },
  },
  {
    id: 'L3',
    icon: Radio,
    title: 'Edge Gateway',
    label: 'L3: EDGE GATEWAY',
    desc: 'Data aggregation, protocol conversion, local buffering',
    protocols: 'MQTT, REST',
    latency: '~12ms',
    efficacy: 95,
    tasks: ['Data Aggregation', 'Protocol Conv.', 'Local Buffering'],
    color: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500', text: 'text-violet-600' },
  },
  {
    id: 'L4',
    icon: Cpu,
    title: 'Processing & Intelligence',
    label: 'L4: INTELLIGENCE',
    desc: 'Real-time processing, rule engine, anomaly detection, health scoring',
    protocols: 'WebSocket, gRPC',
    latency: '~18ms',
    efficacy: 97,
    color: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500', text: 'text-purple-600' },
  },
  {
    id: 'L5',
    icon: Database,
    title: 'Data & Alert Services',
    label: 'L5: SERVICES',
    desc: 'Alert engine, notification service, inspection engine, report generation',
    protocols: 'REST, Webhooks',
    latency: '~25ms',
    efficacy: 99,
    color: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100 text-pink-600', bar: 'bg-pink-500', text: 'text-pink-600' },
  },
  {
    id: 'L6',
    icon: MonitorSmartphone,
    title: 'Web Application',
    label: 'L6: PRESENTATION',
    desc: 'Dashboard, live monitoring, smart inspection, analytics, alerts, reports',
    protocols: 'HTTPS, PWA',
    latency: '~30ms',
    efficacy: 100,
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  },
];

export function ArchitectureDiagram() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {LAYERS.map((layer) => {
        const Icon = layer.icon;
        const isOpen = expanded === layer.id;
        return (
          <div
            key={layer.id}
            className={`card border ${layer.color.border} ${layer.color.bg} overflow-hidden transition-all`}
          >
            <button
              className="w-full p-4 flex items-center gap-4 text-left"
              onClick={() => setExpanded(isOpen ? null : layer.id)}
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${layer.color.icon}`}>
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-bold uppercase tracking-widest ${layer.color.text} mb-0.5`}>
                  {layer.label}
                </div>
                <div className="font-semibold text-gray-900 text-sm">{layer.title}</div>
              </div>
              <div className="hidden sm:flex items-center gap-6 mr-4">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Protocols</div>
                  <div className="text-xs font-semibold text-gray-700">{layer.protocols}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Latency</div>
                  <div className={`text-xs font-bold font-mono ${layer.color.text}`}>{layer.latency}</div>
                </div>
              </div>
              {isOpen ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-white/60">
                <p className="text-sm text-gray-600 mt-3 mb-3">{layer.desc}</p>
                {layer.tasks && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {layer.tasks.map((t) => (
                      <span key={t} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${layer.color.border} ${layer.color.text} bg-white`}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                    <span>Efficacy</span>
                    <span className={layer.color.text}>{layer.efficacy}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white overflow-hidden">
                    <div
                      className={`h-full rounded-full ${layer.color.bar}`}
                      style={{ width: `${layer.efficacy}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FlowStrip() {
  const stages = ['Live Data', 'Smart Analysis', 'Anomaly Detection', 'Alert', 'Inspection', 'Action', 'Report'];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map((s, i) => (
        <React.Fragment key={s}>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            {s}
          </span>
          {i < stages.length - 1 && <span className="text-gray-400 text-xs">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
