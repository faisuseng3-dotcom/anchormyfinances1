import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function PillGauge({ label, value, max, color, sublabel }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className={dashboardSectionLabelClass}>{label}</p>
        <p className="text-base font-semibold tabular-nums text-white">
          {fmt(value)}{' '}
          <span className="text-xs font-medium text-white/40">kr</span>
        </p>
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: color,
            boxShadow: '0 0 12px rgba(255,255,255,0.12)',
          }}
        />
      </div>
      {sublabel && (
        <p className="text-[11px] leading-snug text-white/40">{sublabel}</p>
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
    <div className="mx-4 rounded-[26px] p-5 sm:p-6" style={dashboardGlassSurface()}>
      <p className={`${dashboardSectionLabelClass} mb-5`}>
        Dina pengar just nu
      </p>

      <div className="space-y-5">
        <PillGauge
          label="Inkomst"
          value={profile.income}
          max={profile.income}
          color="linear-gradient(90deg, #6E9BFF, #B8C9FF)"
          sublabel="Månadslön / inkomst"
        />
        <PillGauge
          label="Utgifter"
          value={totalOut}
          max={profile.income}
          color="linear-gradient(90deg, #7C6AE8, #C4B5FD)"
          sublabel={`Fasta: ${fmt(totalFixed)} kr · Använt: ${fmt(expenses)} kr`}
        />
      </div>
    </div>
  );
}