import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function buildChartData(currentMonthlyNet, brusSavings) {
  const data = [];
  const years = 10;
  const annualReturn = 0.08; // 8% indexfond

  let baseWealth = 0;
  let optimizedWealth = 0;

  for (let m = 0; m <= years * 12; m += 3) {
    baseWealth += currentMonthlyNet * 3;
    baseWealth *= (1 + annualReturn / 4);

    optimizedWealth += (currentMonthlyNet + brusSavings) * 3;
    optimizedWealth *= (1 + annualReturn / 4);

    if (m % 12 === 0) {
      data.push({
        år: `${2026 + m / 12}`,
        'Status Quo': Math.round(baseWealth / 1000),
        'Anchor-vägen': Math.round(optimizedWealth / 1000),
      });
    }
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs shadow-xl"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
      <p className="font-black mb-1" style={{ color: '#1A2332' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toLocaleString('sv-SE')} kkr</strong>
        </p>
      ))}
    </div>
  );
};

export default function DualPathChart({ currentMonthlyNet, brusSavings, sliderPct = 50 }) {
  const activeBrus = brusSavings * (sliderPct / 100);
  const data = buildChartData(currentMonthlyNet, activeBrus);
  const diff = data[data.length - 1]?.['Anchor-vägen'] - data[data.length - 1]?.['Status Quo'];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#8896A5' }}>
          ⏱ Tidsmaskinen — 10-årsvy
        </p>
        <p className="text-2xl font-black" style={{ color: '#1A2332' }}>
          +{Math.round(diff).toLocaleString('sv-SE')} kkr
        </p>
        <p className="text-sm" style={{ color: '#6B7E96' }}>
          Extra förmögenhet om du väljer Anchor-vägen
        </p>
      </div>

      <div className="px-2 pb-4" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="år"
              tick={{ fontSize: 10, fill: '#8896A5' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#8896A5' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Status Quo"
              stroke="#CBD5E0"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 3"
            />
            <Line
              type="monotone"
              dataKey="Anchor-vägen"
              stroke="#0FDEBD"
              strokeWidth={3}
              dot={false}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-5 px-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5" style={{ background: '#CBD5E0', borderTop: '2px dashed #CBD5E0' }} />
          <span className="text-xs" style={{ color: '#8896A5' }}>Status Quo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded-full" style={{ background: '#0FDEBD' }} />
          <span className="text-xs font-bold" style={{ color: '#0FDEBD' }}>Anchor-vägen ✨</span>
        </div>
      </div>
    </div>
  );
}