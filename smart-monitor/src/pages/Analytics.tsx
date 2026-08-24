import React, { useState } from 'react';
import {
  BarChart, Bar, CartesianGrid, Cell, Legend,
  Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, AreaChart, Area,
} from 'recharts';
import { Download, Calendar, MoreVertical } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { HealthGauge } from '../components/HealthGauge';
import { useInView } from '../hooks/useInView';

const TOOLTIP = {
  contentStyle: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    fontSize: 12,
    color: '#f1f5f9',
  },
};

export function AnalyticsPage() {
  const { equipment, alerts, inspections } = useMonitoring();

  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [mainRef,   mainVisible]   = useInView({ threshold: 0.08 });
  const [bottomRef, bottomVisible] = useInView({ threshold: 0.08 });

  const avgHealth = Math.round(equipment.reduce((s, e) => s + e.health, 0) / equipment.length) || 0;

  // System health index over time (from first equipment's history)
  const healthHistory = equipment[0]?.sensors.temperature.history.map((pt, i) => ({
    t: pt.t,
    score: Math.max(20, Math.min(100, avgHealth + Math.sin(i * 0.4) * 8)),
  })) ?? [];

  const riskRanking = [...equipment].sort((a, b) => b.anomalyScore - a.anomalyScore);

  const distribution = (['normal', 'warning', 'critical'] as const)
    .map((sev) => ({ name: sev, value: alerts.filter((a) => a.severity === sev).length }))
    .filter((d) => d.value > 0);

  const PIE_COLORS = { normal: '#3B82F6', warning: '#6366F1', critical: '#94A3B8' };

  // Alert volume by day (last 7 items simulated)
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const alertVolume = DAYS.map((d, i) => ({
    day: d,
    count: i === 3 ? alerts.length + 2 : Math.max(0, Math.floor(alerts.length * 0.3 * Math.sin(i + 1) + 2)),
  }));

  const inspPassRate = inspections.length
    ? Math.round((inspections.filter((i) => i.result === 'PASS').length / inspections.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Advanced Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Predictive insights and real-time operational telemetry.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar size={14} /> Last 30 Days
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* System Health Index — large */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">System Health Index</h3>
            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <MoreVertical size={15} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={healthHistory} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false} tickLine={false}
                minTickGap={50}
              />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...TOOLTIP} labelFormatter={(v) => new Date(v as number).toLocaleDateString()} />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} fill="url(#healthGrad)" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Current score callout */}
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-slate-800 text-white rounded-xl px-4 py-2 text-sm font-semibold shadow">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Current Score</span>
              <span className="text-xl font-bold text-white">{avgHealth}.2</span>
              <span className="text-emerald-400 ml-1 text-xs">+1.2%</span>
            </div>
          </div>
        </div>

        {/* Risk Ranking */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Risk Ranking</h3>
            <AlertTriangleIcon />
          </div>
          <div className="space-y-3">
            {riskRanking.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    e.anomalyScore >= 70
                      ? 'bg-red-100'
                      : e.anomalyScore >= 45
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${
                    e.anomalyScore >= 70 ? 'text-red-600' : e.anomalyScore >= 45 ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {e.type.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800 truncate">{e.id}</span>
                    <span className={`text-xs font-bold font-mono ml-2 ${
                      e.anomalyScore >= 70 ? 'text-red-600' : e.anomalyScore >= 45 ? 'text-amber-600' : 'text-blue-600'
                    }`}>{e.anomalyScore}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-1.5">{e.location.split('—')[1]?.trim() ?? e.location}</div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${e.anomalyScore}%`,
                        background: e.anomalyScore >= 70 ? '#ef4444' : e.anomalyScore >= 45 ? '#f59e0b' : '#3b82f6',
                      }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 shrink-0">Score</div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition-colors">
            VIEW FULL REGISTRY
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Sensor Distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Sensor Dist.</h3>
            <button className="p-1 text-gray-400 hover:text-gray-600"><MoreVertical size={14} /></button>
          </div>
          {distribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {distribution.map((d) => (
                      <Cell key={d.name} fill={PIE_COLORS[d.name as keyof typeof PIE_COLORS] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-12 pointer-events-none">
                <div className="text-xl font-bold font-mono text-gray-900">
                  {distribution.reduce((s, d) => s + d.value, 0)}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase">Active Nodes</div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 flex-wrap text-[11px] text-gray-500">
                {distribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[d.name as keyof typeof PIE_COLORS] }} />
                    {d.name.charAt(0).toUpperCase() + d.name.slice(1)} ({d.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">No alerts yet</div>
          )}
        </div>

        {/* Alert Volume */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Alert Volume</h3>
            <button className="p-1 text-gray-400 hover:text-gray-600"><MoreVertical size={14} /></button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={alertVolume} barSize={22}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
              <Tooltip {...TOOLTIP} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {alertVolume.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.count === Math.max(...alertVolume.map((x) => x.count)) ? '#EF4444' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inspection Pass Rate */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Inspection Pass Rate</h3>
            <button className="p-1 text-gray-400 hover:text-gray-600"><MoreVertical size={14} /></button>
          </div>
          {inspections.length > 0 ? (
            <>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-bold text-4xl font-mono text-gray-900">{inspPassRate}</span>
                <span className="text-xl text-gray-500">%</span>
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">↑ +3.4%</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold mb-3">Avg Trailing 7 Days</div>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={inspections.slice(0, 7).map((insp, i) => ({ i, v: insp.result === 'PASS' ? 95 : insp.result === 'WARNING' ? 75 : 50 }))}>
                  <defs>
                    <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} fill="url(#passGrad)" isAnimationActive={false} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                <span>Target: 95.0%</span>
                <span>Defects logged: {inspections.filter((i) => i.result !== 'PASS').length}</span>
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-sm text-gray-400 gap-2">
              <span>No inspections yet</span>
              <span className="text-xs">Run Smart Inspection to see data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertTriangleIcon() {
  return (
    <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    </div>
  );
}
