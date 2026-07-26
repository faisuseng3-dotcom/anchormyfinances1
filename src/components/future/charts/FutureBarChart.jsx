import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px]"
      style={{ background: '#0e1310', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.6)' }}
    >
      <p className="text-white/50 mb-1">{p.payload.x}</p>
      <p className="tabular-nums font-semibold text-white">{fmt(p.value)}</p>
    </div>
  );
}

/** Jämförelsestaplar — idag vs efter förändring. Neutral tills en stapel är "vinnaren". */
export default function FutureBarChart({ data, height = 200 }) {
  if (!data?.length) return null;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="x"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out">
            {data.map((d, i) => {
              const tone = d.tone || (d.accent ? 'accent' : null);
              const fill = tone === 'critical'
                ? 'var(--color-danger)'
                : tone === 'accent'
                  ? 'var(--color-accent)'
                  : 'rgba(255,255,255,0.18)';
              return <Cell key={i} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
