// =============================================================================
// COMPONENTS / AlertCard.tsx
// =============================================================================
// Card representation of a single Alert, used in list views.
// Shows severity icon, equipment ID, alert message, recommended action,
// relative timestamp, and an ACK/REVIEW button for open alerts.
// =============================================================================
import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Alert } from '../types';
import { timeAgo } from '../utils/format';

/**
 * @param alert      The alert to display.
 * @param onResolve  Callback fired when the user clicks ACK/REVIEW — marks alert Resolved.
 */
export function AlertCard({ alert, onResolve }: { alert: Alert; onResolve: (id: string) => void }) {
  const isCrit = alert.severity === 'critical';
  const isWarn = alert.severity === 'warning';

  return (
    <div
      className={`card p-4 animate-rise ${
        isCrit && alert.status === 'Open'
          ? 'border-red-200 bg-red-50/30'
          : isWarn && alert.status === 'Open'
          ? 'border-amber-200 bg-amber-50/20'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div
          className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${
            isCrit ? 'bg-red-100 text-red-600' : isWarn ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          {isCrit || isWarn ? <AlertTriangle size={17} /> : <Info size={17} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold text-blue-600">{alert.id}</span>
            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{alert.equipmentId}</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                isCrit
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isWarn
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {alert.severity}
            </span>
            {alert.status === 'Resolved' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Resolved
              </span>
            )}
          </div>

          <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium">Action:</span> {alert.recommendedAction}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{timeAgo(alert.timestamp)}</span>
            {alert.status === 'Open' && (
              <button
                onClick={() => onResolve(alert.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors focus-ring ${
                  isCrit
                    ? 'border-red-200 text-red-700 hover:bg-red-50'
                    : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
              >
                {isCrit ? 'REVIEW' : 'ACK'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
