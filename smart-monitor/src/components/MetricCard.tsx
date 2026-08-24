// =============================================================================
// COMPONENTS / MetricCard.tsx
// =============================================================================
// KPI summary card used in the Dashboard top row.
// Displays a label, large numeric value, optional sub-text, and a tinted icon.
// Supports an optional onClick for navigation (e.g. clicking "Active Warnings"
// navigates to the Alerts page).
// =============================================================================
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'good' | 'warn' | 'crit' | 'electric';
  sub?: string;
  onClick?: () => void;
}

const ICON_STYLES: Record<string, string> = {
  default: 'bg-gray-100 text-gray-500',
  good: 'bg-emerald-100 text-emerald-600',
  warn: 'bg-amber-100 text-amber-600',
  crit: 'bg-red-100 text-red-600',
  electric: 'bg-blue-100 text-blue-600',
};

const VALUE_STYLES: Record<string, string> = {
  default: 'text-gray-900',
  good: 'text-gray-900',
  warn: 'text-amber-600',
  crit: 'text-red-600',
  electric: 'text-gray-900',
};

export function MetricCard({ label, value, icon: Icon, tone = 'default', sub, onClick }: Props) {
  return (
    <div
      className={`metric-card animate-rise ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-1.5">{label}</div>
          <div className={`font-display text-3xl font-bold data-num ${VALUE_STYLES[tone]}`}>{value}</div>
          {sub && <div className="mt-1.5 text-xs text-gray-500 font-medium">{sub}</div>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_STYLES[tone]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
