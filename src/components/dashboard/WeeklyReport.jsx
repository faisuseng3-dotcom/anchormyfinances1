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
      className="rounded-[20px] px-5 py-5 bg-white border border-[var(--color-border)]"
    >
      <h2 className="anchor-card-title mb-4">
        {report.label}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[12px] text-[var(--color-text-muted)]">Du spenderade</p>
          <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums mt-1">{report.fmt(report.spent)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)]">kr</p>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-muted)]">Du sparade</p>
          <p className="text-[22px] font-bold text-[var(--color-success)] tabular-nums mt-1">{report.fmt(report.saved)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)]">kr</p>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-muted)]">Du ligger</p>
          <p className={`text-[22px] font-bold tabular-nums mt-1 ${report.goalPct >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
            {report.goalPct >= 0 ? '+' : ''}{report.goalPct}%
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">mot målet</p>
        </div>
      </div>
    </motion.div>
  );
}
