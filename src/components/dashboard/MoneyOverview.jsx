import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { DashboardSection } from './DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function FlowBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className={sectionMetaClass}>{label}</p>
        <p className="text-[15px] font-semibold tabular-nums text-white">
          {fmt(value)} <span className="text-[13px] font-medium text-white/40">kr</span>
        </p>
      </div>
      <div className="relative h-1 rounded-full overflow-hidden bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function MoneyOverview({ profile }) {
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const totalOut = totalFixed + expenses;

  return (
    <DashboardSection title="Flöde denna månad">
      <div className="space-y-5">
        <FlowBar
          label="Inkomst"
          value={profile.income}
          max={profile.income}
          color="linear-gradient(90deg, #5B8CFF, #A8C4FF)"
        />
        <FlowBar
          label="Utgifter"
          value={totalOut}
          max={profile.income}
          color="linear-gradient(90deg, #8B7CF8, #C4B8FF)"
        />
        <p className="text-[12px] text-white/40">
          Fasta {fmt(totalFixed)} kr · Övrigt {fmt(expenses)} kr
        </p>
      </div>
    </DashboardSection>
  );
}
