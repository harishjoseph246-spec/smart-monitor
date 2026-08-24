// =============================================================================
// COMPONENTS / Sidebar.tsx
// =============================================================================
// Persistent left-hand navigation sidebar.
//   - Desktop: always visible (static, translated into flow).
//   - Mobile:  slides in from the left over a backdrop when `open` is true.
// Shows an alert badge on the Alerts nav item when there are open alerts.
// Footer displays the current operator and system online/offline status.
// =============================================================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Boxes,
  ClipboardCheck,
  Bell,
  BarChart3,
  History,
  FileText,
  Network,
  Settings,
  Cpu,
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/live-monitoring', label: 'Monitoring', icon: Activity },
  { to: '/equipment', label: 'Equipment', icon: Boxes },
  { to: '/inspection', label: 'Inspection', icon: ClipboardCheck },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/architecture', label: 'Architecture', icon: Network },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { systemOnline, alerts } = useMonitoring();
  const openAlerts = alerts.filter((a) => a.status === 'Open').length;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-[200px] shrink-0 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-sm leading-tight">IND-CORE</div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wide">INSPECTION V4.2</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} focus-ring`
              }
            >
              <item.icon size={16} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/alerts' && openAlerts > 0 && (
                <span className="rounded-full bg-red-100 text-red-600 text-[10px] font-semibold px-1.5 py-0.5 min-w-[18px] text-center">
                  {openAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / status footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              OP
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">System Operator</div>
              <div className="text-[10px] text-gray-400">Level 4 Access</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                systemOnline ? 'bg-emerald-500 animate-pulseDot' : 'bg-gray-400'
              }`}
            />
            <span className={`text-[10px] font-medium ${systemOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
              {systemOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
