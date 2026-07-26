import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const COLOR_MAP = {
  accent: 'var(--color-accent)',
  muted: 'rgba(255,255,255,0.32)',
  critical: 'var(--color-danger)',
};

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px]"
      style={{ background: '#0e1310', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.6)' }}
    >
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="tabular-nums font-semibold" style={{ color: p.color }}>
          {fmt(p.value)} kr
        </p>
      ))}
    </div>
  );
}

/**
 * Linje/area-diagram — sparat vs investerat, buffertkurvor, målnivåer.
 * En eller två serier, animerad uppritning, inga tunga rutnät.
 */
export default function FutureLineChart({ data, lines, height = 220 }) {
  if (!data?.length || !lines?.length) return null;
  const primary = lines[0];
  const primaryColor = COLOR_MAP[primary.color] || COLOR_MAP.accent;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="futureAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.28} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="x"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
          <Area
            type="monotone"
            dataKey={primary.key}
            stroke={primaryColor}
            strokeWidth={2.5}
            fill="url(#futureAreaFill)"
            dot={false}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
          {lines.slice(1).map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={COLOR_MAP[l.color] || COLOR_MAP.muted}
              strokeWidth={2}
              strokeDasharray={l.dashed ? '4 4' : undefined}
              dot={false}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1 px-1">
        {lines.map((l) => (
          <span key={l.key} className="flex items-center gap-1.5 text-[11px] text-white/45">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: COLOR_MAP[l.color] || COLOR_MAP.muted }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
