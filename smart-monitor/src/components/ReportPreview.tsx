// =============================================================================
// COMPONENTS / ReportPreview.tsx
// =============================================================================
// In-browser HTML preview of the inspection report (mirrors the PDF layout).
// Rendered on the Reports page so the user can review content before generating
// the PDF.  Section visibility matches pdfGenerator.ts:
//   - Equipment info, sensor table, anomaly block always shown.
//   - Checklist, final result, findings, corrective action only if inspection != null.
// =============================================================================
import React from 'react';
import { Equipment, Inspection } from '../types';
import { formatDate } from '../utils/format';
import { SENSOR_META } from '../rules/thresholds';
import { SensorKey } from '../types';

export function ReportPreview({ eq, inspection }: { eq: Equipment; inspection: Inspection | null }) {
  return (
    <div
      id="report-preview"
      className="bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto overflow-hidden"
    >
      {/* Header band */}
      <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mb-1">
            IND-CORE · Inspection v4.2
          </div>
          <h2 className="text-xl font-bold font-display">Inspection Report</h2>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          <div className="font-semibold text-white text-sm">{inspection?.id ?? 'DRAFT'}</div>
          <div className="mt-1">{formatDate(inspection?.date ?? new Date().toISOString())}</div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Equipment info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-100">
          <InfoField label="Equipment ID" value={eq.id} mono />
          <InfoField label="Name" value={eq.name} />
          <InfoField label="Type" value={eq.type} />
          <InfoField label="Location" value={eq.location} />
          <InfoField label="Manufacturer" value={eq.manufacturer} />
          <InfoField label="Model" value={eq.model} />
          <InfoField label="Install Date" value={eq.installationDate} />
          <InfoField
            label="Health Score"
            value={`${eq.health}%`}
            valueColor={eq.health >= 80 ? 'text-emerald-600' : eq.health >= 60 ? 'text-amber-600' : 'text-red-600'}
          />
        </div>

        {/* Sensor readings */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-3">Sensor Readings</div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Parameter</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Value</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(Object.keys(eq.sensors) as SensorKey[]).map((k) => {
                  const s = eq.sensors[k];
                  return (
                    <tr key={k} className={s.severity === 'critical' ? 'bg-red-50' : s.severity === 'warning' ? 'bg-amber-50' : ''}>
                      <td className="px-4 py-3 font-medium text-gray-800">{s.label}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        s.severity === 'critical' ? 'text-red-600' : s.severity === 'warning' ? 'text-amber-600' : 'text-gray-900'
                      }`}>{s.value}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{s.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          s.severity === 'critical'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : s.severity === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {s.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly */}
        <div className={`rounded-xl border p-4 ${
          eq.anomalyScore >= 70
            ? 'bg-red-50 border-red-200'
            : eq.anomalyScore >= 45
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Anomaly Detection</div>
            <span className={`font-bold font-mono text-lg ${
              eq.anomalyScore >= 70 ? 'text-red-600' : eq.anomalyScore >= 45 ? 'text-amber-600' : 'text-gray-900'
            }`}>{eq.anomalyScore}%</span>
          </div>
          {eq.anomalyMessages.length > 0 ? (
            <ul className="text-xs text-gray-600 space-y-1">
              {eq.anomalyMessages.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400" />
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-emerald-600 font-medium">No anomalies detected.</div>
          )}
        </div>

        {/* Inspection checklist */}
        {inspection && (
          <>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-3">Inspection Checklist</div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Check</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inspection.checks.map((c) => (
                      <tr key={c.key} className={
                        c.result === 'fail' ? 'bg-red-50' : c.result === 'warning' ? 'bg-amber-50' : ''
                      }>
                        <td className="px-4 py-2.5 text-gray-700">{c.label}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            c.result === 'fail'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : c.result === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {c.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Result + inspector */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Final Result</div>
                <div className={`font-bold text-xl ${
                  inspection.result === 'FAIL' ? 'text-red-600' : inspection.result === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {inspection.result}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Inspector</div>
                <div className="text-sm font-medium text-gray-800">{inspection.inspector || '—'}</div>
              </div>
            </div>

            {inspection.reasons.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Findings</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {inspection.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400" />
                      {r}
                    </li>
                  ))}
                </ul>
                {inspection.findings && <p className="text-sm text-gray-700 mt-2">{inspection.findings}</p>}
              </div>
            )}

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Corrective Action</div>
              <p className="text-sm text-gray-700">{inspection.correctiveAction || inspection.recommendedAction}</p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center">
          Generated by IND-CORE Smart Monitoring & Inspection System · Prototype uses simulated sensor data
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono, valueColor }: {
  label: string; value: string; mono?: boolean; valueColor?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${mono ? 'font-mono' : ''} ${valueColor ?? 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
