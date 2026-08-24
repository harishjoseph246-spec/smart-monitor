import React, { useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { formatDate } from '../utils/format';
import { Inspection } from '../types';

const PAGE_SIZE = 8;

export function InspectionHistoryPage() {
  const { inspections } = useMonitoring();
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<Inspection | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      inspections.filter(
        (i) =>
          i.equipmentId.toLowerCase().includes(query.toLowerCase()) ||
          i.inspector.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase())
      ),
    [inspections, query]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Inspection History</h2>
          <p className="text-sm text-gray-500 mt-0.5">{inspections.length} recorded inspections</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search by equipment, inspector, or ID…"
          className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Inspection ID</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Equipment</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden md:table-cell">Inspector</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Result</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden lg:table-cell">Critical Issues</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((i) => (
              <tr
                key={i.id}
                onClick={() => setDetail(i)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{i.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 text-xs">{i.equipmentId}</div>
                  <div className="text-gray-500 text-xs">{i.equipmentName}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs hidden md:table-cell">{i.inspector}</td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(i.date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      i.result === 'FAIL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : i.result === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {i.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs hidden lg:table-cell">{i.criticalIssues}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {query ? 'No inspections match your search.' : 'No inspections recorded yet. Run one from Smart Inspection.'}
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} inspections
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="card max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="font-mono text-xs font-semibold text-blue-600 mb-0.5">{detail.id}</div>
            <div className="font-display font-bold text-gray-900 text-lg">
              {detail.equipmentId} — {detail.equipmentName}
            </div>
            <div className="mt-2 mb-4">
              <span
                className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                  detail.result === 'FAIL'
                    ? 'bg-red-100 text-red-700'
                    : detail.result === 'WARNING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {detail.result}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Inspector</div>
                <div className="text-gray-800 font-medium">{detail.inspector}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Date</div>
                <div className="text-gray-800 font-medium">{formatDate(detail.date)}</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Findings</div>
              {detail.reasons.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {detail.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-gray-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-400">No issues found.</div>
              )}
              {detail.findings && (
                <p className="text-sm text-gray-700 mt-2">{detail.findings}</p>
              )}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Corrective Action</div>
              <p className="text-sm text-gray-700">{detail.correctiveAction || detail.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
