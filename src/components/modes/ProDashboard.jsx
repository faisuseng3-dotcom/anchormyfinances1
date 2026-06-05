import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Target, AlertTriangle, Radio, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QuickStats from '@/components/dashboard/QuickStats';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function ProDashboard({ profile }) {
  const [futureTimeline, setFutureTimeline] = useState([]);
  const [strategicBriefing, setStrategicBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionEngine, setShowDecisionEngine] = useState(false);

  useEffect(() => {
    generateProAnalysis();
  }, [profile]);

  const generateProAnalysis = async () => {
    setLoading(true);

    const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
    const monthlyLeft = profile.income - totalFixedCosts;
    const savingsRate = monthlyLeft * 0.3;

    // Generate 5-year timeline
    const timeline = [];
    let currentBuffer = profile.buffer;
    for (let year = 1; year <= 5; year++) {
      currentBuffer += savingsRate * 12;
      timeline.push({
        year,
        buffer: Math.round(currentBuffer),
        debtReduction: totalLoanPayments > 0 ? Math.round(totalLoanPayments * 12 * year) : 0,
        milestone: year === 3 ? 'Stark buffert uppnådd' : year === 5 ? 'Långsiktig stabilitet' : null
      });
    }
    setFutureTimeline(timeline);

    // Generate Strategic Monthly Briefing
    const prompt = `Du är en strategisk ekonomisk rådgivare. Skapa en professionell månatlig briefing för användaren:

Nuläge:
- Inkomst: ${profile.income} kr/mån
- Fasta kostnader: ${totalFixedCosts} kr/mån
- Marginal: ${monthlyLeft} kr/mån
- Buffert: ${profile.buffer} kr
- Lån: ${(profile.loans || []).length} st

Analysera:
1. Förbättringar sedan förra månaden
2. Identifierade risker framåt
3. Strategiska rekommendationer
4. Optimeringsmöjligheter

Svara professionellt som en senior finansiell strateg.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            improvements: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            optimizations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setStrategicBriefing(result);
    } catch (error) {
      console.error('Failed to generate briefing:', error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats profile={profile} />

      {/* 5-Year Future Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">5-års framtidsprognos</h3>
            <p className="text-sm text-slate-400">Baserat på nuvarande beteende och strategi</p>
          </div>
        </div>
        <div className="space-y-4">
          {futureTimeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
            >
              <div className="text-center min-w-[60px]">
                <p className="text-2xl font-bold text-white">År {item.year}</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Beräknad buffert</p>
                  <p className="text-lg font-bold text-emerald-400">{formatNumber(item.buffer)} kr</p>
                </div>
                {item.debtReduction > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">Nedbetalt lån</p>
                    <p className="text-lg font-bold text-blue-400">{formatNumber(item.debtReduction)} kr</p>
                  </div>
                )}
              </div>
              {item.milestone && (
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  {item.milestone}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Decision Engine */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDecisionEngine(true)}
        className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-white text-lg">Beslutsmotor</h3>
            <p className="text-sm text-purple-100">Simulera köp eller livsbeslut innan du tar dem</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white">→</span>
          </div>
        </div>
      </motion.button>

      {/* Strategic Monthly Briefing */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Strategisk månadsbriefing
        </h3>
        {loading ? (
          <div className="dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Genererar strategisk analys...</p>
            </div>
          </div>
        ) : strategicBriefing && (
          <div className="space-y-4">
            {/* Improvements */}
            {strategicBriefing.improvements?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dark-card p-5 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-semibold text-white">Förbättringar</h4>
                </div>
                <ul className="space-y-2">
                  {strategicBriefing.improvements.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Risks */}
            {strategicBriefing.risks?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="dark-card p-5 rounded-xl border border-amber-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold text-white">Identifierade risker</h4>
                </div>
                <ul className="space-y-2">
                  {strategicBriefing.risks.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-1">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Recommendations */}
            {strategicBriefing.recommendations?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="dark-card p-5 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-semibold text-white">Strategiska rekommendationer</h4>
                </div>
                <ul className="space-y-2">
                  {strategicBriefing.recommendations.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}