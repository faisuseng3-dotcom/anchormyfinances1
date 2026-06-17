// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { buildWeeklyReport } from '@/lib/weeklyReport';

export default function WeeklyReport({ profile, transactions }) {
  const report = useMemo(() => buildWeeklyReport(profile, transactions), [profile, transactions]);

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] px-5 py-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/35 mb-4">
        {report.label}
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[12px] text-white/40">Du spenderade</p>
          <p className="text-[22px] font-bold text-white tabular-nums mt-1">{report.fmt(report.spent)}</p>
          <p className="text-[11px] text-white/30">kr</p>
        </div>
        <div>
          <p className="text-[12px] text-white/40">Du sparade</p>
          <p className="text-[22px] font-bold text-[#22d97a] tabular-nums mt-1">{report.fmt(report.saved)}</p>
          <p className="text-[11px] text-white/30">kr</p>
        </div>
        <div>
          <p className="text-[12px] text-white/40">Du ligger</p>
          <p className={`text-[22px] font-bold tabular-nums mt-1 ${report.goalPct >= 0 ? 'text-[#22d97a]' : 'text-amber-300'}`}>
            {report.goalPct >= 0 ? '+' : ''}{report.goalPct}%
          </p>
          <p className="text-[11px] text-white/30">mot målet</p>
        </div>
      </div>
    </motion.div>
  );
}
