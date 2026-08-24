// =============================================================================
// COMPONENTS / ActivityTimeline.tsx
// =============================================================================
// Vertical timeline of ActivityEvent entries.  Each event gets a coloured dot
// whose colour matches its severity (green=normal, amber=warning, red=critical).
// Used on the Dashboard (limit=8) and the Inspection History sidebar.
// =============================================================================
import React from 'react';
import { ActivityEvent } from '../types';
import { severityColor } from '../utils/format';

/**
 * @param events  Full activity array from MonitoringContext (newest first).
 * @param limit   Maximum number of events to render (default 12).
 */
export function ActivityTimeline({ events, limit = 12 }: { events: ActivityEvent[]; limit?: number }) {
  const list = events.slice(0, limit);

  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />
      <div className="space-y-3.5">
        {list.map((e) => {
          const color = severityColor(e.severity);
          return (
            <div key={e.id} className="relative">
              <span
                className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white"
                style={{ background: color }}
              />
              <div className="text-[10px] font-mono text-gray-400 mb-0.5">{e.timestamp}</div>
              <div className="text-sm text-gray-700">{e.message}</div>
            </div>
          );
        })}
        {list.length === 0 && <div className="text-sm text-gray-400">No activity yet.</div>}
      </div>
    </div>
  );
}
