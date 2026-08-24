// =============================================================================
// COMPONENTS / LiveChart.tsx
// =============================================================================
// Thin wrapper around Recharts AreaChart for rendering a sensor's rolling
// history buffer.  Used in three contexts:
//   1. SensorCard       — compact sparkline (height=48, no axes)
//   2. EquipmentCard    — temperature sparkline at card bottom (height=48)
//   3. Live Monitoring  — full chart with axes, grid, and tooltip (height=80, showAxes=true)
//
// `isAnimationActive={false}` is critical — without it Recharts re-animates
// on every tick, causing visible flicker during the 1.5s simulation interval.
// =============================================================================
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: { t: number; v: number }[];
  color: string;
  height?: number;
  showAxes?: boolean;
  unit?: string;
}

export function LiveChart({ data, color, height = 60, showAxes = false, unit = '' }: Props) {
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: showAxes ? 8 : 2, left: showAxes ? -10 : 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {showAxes && <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />}
        {showAxes && (
          <XAxis
            dataKey="t"
            tickFormatter={(v) =>
              new Date(v).toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' })
            }
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
        )}
        {showAxes && (
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
        )}
        {showAxes && (
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              fontSize: 12,
              color: '#f1f5f9',
            }}
            labelFormatter={(v) =>
              new Date(v as number).toLocaleTimeString('en-US', { hour12: false })
            }
            formatter={(v: number) => [`${v}${unit}`, 'Value']}
          />
        )}
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${gradId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
