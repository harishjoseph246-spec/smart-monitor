// =============================================================================
// COMPONENTS / HealthGauge.tsx
// =============================================================================
// SVG circular gauge that visualises the 0–100 health score.
// The stroke colour and band label are derived from healthColor() / healthBand()
// in healthEngine.ts so the gauge is always in sync with the computed score.
//
// @param score  0–100 health score from computeHealth().
// @param size   Diameter in px (default 96).  Stroke width scales with size.
// =============================================================================
import React from 'react';
import { healthBand, healthColor } from '../services/healthEngine';

export function HealthGauge({ score, size = 96 }: { score: number; size?: number }) {
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = healthColor(score);
  const band = healthBand(score);

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="#e5e7eb" strokeWidth={stroke} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={stroke} fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold font-mono leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {score}
          </span>
          <span className="text-gray-400 font-mono" style={{ fontSize: size * 0.1 }}>%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
        {band}
      </span>
    </div>
  );
}
