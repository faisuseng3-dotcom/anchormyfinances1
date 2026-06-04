import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Calendar, Radio, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QuickStats from '@/components/dashboard/QuickStats';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function SmartDashboard({ profile }) {
  const [insights, setInsights] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzePatterns();
  }, [profile]);

  const analyzePatterns = async () => {
    setLoading(true);

    // Analyze spending patterns (Smart identifies WHY things happen)
    const expenses = profile.monthlyExpenses || [];
    const now = new Date();
    
    // Group by category and month
    const categoryByMonth = {};
    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!categoryByMonth[monthKey]) categoryByMonth[monthKey] = {};
      categoryByMonth[monthKey][e.category] = (categoryByMonth[monthKey][e.category] || 0) + e.amount;
    });

    const months = Object.keys(categoryByMonth).sort().slice(-3); // Last 3 months
    const detectedPatterns = [];

    // Pattern: Increasing category
    const categories = [...new Set(expenses.map(e => e.category))];
    categories.forEach(cat => {
      const monthlyAmounts = months.map(m => categoryByMonth[m]?.[cat] || 0);
      if (monthlyAmounts.length >= 2) {
        const isIncreasing = monthlyAmounts[monthlyAmounts.length - 1] > monthlyAmounts[0] * 1.2;
        if (isIncreasing) {
          detectedPatterns.push({
            type: 'trend',
            category: cat,
            message: `${cat} ökar över tid`,
            detail: `Upp ${Math.round(((monthlyAmounts[monthlyAmounts.length - 1] / monthlyAmounts[0]) - 1) * 100)}% senaste månaderna`
          });
        }
      }
    });

    setPatterns(detectedPatterns);

    // Generate AI insights with improvement suggestions
    const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
    const monthlyLeft = profile.income - totalFixedCosts;

    const prompt = `Du är en ekonomisk coach. Analysera följande ekonomiska situation och ge 2-3 konkreta förbättringsförslag:

Månadsinkomst: ${profile.income} kr
Fasta kostnader: ${totalFixedCosts} kr
Marginal: ${monthlyLeft} kr
Buffert: ${profile.buffer} kr
Sparmål: ${profile.savingsGoal} kr
Antal abonnemang: ${(profile.subscriptions || []).length}
Antal lån: ${(profile.loans || []).length}

Ge konkreta råd med beräknade effekter i kronor och över tid. Var specifik och motiverande.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  suggestion: { type: 'string' },
                  impact: { type: 'string' },
                  timeframe: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setInsights(result.insights || []);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }

    setLoading(false);
  };

  // 3-month projection (Smart shows short-term future)
  const totalFixedCosts = profile.housingCost + 
    (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0) +
    (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const monthlyLeft = profile.income - totalFixedCosts;
  const threeMonthSavings = monthlyLeft * 0.3 * 3;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats profile={profile} />

      {/* 3-Month Projection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">3-månaders prognos</h3>
            <p className="text-sm text-slate-400">Baserat på nuvarande beteende</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Beräknat sparande</p>
            <p className="text-2xl font-bold text-white">{formatNumber(threeMonthSavings)} kr</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Buffert om 3 mån</p>
            <p className="text-2xl font-bold text-white">{formatNumber(profile.buffer + threeMonthSavings)} kr</p>
          </div>
        </div>
      </motion.div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Upptäckta mönster
          </h3>
          <div className="space-y-3">
            {patterns.map((pattern, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="dark-card p-4 rounded-xl"
              >
                <p className="font-medium text-white mb-1">{pattern.message}</p>
                <p className="text-sm text-slate-400">{pattern.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Improvement Suggestions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          Förbättringsförslag
        </h3>
        {loading ? (
          <div className="dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Analyserar dina ekonomiska mönster...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="dark-card p-5 rounded-xl hover:border-indigo-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-400 mb-2">{insight.suggestion}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-emerald-400 font-medium">💰 {insight.impact}</span>
                      <span className="text-slate-500">⏱️ {insight.timeframe}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}