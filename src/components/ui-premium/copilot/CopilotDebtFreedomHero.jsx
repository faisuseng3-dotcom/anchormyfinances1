import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag, Sparkles } from 'lucide-react';
import CopilotProgressRing from './CopilotProgressRing';
import { triggerHaptic } from '@/lib/haptics';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function estimateMonthsToDebtFree(loans) {
  if (!loans?.length) return 0;
  let maxMonths = 0;
  loans.forEach((loan) => {
    const balance = loan.totalAmount || 0;
    const payment = loan.monthlyPayment || 0;
    const interest = balance * ((loan.interestRate || 0) / 100 / 12);
    const principal = Math.max(0, payment - interest);
    if (principal <= 0 || balance <= 0) return;
    maxMonths = Math.max(maxMonths, Math.ceil(balance / principal));
  });
  return maxMonths;
}

/**
 * Motiverande skuldfrihetsplan — framåtblick, inte skuldbeläggning.
 */
export default function CopilotDebtFreedomHero({ loans = [], className = '' }) {
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const totalMonthly = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const monthsLeft = useMemo(() => estimateMonthsToDebtFree(loans), [loans]);

  const freedomPct = useMemo(() => {
    if (totalDebt <= 0) return 100;
    if (monthsLeft <= 0) return 12;
    return Math.min(92, Math.round((24 / (monthsLeft + 24)) * 100));
  }, [totalDebt, monthsLeft]);

  const handleCelebrate = () => {
    if (freedomPct >= 50) triggerHaptic('success');
    else triggerHaptic('light');
  };

  if (!loans.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl organic-surface p-6 text-center ${className}`}
        style={{ background: 'linear-gradient(135deg, rgba(79, 174, 130, 0.12), rgba(79, 174, 130, 0.08))' }}
        onClick={handleCelebrate}
      >
        <Sparkles className="w-8 h-8 text-[var(--copilot-accent-green)] mx-auto mb-3" />
        <p className="text-[18px] font-bold text-white">Du är skuldfri</p>
        <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2">Fortsätt bygga buffert och sparmål.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl organic-surface overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, rgba(79, 174, 130, 0.12) 0%, rgba(79, 174, 130, 0.08) 100%)' }}
      onClick={handleCelebrate}
    >
      <div className="p-5 flex items-center gap-4">
        <CopilotProgressRing
          value={freedomPct}
          max={100}
          size={88}
          stroke={6}
          color="#4fae82"
          label={`${freedomPct}%`}
          sublabel="mot frihet"
        />
        <div className="flex-1 min-w-0">
          <h2 className="anchor-card-title flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" /> Din skuldfrihetsplan
          </h2>
          <p className="text-[22px] font-bold text-white mt-1 leading-tight">
            {monthsLeft > 0 ? (
              <>Skuldfri om cirka <span className="text-[var(--copilot-accent-green)]">{monthsLeft} mån</span></>
            ) : (
              'Du är på väg — håll tempot'
            )}
          </p>
          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2 leading-relaxed">
            {fmt(totalMonthly)} kr/mån tar dig närmare målet. Varje extra krona fyller ringen.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
