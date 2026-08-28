import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import { techCta, techCtaGhost, dashLabel } from '@/lib/appSurface';
import { anchorIconButtonClass, elevatedSheet } from '@/lib/anchorTheme';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { getConcernById } from '@/lib/onboardingFocus';

const formatNumber = (value) =>
  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function WelcomeAnalysis({ profile, onClose, onFirstAction }) {
  if (!profile) return null;

  const concern = getConcernById(profile.topConcern);
  const monthlyLeft = (profile.income || 0) - getTotalFixedCosts(profile);
  const yearSavings = Math.max(0, monthlyLeft) * 0.3 * 12;
  const monthsToGoal =
    profile.savingsGoal > 0 && monthlyLeft > 0
      ? Math.ceil(
          Math.max(0, profile.savingsGoal - (profile.savingsCurrentBalance || profile.buffer || 0)) /
            (monthlyLeft * 0.3),
        )
      : 0;

  const rows = [
    {
      icon: TrendingUp,
      label: 'Kvar efter fasta kostnader',
      value: `${formatNumber(monthlyLeft)} kr/mån`,
    },
    {
      icon: PiggyBank,
      label: 'Om du sparar 30%',
      value: `${formatNumber(yearSavings)} kr/år`,
    },
  ];

  if (profile.savingsGoal > 0 && monthsToGoal > 0) {
    rows.push({
      icon: Calendar,
      label: profile.savingsGoalName || 'Sparmål',
      value: `~${monthsToGoal} mån`,
    });
  }

  const handlePrimary = () => {
    if (concern?.action && onFirstAction) onFirstAction(concern.action);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[rgba(11,18,32,0.4)] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[28px] p-6 shadow-[var(--anchor-shadow-1)]"
        style={elevatedSheet()}
      >
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className={dashLabel}>Start</p>
            <h2 className="text-[24px] font-light text-[var(--color-text-primary)] tracking-tight mt-1">
              Din ekonomi i korthet
            </h2>
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-2 font-light leading-relaxed">
              {concern?.hint || 'Utifrån det du just fyllt i.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ul className="space-y-3 mb-6">
          {rows.map(({ icon: Icon, label, value }) => (
            <li
              key={label}
              className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-background-secondary)] flex items-center justify-center shadow-[var(--anchor-shadow-1)]">
                <Icon className="w-4 h-4 text-[var(--color-accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
                <p className="text-[16px] font-medium text-[var(--color-text-primary)] tabular-nums">{value}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <button type="button" onClick={handlePrimary} className={`${techCta} w-full`}>
            {concern?.cta || 'Kom igång'}
          </button>
          <button type="button" onClick={onClose} className={`${techCtaGhost} w-full`}>
            Utforska själv
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
