import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import {
  anchorIconButtonClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
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
      sub: 'Ungefärlig marginal',
    },
    {
      icon: PiggyBank,
      label: 'Om du sparar 30%',
      value: `${formatNumber(yearSavings)} kr`,
      sub: 'på ett år',
    },
  ];

  if (profile.savingsGoal > 0 && monthsToGoal > 0) {
    rows.push({
      icon: Calendar,
      label: profile.savingsGoalName || 'Sparmål',
      value: `cirka ${monthsToGoal} mån`,
      sub: 'med nuvarande tempo',
    });
  }

  const handlePrimary = () => {
    if (concern?.action && onFirstAction) {
      onFirstAction(concern.action);
    }
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6"
        style={elevatedSheet()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className={sectionMetaClass}>Översikt</p>
            <h2 className={`${sectionTitleClass} mt-0.5`}>Din ekonomi i korthet</h2>
            <p className={`${sectionSubtitleClass} mt-1`}>
              {concern?.hint || 'Baserat på det du fyllt i under onboarding.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {rows.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white/75" />
              </div>
              <div className="min-w-0">
                <p className={sectionMetaClass}>{label}</p>
                <p className="text-[20px] font-semibold text-white tabular-nums leading-tight">{value}</p>
                <p className={sectionMetaClass}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {concern?.cta ? (
          <button type="button" onClick={handlePrimary} className={`w-full ${anchorPrimaryButtonClass} mb-2`}>
            {concern.cta}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className={`w-full ${concern?.cta ? anchorSecondaryButtonClass : anchorPrimaryButtonClass}`}
        >
          {concern?.cta ? 'Gå till översikten' : 'Fortsätt till översikten'}
        </button>
      </motion.div>
    </motion.div>
  );
}
