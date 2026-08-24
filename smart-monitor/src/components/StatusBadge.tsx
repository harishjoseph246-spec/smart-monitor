import React from 'react';
import { EquipmentStatus, Severity } from '../types';

const STATUS_STYLES: Record<EquipmentStatus, { bg: string; text: string; dot: string }> = {
  Running: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulseDot' },
  Idle: { bg: 'bg-gray-100 border border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
  Maintenance: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  Warning: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulseDot' },
  Critical: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', dot: 'bg-red-500 animate-pulseDot' },
};

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

const SEV_STYLES: Record<Severity, { bg: string; text: string }> = {
  normal: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700' },
  critical: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700' },
};

export function SeverityBadge({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  const s = SEV_STYLES[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}>
      {children ?? severity}
    </span>
  );
}
