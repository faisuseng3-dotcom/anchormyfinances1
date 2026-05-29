import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DebtAnalysisView from './DebtAnalysisView';
import { DashboardSection } from './DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';
import { getLoanRateLabel, getPrimaryLoan } from '@/lib/loanCalculations';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DebtDashboardCard({ profile }) {
  const [open, setOpen] = useState(false);
  const loan = useMemo(() => getPrimaryLoan(profile), [profile]);

  if (!loan) return null;

  const rateLabel = getLoanRateLabel(loan.interestRate || 0);
  const rateStr = (loan.interestRate || 0).toString().replace('.', ',');

  return (
    <>
      <DashboardSection title="Skuld">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="w-full text-left py-1 active:opacity-70"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                className="font-semibold leading-none tracking-tight text-white tabular-nums"
                style={{ fontSize: 'clamp(1.75rem, 7vw, 2.15rem)' }}
              >
                {fmt(loan.totalAmount)}
                <span className="text-lg font-medium ml-1 text-white/40">kr</span>
              </p>
              <p className={`${sectionMetaClass} mt-2 truncate`}>
                {loan.name} · {rateStr}% · {fmt(loan.monthlyPayment)} kr/mån
              </p>
            </div>
            <span className="text-[13px] font-medium text-emerald-300/90 flex-shrink-0">{rateLabel}</span>
          </div>
        </motion.button>
      </DashboardSection>

      <AnimatePresence>
        {open && <DebtAnalysisView profile={profile} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
