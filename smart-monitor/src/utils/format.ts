// =============================================================================
// UTILS / format.ts
// =============================================================================
// Pure formatting helpers used across multiple components.
// No side-effects, no imports — safe to call anywhere.
// =============================================================================

/** Convert an ISO timestamp to a human-readable relative label ("3m ago", "just now"). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/** Format an ISO timestamp as "Jan 5, 2025, 14:32" — used in Alerts and InspectionHistory. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Return the hex colour for a given severity — used as chart stroke and dot colour. */
export function severityColor(sev: 'normal' | 'warning' | 'critical'): string {
  return sev === 'critical' ? '#EF4444' : sev === 'warning' ? '#F5A623' : '#22C55E';
}

/** Capitalise a severity value for display ("critical" → "Critical"). */
export function severityLabel(sev: 'normal' | 'warning' | 'critical'): string {
  return sev === 'critical' ? 'Critical' : sev === 'warning' ? 'Warning' : 'Normal';
}
