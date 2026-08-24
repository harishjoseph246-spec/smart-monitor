// =============================================================================
// COMPONENTS / AnomalyCard.tsx
// =============================================================================
// Displays the anomaly engine result for one piece of equipment:
//   - A circular SVG risk gauge (0–100, colour-coded by band)
//   - A labelled progress bar
//   - "Attention Required" banner when score ≥ 45
//   - Diagnostic messages from detectAnomalies()
// Used on the Live Monitoring page alongside the sensor charts.
// =============================================================================
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Equipment } from '../types';

// Returns Tailwind colour classes based on the anomaly score band.
function riskColor(score: number) {
  if (score >= 70) return { text: 'text-red-600', bg: 'bg-red-500', light: 'bg-red-50', border: 'border-red-200', btn: 'bg-red-600 hover:bg-red-700' };
  if (score >= 45) return { text: 'text-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700' };
  if (score >= 20) return { text: 'text-blue-600', bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' };
  return { text: 'text-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' };
}

function riskLabel(score: number) {
  if (score >= 70) return 'Severe Risk';
  if (score >= 45) return 'High Risk';
  if (score >= 20) return 'Moderate Risk';
  return 'Low Risk';
}

export function AnomalyCard({ eq }: { eq: Equipment }) {
  const colors = riskColor(eq.anomalyScore);
  const isHighRisk = eq.anomalyScore >= 45;

  return (
    <div className={`card p-5 ${isHighRisk ? `${colors.light} ${colors.border}` : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg ${colors.light} flex items-center justify-center`}>
            <AlertCircle size={16} className={colors.text} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Anomaly Engine</div>
            <div className="text-xs text-gray-500">{eq.id}</div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Info size={15} />
        </button>
      </div>

      {/* Risk gauge */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="52" stroke="#e5e7eb" strokeWidth="10" fill="none" />
            <circle
              cx="64" cy="64" r="52"
              stroke={eq.anomalyScore >= 70 ? '#ef4444' : eq.anomalyScore >= 45 ? '#f59e0b' : eq.anomalyScore >= 20 ? '#3b82f6' : '#10b981'}
              strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(eq.anomalyScore / 100) * 327} 327`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Risk Index</span>
            <span className={`text-3xl font-bold font-mono ${colors.text}`}>{eq.anomalyScore}</span>
            <span className={`text-[10px] font-bold uppercase ${colors.text}`}>{riskLabel(eq.anomalyScore)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
            style={{ width: `${eq.anomalyScore}%` }}
          />
        </div>
      </div>

      {/* Alert banner */}
      {isHighRisk && (
        <div className={`flex items-center gap-2 rounded-lg ${colors.light} border ${colors.border} px-3 py-2 mb-3`}>
          <AlertCircle size={14} className={colors.text} />
          <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
            Attention Required
          </span>
        </div>
      )}

      {/* Messages */}
      {eq.anomalyMessages.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Diagnostics</div>
          {eq.anomalyMessages.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${colors.bg}`} />
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
