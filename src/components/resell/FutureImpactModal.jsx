import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { X, CheckCircle } from 'lucide-react';
import {
  anchorIconButtonClass,
  anchorPrimaryButtonClass,
  anchorZoneClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { DashboardStatStrip } from '@/components/dashboard/DashboardChrome';

export default function FutureImpactModal({ result, onClose, onAdded }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const list = await base44.entities.FinancialProfile.list();
      return list[0] || null;
    },
  });

  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);
  const saleAmount = result?.avgPrice || 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const currentBalance = profile?.savingsCurrentBalance || 0;

  const newBalance = currentBalance + saleAmount;
  const progressBefore = savingsGoal > 0 ? Math.min(100, (currentBalance / savingsGoal) * 100) : 0;
  const progressAfter = savingsGoal > 0 ? Math.min(100, (newBalance / savingsGoal) * 100) : 0;

  const monthlySavings = margin * 0.3;
  const weeksCloser = monthlySavings > 0 ? Math.round((saleAmount / monthlySavings) * 4.33) : 0;

  const handleAdd = async () => {
    setLoading(true);
    await base44.entities.Transaction.create({
      type: 'income',
      amount: saleAmount,
      label: `Försäljning: ${result.brand} ${result.model}`,
      vendor: result.recommendedPlatform || result.marketplaces?.[0] || 'Andrahandsmarknad',
      category: 'income',
      note: `Uppskattat via säljkollen. Spann: ${result.quickSalePrice}–${result.maxPrice} kr`,
    });

    if (profile?.id && savingsGoal > 0) {
      await base44.entities.FinancialProfile.update(profile.id, {
        savingsCurrentBalance: newBalance,
      });
    }

    setAdded(true);
    setLoading(false);
    onAdded?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-0 left-0 right-0 rounded-t-[24px] overflow-hidden max-h-[85vh]"
          style={elevatedSheet()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-white/20" />
          </div>

          <div className={`${anchorZoneClass} pb-10 space-y-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Lägg till försäljningen</h2>
                <p className={sectionSubtitleClass}>Registreras som inkomst i din profil</p>
              </div>
              <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <p className={sectionMetaClass}>Uppskattat pris</p>
              <p className="text-[32px] font-semibold text-white tabular-nums mt-1">
                {saleAmount.toLocaleString('sv-SE')}
                <span className="text-lg font-medium text-white/40 ml-1">kr</span>
              </p>
              {result.recommendedPlatform && (
                <p className={sectionSubtitleClass}>Bäst på {result.recommendedPlatform}</p>
              )}
            </div>

            <DashboardStatStrip
              items={[
                {
                  label: 'Närmare sparmål',
                  value: weeksCloser > 0 ? `~${weeksCloser} v` : '—',
                },
                {
                  label: 'Efter försäljning',
                  value: savingsGoal > 0 ? `${Math.round(progressAfter)} %` : '—',
                },
              ]}
            />

            {savingsGoal > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className={sectionMetaClass}>{profile?.savingsGoalName || 'Sparmål'}</span>
                  <span className={sectionMetaClass}>
                    {newBalance.toLocaleString('sv-SE')} / {savingsGoal.toLocaleString('sv-SE')} kr
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/50"
                    initial={{ width: `${progressBefore}%` }}
                    animate={{ width: `${progressAfter}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {!added ? (
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading}
                className={`${anchorPrimaryButtonClass} w-full disabled:opacity-50`}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                ) : (
                  'Lägg till i min ekonomi'
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-300/90 text-[15px] font-medium">
                <CheckCircle className="w-5 h-5" />
                Tillagd
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
