import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bell,
  Activity,
  Play,
  RotateCcw,
  Zap,
  Clapperboard,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { MetricCard } from '../components/MetricCard';
import { EquipmentCard } from '../components/EquipmentCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { HealthGauge } from '../components/HealthGauge';

export function Dashboard() {
  const {
    equipment,
    alerts,
    activity,
    systemOnline,
    toggleSystem,
    simulateWarning,
    simulateCritical,
    resetToNormal,
    startFullDemo,
    demoRunning,
  } = useMonitoring();
  const navigate = useNavigate();

  const online = equipment.filter((e) => e.status === 'Running' || e.status === 'Idle').length;
  const warning = equipment.filter((e) => e.status === 'Warning').length;
  const critical = equipment.filter((e) => e.status === 'Critical').length;
  const openAlerts = alerts.filter((a) => a.status === 'Open').length;
  const avgHealth = Math.round(equipment.reduce((s, e) => s + e.health, 0) / equipment.length) || 0;

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Equipment"
          value={equipment.length.toLocaleString()}
          icon={Boxes}
          sub={`↑ ${online} online`}
          onClick={() => navigate('/equipment')}
        />
        <MetricCard
          label="Online Units"
          value={online.toLocaleString()}
          icon={CheckCircle}
          tone="good"
          sub={`${Math.round((online / equipment.length) * 100)}% Uptime`}
        />
        <MetricCard
          label="Active Warnings"
          value={openAlerts}
          icon={AlertTriangle}
          tone={openAlerts > 0 ? 'warn' : 'good'}
          sub={`↑ ${warning} since yesterday`}
          onClick={() => navigate('/alerts')}
        />
        <div className="metric-card flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="eyebrow mb-1.5">System Health Avg</div>
            <div className="flex items-center gap-2">
              <HealthGauge score={avgHealth} size={52} />
              <div>
                <div className="text-xs font-semibold text-gray-500 mt-1">
                  STATUS:{' '}
                  <span className={avgHealth >= 80 ? 'text-emerald-600' : avgHealth >= 60 ? 'text-amber-600' : 'text-red-600'}>
                    {avgHealth >= 80 ? 'Optimal' : avgHealth >= 60 ? 'Warning' : 'Critical'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Equipment grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900 text-base">Live Equipment</h2>
            <button
              onClick={() => navigate('/equipment')}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {equipment.map((eq) => (
              <EquipmentCard key={eq.id} eq={eq} />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Demo controls */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clapperboard size={14} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Demo Control Center</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={toggleSystem}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors focus-ring"
              >
                <Play size={13} />
                {systemOnline ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => simulateWarning()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-medium text-amber-700 transition-colors focus-ring"
              >
                <AlertTriangle size={13} />
                Simulate Warning
              </button>
              <button
                onClick={() => simulateCritical()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-medium text-red-700 transition-colors focus-ring"
              >
                <Zap size={13} />
                Critical Fault
              </button>
              <button
                onClick={() => resetToNormal()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium text-emerald-700 transition-colors focus-ring"
              >
                <RotateCcw size={13} />
                Reset Normal
              </button>
            </div>

            <button
              disabled={demoRunning}
              onClick={() => startFullDemo(navigate)}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors focus-ring shadow-sm"
            >
              🎬 {demoRunning ? 'Demo Running…' : 'Start Full Hackathon Demo'}
            </button>
            <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
              Runs M-001 through the full monitor → analyze → alert → inspect → report sequence (~60s).
            </p>
          </div>

          {/* Recent Activity */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
              <button
                onClick={() => navigate('/history')}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <Filter size={14} />
              </button>
            </div>
            <ActivityTimeline events={activity} limit={8} />
            {activity.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="mt-4 w-full text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1"
              >
                View Full Log →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
