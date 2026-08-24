import React from 'react';
import { Menu, RefreshCw, Bell, HelpCircle, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useMonitoring } from '../context/MonitoringContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'IND-CORE MONITORING',
  '/live-monitoring': 'Live Monitoring',
  '/equipment': 'Equipment Registry',
  '/inspection': 'Smart Inspection',
  '/alerts': 'Alerts Management',
  '/analytics': 'Advanced Analytics',
  '/history': 'Inspection History',
  '/reports': 'Inspection Report',
  '/architecture': 'System Architecture',
  '/settings': 'Settings',
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { systemOnline, demoLabel, alerts, toggleSystem } = useMonitoring();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'IND-CORE MONITORING';
  const openAlerts = alerts.filter((a) => a.status === 'Open').length;

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white px-4 lg:px-6 flex items-center justify-between gap-4 z-20">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenu}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus-ring rounded p-1"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display font-bold text-gray-900 text-sm lg:text-base tracking-tight truncate">
          {title}
        </h1>
        {demoLabel && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700 animate-rise">
            🎬 {demoLabel}
          </span>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* System status pill */}
        <button
          onClick={toggleSystem}
          className={`hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-ring ${
            systemOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              systemOnline ? 'bg-emerald-500 animate-pulseDot' : 'bg-gray-400'
            }`}
          />
          {systemOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
        </button>

        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-ring"
          aria-label="Refresh"
        >
          <RefreshCw size={17} />
        </button>

        <button
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-ring"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {openAlerts > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulseDot" />
          )}
        </button>

        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-ring"
          aria-label="Help"
        >
          <HelpCircle size={17} />
        </button>
      </div>
    </header>
  );
}
