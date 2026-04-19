import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * SparklineWidget — minimalistisk live spending-kurva utan axlar eller siffror.
 * Visar bara formen av spending-trenden.
 */
export default function SparklineWidget({ transactions }) {
  const data = useMemo(() => {
    const byDay = {};
    const now = new Date();
    // last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = 0;
    }
    (transactions || []).forEach(t => {
      if (!['expense','savings_deposit','transfer_to_savings'].includes(t.type)) return;
      const key = (t.created_date || '').slice(0, 10);
      if (byDay[key] !== undefined) byDay[key] += Math.abs(t.amount);
    });
    return Object.entries(byDay).map(([, v]) => ({ v }));
  }, [transactions]);

  const hasData = data.some(d => d.v > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        height: 100,
        background: 'rgba(10,12,22,0.85)',
        border: '1px solid rgba(15,222,189,0.2)',
      }}
    >
      <div className="absolute top-3 left-4 z-10">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>SPENDING 30D</p>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sgrd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0FDEBD" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0FDEBD" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#0FDEBD" strokeWidth={2} fill="url(#sgrd)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Ingen data ännu</p>
        </div>
      )}
    </motion.div>
  );
}