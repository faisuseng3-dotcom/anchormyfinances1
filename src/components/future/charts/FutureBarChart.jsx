import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px]"
      style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', boxShadow: 'var(--anchor-shadow-2)' }}
    >
      <p className="text-[var(--color-text-secondary)] mb-1">{p.payload.x}</p>
      <p className="tabular-nums font-semibold text-[var(--color-text-primary)]">{fmt(p.value)}</p>
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
            tick={{ fill: 'rgba(11,18,32,0.5)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-background-secondary)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out">
            {data.map((d, i) => {
              const tone = d.tone || (d.accent ? 'accent' : null);
              const fill = tone === 'critical'
                ? 'var(--color-danger)'
                : tone === 'accent'
                  ? 'var(--color-accent)'
                  : '#EEF2F7';
              return <Cell key={i} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
