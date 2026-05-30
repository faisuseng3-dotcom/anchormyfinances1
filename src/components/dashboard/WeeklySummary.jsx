import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function WeeklySummary({ profile }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);

    try {
      const expenses = profile?.monthlyExpenses || [];
      const last7Days = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return expDate >= sevenDaysAgo;
      });

      const totalSpent = last7Days.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryTotals = {};
      last7Days.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });
      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

      const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
      const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
      const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
      const monthlyMargin = profile.income - totalFixedCosts;

      const response = await askPersonalAdvisor({ scenario: 'weekly_summary' });

      setSummary({
        text: [response.summary, response.highlight, response.next_step].filter(Boolean).join(' '),
        totalSpent,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        purchaseCount: last7Days.length
      });

      base44.analytics.track({
        eventName: 'weekly_summary_generated'
      });
    } catch (error) {
      console.error('Summary error:', error);
    }

    setLoading(false);
  };

  if (summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Din veckosammanfattning</h3>
        </div>
        
        <p className="text-white/90 text-sm leading-relaxed mb-4">{summary.text}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white/70 text-xs">Spenderat</p>
            <p className="font-bold text-lg">{formatNumber(summary.totalSpent)} kr</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white/70 text-xs">Antal köp</p>
            <p className="font-bold text-lg">{summary.purchaseCount}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSummary(null)}
          className="w-full mt-3 text-white hover:bg-white/20"
        >
          Stäng
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Veckosammanfattning</h3>
          <p className="text-xs text-slate-500">AI-genererad analys</p>
        </div>
      </div>

      <Button
        onClick={generateSummary}
        disabled={loading}
        className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Genererar...
          </>
        ) : (
          'Generera sammanfattning'
        )}
      </Button>
    </motion.div>
  );
}