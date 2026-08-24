import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';

const STYLE = {
  normal: { icon: CheckCircle2, bg: 'bg-white border-emerald-200', iconCls: 'text-emerald-500' },
  warning: { icon: AlertTriangle, bg: 'bg-white border-amber-300', iconCls: 'text-amber-500' },
  critical: { icon: AlertTriangle, bg: 'bg-white border-red-300 shadow-red-100', iconCls: 'text-red-500' },
};

export function ToastStack() {
  const { toasts, dismissToast } = useMonitoring();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map((t) => {
        const s = STYLE[t.severity];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            className={`card border ${s.bg} p-3.5 flex items-start gap-3 animate-slideIn shadow-lg`}
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${s.iconCls}`} />
            <div className="min-w-0 flex-1">
              <div className={`text-xs font-bold uppercase tracking-wide ${s.iconCls}`}>{t.title}</div>
              <div className="text-sm text-gray-700 mt-0.5">{t.message}</div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
