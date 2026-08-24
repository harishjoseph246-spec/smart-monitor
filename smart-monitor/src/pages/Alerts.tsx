import React, { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { AlertCard } from '../components/AlertCard';
import { Severity } from '../types';

const PAGE_SIZE = 6;

export function AlertsPage() {
  const { alerts, resolveAlert } = useMonitoring();
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<'all' | 'Open' | 'Resolved'>('Open');
  const [page, setPage] = useState(1);

  const critical = alerts.filter((a) => a.severity === 'critical' && a.status === 'Open').length;
  const warning = alerts.filter((a) => a.severity === 'warning' && a.status === 'Open').length;
  const openTotal = alerts.filter((a) => a.status === 'Open').length;

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchQ =
        !query.trim() ||
        a.message.toLowerCase().includes(query.toLowerCase()) ||
        a.equipmentId.toLowerCase().includes(query.toLowerCase());
      const matchSev = severity === 'all' || a.severity === severity;
      const matchStatus = status === 'all' || a.status === status;
      return matchQ && matchSev && matchStatus;
    }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [alerts, query, severity, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (newStatus: typeof status) => {
    setStatus(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Active Alerts Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time monitoring of critical equipment anomalies.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-ring ${
              status === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            ALL ALERTS
          </button>
          <button
            onClick={() => handleFilter('Open')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-ring ${
              status === 'Open' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            CRITICAL ({critical})
          </button>
          <button
            onClick={() => handleFilter('Open')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-ring ${
              status === 'Resolved' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            WARNING ({warning})
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search equipment or ID..."
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
          />
        </div>
        <FilterSelect
          value={severity as string}
          onChange={(v) => { setSeverity(v as any); setPage(1); }}
          options={[['all', 'All Locations'], ['critical', 'Critical'], ['warning', 'Warning'], ['normal', 'Info']]}
        />
        <FilterSelect
          value={status}
          onChange={(v) => { handleFilter(v as any); }}
          options={[['all', 'Status: All'], ['Open', 'Status: Active'], ['Resolved', 'Status: Resolved']]}
        />
        <button
          onClick={() => { setQuery(''); setSeverity('all'); setStatus('all'); setPage(1); }}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 focus-ring rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Alerts table header */}
      <div className="card overflow-hidden">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wide text-gray-500">
              <div className="w-4" />
              <div>Equipment ID / Parameter</div>
              <div className="text-right">Value</div>
              <div className="text-right">Threshold</div>
              <div className="text-right hidden sm:block">Timestamp</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-gray-100">
              {paginated.map((a) => (
                <div key={a.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full block ${
                        a.severity === 'critical' ? 'bg-red-500 animate-pulseDot' : a.severity === 'warning' ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{a.equipmentId}</div>
                    <div className="text-xs text-gray-500">{a.parameter ?? a.message.split(' ').slice(0, 3).join(' ')}</div>
                  </div>
                  <div
                    className={`text-sm font-bold font-mono text-right ${
                      a.severity === 'critical' ? 'text-red-600' : a.severity === 'warning' ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {a.value ?? '–'}
                  </div>
                  <div className="text-sm text-gray-500 font-mono text-right">{a.threshold ?? '–'}</div>
                  <div className="text-xs text-gray-400 hidden sm:block text-right">
                    {new Date(a.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div>
                    {a.status === 'Open' ? (
                      <button
                        onClick={() => resolveAlert(a.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors focus-ring ${
                          a.severity === 'critical'
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {a.severity === 'critical' ? 'REVIEW' : 'ACK'}
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} active alerts
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-sm">No alerts match your filters.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}
