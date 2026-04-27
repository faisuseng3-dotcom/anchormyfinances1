import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function PillGauge({ label, value, max, color, sublabel }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</p>
        <p className="text-sm font-black" style={{ color: '#fff' }}>{fmt(value)} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>kr</span></p>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 10px ${color.split(',')[0].replace('linear-gradient(90deg,','')}55`,
          }}
        />
      </div>
      {sublabel && (
        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.22)' }}>{sublabel}</p>
      )}
    </div>
  );
}

export default function MoneyOverview({ profile }) {
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const totalOut = totalFixed + expenses;

  return (
    <div className="mx-4 rounded-3xl p-5"
      style={{
        background: 'rgba(8,12,22,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
      <p className="text-[9px] font-black tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
        DINA PENGAR JUST NU
      </p>

      <div className="space-y-4">
        <PillGauge
          label="INKOMST"
          value={profile.income}
          max={profile.income}
          color="linear-gradient(90deg, #0D7377, #0FDEBD)"
          sublabel="Månadslön / inkomst"
        />
        <PillGauge
          label="UTGIFTER"
          value={totalOut}
          max={profile.income}
          color="linear-gradient(90deg, #6B21A8, #A78BFA)"
          sublabel={`Fasta: ${fmt(totalFixed)} kr · Använt: ${fmt(expenses)} kr`}
        />
      </div>
    </div>
  );
}