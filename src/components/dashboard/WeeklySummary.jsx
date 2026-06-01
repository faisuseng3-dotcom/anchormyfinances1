import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { anchorPrimaryButtonClass, anchorSecondaryButtonClass, elevatedSheet } from '@/lib/anchorTheme';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

const cardStyle = elevatedSheet();

export default function WeeklySummary() {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);

    try {
      const expenses = profile?.monthlyExpenses || [];
      const last7Days = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return expDate >= sevenDaysAgo;
      });

      const totalSpent = last7Days.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryTotals = {};
      last7Days.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });
      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

      const response = await askPersonalAdvisor(
        { scenario: 'weekly_summary' },
        { profile, transactions, isDemoMode },
      );

      setSummary({
        text: [response.summary, response.highlight, response.next_step].filter(Boolean).join(' '),
        totalSpent,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        purchaseCount: last7Days.length,
      });

      base44.analytics.track({
        eventName: 'weekly_summary_generated',
      });
    } catch (error) {
      console.error('Summary error:', error);
    }

    setLoading(false);
  };

  if (summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 border border-white/[0.1]"
        style={cardStyle}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#9FB5FF]" />
          <h3 className="font-semibold text-white">Din veckosammanfattning</h3>
        </div>

        <p className="text-white/80 text-sm leading-relaxed mb-4">{summary.text}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 border border-white/[0.08] bg-white/[0.04]">
            <p className="text-white/45 text-xs">Spenderat</p>
            <p className="font-semibold text-lg text-white tabular-nums">{formatNumber(summary.totalSpent)} kr</p>
          </div>
          <div className="rounded-xl p-3 border border-white/[0.08] bg-white/[0.04]">
            <p className="text-white/45 text-xs">Antal köp</p>
            <p className="font-semibold text-lg text-white tabular-nums">{summary.purchaseCount}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSummary(null)}
          className={`${anchorSecondaryButtonClass} w-full mt-4 h-10`}
        >
          Stäng
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/[0.1]"
      style={cardStyle}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#6B9FFF]/15 flex items-center justify-center border border-[#6B9FFF]/25">
          <Sparkles className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Veckosammanfattning</h3>
          <p className="text-xs text-white/45">Personlig analys utifrån din profil</p>
        </div>
      </div>

      <button
        type="button"
        onClick={generateSummary}
        disabled={loading}
        className={`${anchorPrimaryButtonClass} w-full h-11`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Genererar…
          </>
        ) : (
          'Generera sammanfattning'
        )}
      </button>
    </motion.div>
  );
}
