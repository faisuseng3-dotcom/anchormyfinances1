import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const YEAR_OPTIONS = [1, 3, 5, 10];

function generateData(startValue, monthlySavings, months) {
  const data = [];
  let current = startValue;
  const step = Math.max(1, Math.floor(months / 20));
  for (let m = 0; m <= months; m += step) {
    if (m > 0) current += monthlySavings * step;
    data.push({ value: Math.max(0, Math.round(current)) });
  }
  return data;
}

export default function ForecastChart({ profile }) {
  const [selectedYears, setSelectedYears] = useState(5);

  const totalFixedCosts = getTotalFixedCosts(profile || {});
  const income = profile?.income || 0;
  const margin = income - totalFixedCosts;
  const monthlySavings = income > 0 && margin > 0 ? margin * 0.3 : 0;
  const startValue = profile?.buffer || 0;
  const activeMonths = selectedYears * 12;

  const data = useMemo(
    () => generateData(startValue, monthlySavings, activeMonths),
    [startValue, monthlySavings, activeMonths]
  );

  if (!profile) return null;



  const finalValue = data[data.length - 1]?.value || 0;
  const isFlat = monthlySavings === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Så här ser din nästa tid ut</p>
          <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            {finalValue.toLocaleString('sv-SE')} <span className="text-base font-semibold" style={{ color: 'var(--color-text-muted)' }}>kr</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            om {selectedYears} {selectedYears === 1 ? 'år' : 'år'}
          </p>
        </div>

        {/* Year pills */}
        <div className="flex gap-1.5">
          {YEAR_OPTIONS.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYears(y)}
              className="w-9 h-9 rounded-full text-xs font-semibold transition-all"
              style={{
                background: selectedYears === y ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                color: selectedYears === y ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {y}å
            </button>
          ))}
        </div>
      </div>

      {/* Clean curve — no axes, no grid */}
      {!isFlat ? (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="url(#fgFill)"
              dot={false}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
          Fyll i dina uppgifter för att se din ekonomiska bana.
        </p>
      )}
    </motion.div>
  );
}