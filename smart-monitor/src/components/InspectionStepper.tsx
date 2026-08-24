// =============================================================================
// COMPONENTS / InspectionStepper.tsx
// =============================================================================
// Table-based checklist used inside SmartInspectionPage.
// Each row corresponds to one InspectionCheck (one sensor + a final summary).
// Results are revealed progressively as the `progress` value climbs to 100%:
//   pending → animated with a clock icon until its slot is "reached"
//   pass    → green check
//   warning → amber triangle
//   fail    → red X
// =============================================================================
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { InspectionCheck } from '../types';

const RESULT_STYLES = {
  pass: { icon: CheckCircle2, iconCls: 'text-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'PASS' },
  warning: { icon: AlertTriangle, iconCls: 'text-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'WARN' },
  fail: { icon: XCircle, iconCls: 'text-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'CRITICAL' },
  pending: { icon: Clock, iconCls: 'text-gray-300', badge: 'bg-gray-50 text-gray-400 border-gray-200', label: '–' },
};

export function InspectionStepper({ checks, progress }: { checks: InspectionCheck[]; progress: number }) {
  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1.5">
        <span>Inspection Progress</span>
        <span className="font-mono font-semibold text-blue-600">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checks table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Parameter</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Current</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Threshold</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checks.map((c) => {
              const s = RESULT_STYLES[c.result];
              const Icon = s.icon;
              return (
                <tr key={c.key} className={c.result === 'fail' ? 'bg-red-50/50' : c.result === 'warning' ? 'bg-amber-50/30' : ''}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={s.iconCls} />
                      <span className={`font-medium ${c.result === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                        {c.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm text-gray-700">
                    {c.result !== 'pending' ? c.value ?? '–' : '–'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm text-gray-400">
                    {c.threshold ?? '–'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {c.result !== 'pending' ? s.label : '–'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
