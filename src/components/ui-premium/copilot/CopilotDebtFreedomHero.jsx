import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag, Sparkles, TrendingUp } from 'lucide-react';
import CopilotProgressRing from './CopilotProgressRing';
import { triggerHaptic } from '@/lib/haptics';
import { estimateMonthsToDebtFree, monthsToDebtFreeWithExtra, pickBoostLoanIndex } from '@/lib/loanMath';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Motiverande skuldfrihetsplan — framåtblick, inte skuldbeläggning.
 * `extraPayment` (om satt) driver spaken: "öka med X kr/mån och bli skuldfri Y mån tidigare."
 */
export default function CopilotDebtFreedomHero({ loans = [], extraPayment = 0, className = '' }) {
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const totalMonthly = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const monthsLeft = useMemo(() => estimateMonthsToDebtFree(loans), [loans]);

  const monthsSaved = useMemo(() => {
    if (!(extraPayment > 0) || !loans.length) return 0;
    const boostIndex = pickBoostLoanIndex(loans);
    if (boostIndex < 0) return 0;
    const monthsWithExtra = monthsToDebtFreeWithExtra(loans, boostIndex, extraPayment);
    return Math.max(0, monthsLeft - monthsWithExtra);
  }, [loans, extraPayment, monthsLeft]);

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
        style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(22, 163, 74, 0.08))' }}
        onClick={handleCelebrate}
      >
        <Sparkles className="w-8 h-8 text-[var(--copilot-accent-green)] mx-auto mb-3" />
        <p className="text-[18px] font-bold text-[var(--color-text-primary)]">Du är skuldfri</p>
        <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2">Fortsätt bygga buffert och sparmål.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl organic-surface overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%)' }}
      onClick={handleCelebrate}
    >
      <div className="p-5 flex items-center gap-4">
        <CopilotProgressRing
          value={freedomPct}
          max={100}
          size={88}
          stroke={6}
          color="var(--copilot-accent-green)"
          label={`${freedomPct}%`}
          sublabel="mot frihet"
        />
        <div className="flex-1 min-w-0">
          <h2 className="anchor-card-title flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" /> Din skuldfrihetsplan
          </h2>
          <p className="text-[22px] font-bold text-[var(--color-text-primary)] mt-1 leading-tight">
            {monthsLeft > 0 ? (
              <>Skuldfri om cirka <span className="text-[var(--copilot-accent-green)]">{monthsLeft} mån</span></>
            ) : (
              'Du är på väg — håll tempot'
            )}
          </p>
          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2 leading-relaxed">
            {fmt(totalMonthly)} kr/mån tar dig närmare målet.
          </p>
          {monthsSaved > 0 && (
            <p className="text-[13px] text-[var(--copilot-accent-green)] mt-1.5 leading-relaxed flex items-start gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Öka med {fmt(extraPayment)} kr/mån och bli skuldfri {monthsSaved} mån tidigare.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
