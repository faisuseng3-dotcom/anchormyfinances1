import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { X, Rocket, TrendingUp, CheckCircle } from 'lucide-react';

export default function FutureImpactModal({ result, onClose, onAdded }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const list = await base44.entities.FinancialProfile.list();
      return list[0] || null;
    }
  });

  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);
  const saleAmount = result?.avgPrice || 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const currentBalance = profile?.savingsCurrentBalance || 0;

  // How much closer to savings goal
  const newBalance = currentBalance + saleAmount;
  const progressBefore = savingsGoal > 0 ? Math.min(100, (currentBalance / savingsGoal) * 100) : 0;
  const progressAfter = savingsGoal > 0 ? Math.min(100, (newBalance / savingsGoal) * 100) : 0;

  // Monthly savings estimate: conservative 30% of margin
  const monthlySavings = margin * 0.3;
  const weeksCloser = monthlySavings > 0 ? Math.round((saleAmount / monthlySavings) * 4.33) : 0;

  // 5-year wealth projection
  const monthlyReturn = 0.005; // ~6% annual
  const months60 = 60;
  const withoutSale = margin * ((Math.pow(1 + monthlyReturn, months60) - 1) / monthlyReturn);
  const withSale = withoutSale + saleAmount * Math.pow(1 + monthlyReturn, months60);
  const extraWealth = Math.round(withSale - withoutSale);

  const handleAdd = async () => {
    setLoading(true);
    await base44.entities.Transaction.create({
      type: 'income',
      amount: saleAmount,
      label: `Försäljning: ${result.brand} ${result.model}`,
      vendor: result.recommendedPlatform || result.marketplaces?.[0] || 'Andrahandsmarknad',
      category: 'income',
      note: `Andrahandsvärde estimerat via ResellScanner. Spann: ${result.quickSalePrice}–${result.maxPrice} kr`,
      aiAgent: 'ResellScanner AI',
      aiNote: `Sälj på ${result.recommendedPlatform || 'Tradera'} för maximalt pris. ${result.sellingTips}`,
    });

    // Optionally update savings balance
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm mx-4 mb-8 rounded-3xl p-6 space-y-5"
        style={{ background: '#0f1525', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <p className="text-white font-bold">Lägg till i din framtid</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Sale amount */}
        <div className="text-center py-2">
          <p className="text-xs text-slate-500">Estimerat säljpris</p>
          <p className="text-4xl font-black text-white">{saleAmount.toLocaleString('sv-SE')} <span className="text-lg text-slate-400">kr</span></p>
          <p className="text-xs text-emerald-400 mt-1">på {result.recommendedPlatform || 'bästa plattformen'}</p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-slate-500 mb-1">Veckor närmare målet</p>
            <p className="text-2xl font-bold text-indigo-400">{weeksCloser > 0 ? `+${weeksCloser}` : '—'}</p>
          </div>
          <div className="rounded-2xl p-3 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-slate-500 mb-1">Extra efter 5 år (ränta)</p>
            <p className="text-2xl font-bold text-emerald-400">{extraWealth > 0 ? `+${extraWealth.toLocaleString('sv-SE')}` : '—'}</p>
          </div>
        </div>

        {/* Savings goal progress */}
        {savingsGoal > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{profile?.savingsGoalName || 'Sparmål'}</span>
              <span>{progressAfter.toFixed(0)}% ({newBalance.toLocaleString('sv-SE')} / {savingsGoal.toLocaleString('sv-SE')} kr)</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full relative rounded-full">
                {/* Before */}
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: `${progressBefore}%` }} />
                {/* After (animated) */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  initial={{ width: `${progressBefore}%` }}
                  animate={{ width: `${progressAfter}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
            <p className="text-xs text-emerald-400 mt-1.5 text-right">
              +{Math.round(progressAfter - progressBefore).toFixed(1)}% med denna försäljning
            </p>
          </div>
        )}

        {/* CTA */}
        {!added ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #10b981)' }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><TrendingUp className="w-5 h-5" /> Lägg till i min framtid</>
            )}
          </motion.button>
        ) : (
          <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-semibold border border-emerald-500/30" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle className="w-5 h-5" /> Tillagd i din ekonomi!
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}