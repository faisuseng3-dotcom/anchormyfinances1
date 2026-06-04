import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Loader2, ChevronRight, Radar, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function GoldCoin({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      className="text-2xl">🪙</motion.div>
  );
}

export default function OpportunityScanner({ profile }) {
  const [scanning, setScanning] = useState(false);
  const [opportunities, setOpportunities] = useState(null);
  const [claimed, setClaimed] = useState({});
  const [pendingClaim, setPendingClaim] = useState(null);
  const [totalFound, setTotalFound] = useState(0);
  const queryClient = useQueryClient();

  const subs = profile?.subscriptions || [];
  const buffer = profile?.buffer || 0;
  const savingsGoalName = profile?.savingsGoalName || 'sparpoolen';
  const income = profile?.income || 30000;
  const totalFixed = (profile?.housingCost || 0) + (subs.reduce((s, x) => s + x.amount, 0));
  const margin = income - totalFixed;

  // Auto-generate proactive local opportunities
  const localOpportunities = [];

  // Buffer interest opportunity
  if (buffer >= 5000) {
    const currentRate = 0.5;
    const marketRate = 4.2;
    const yearlyMissed = Math.round(buffer * (marketRate - currentRate) / 100);
    if (yearlyMissed > 500) {
      localOpportunities.push({
        id: 'buffer_rate',
        icon: '🏦',
        title: 'Bättre sparkonto',
        description: `Din buffert på ${fmt(buffer)} kr ger ~0.5% ränta. Marknadsbäst är 4.2%.`,
        monthly_saving: Math.round(yearlyMissed / 12),
        yearly_saving: yearlyMissed,
        action: `Flytta bufferten till ett högräntekonto`,
        tip: `Dessa ${fmt(Math.round(yearlyMissed / 12))} kr/mån kan gå direkt till "${savingsGoalName}"`,
      });
    }
  }

  // Subscription optimization
  subs.forEach(sub => {
    if (sub.amount > 200 && sub.category === 'streaming') {
      localOpportunities.push({
        id: `sub_${sub.name}`,
        icon: '📱',
        title: `Optimera ${sub.name}`,
        description: `${sub.name} kostar ${fmt(sub.amount)} kr/mån. Delar du med någon?`,
        monthly_saving: Math.round(sub.amount * 0.4),
        yearly_saving: Math.round(sub.amount * 0.4 * 12),
        action: 'Dela prenumerationen',
        tip: `Du kan spara upp till ${fmt(Math.round(sub.amount * 0.4))} kr/mån`,
      });
    }
  });

  // Low margin alert
  if (margin < income * 0.15) {
    localOpportunities.push({
      id: 'margin_boost',
      icon: '⚡',
      title: 'Marginal-booster',
      description: `Din marginal är ${Math.round((margin / income) * 100)}% av inkomsten. 20%+ är målet.`,
      monthly_saving: Math.round(income * 0.2 - margin),
      yearly_saving: Math.round((income * 0.2 - margin) * 12),
      action: 'Analysera fasta kostnader',
      tip: 'Varje krona du frigör kan automatiseras till sparande',
    });
  }

  const handleDeepScan = async () => {
    setScanning(true);
    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en ekonomisk skattjägare för en privatperson i Sverige 2026. Hitta "gratispengar".

Abonnemang: ${subs.map(s => `${s.name}: ${s.amount} kr/mån (${s.category})`).join(', ') || 'inga'}
Inkomst: ${fmt(income)} kr/mån
Marginal: ${fmt(margin)} kr/mån
Buffert: ${fmt(buffer)} kr
Sparmål: "${savingsGoalName}"

Hitta max 3 konkreta möjligheter att spara pengar. Varje möjlighet ska vara en SPECIFIK åtgärd, inte ett generellt råd. Fokusera på abonnemang, räntor och dolda kostnader.

För varje möjlighet:
- title: kort titel
- description: 1 mening om problemet
- monthly_saving: uppskattad besparing kr/mån
- action: konkret nästa steg (max 10 ord)
- tip: hur besparingen kopplas till sparmålet

Svara ENDAST med JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                monthly_saving: { type: 'number' },
                action: { type: 'string' },
                tip: { type: 'string' },
              }
            }
          },
          total_monthly: { type: 'number' },
        }
      }
    });

    const combined = [
      ...localOpportunities,
      ...(ai.opportunities || []).map((o, i) => ({ ...o, id: `ai_${i}`, icon: '🤖' }))
    ];
    setOpportunities(combined);
    setTotalFound(combined.reduce((s, o) => s + (o.monthly_saving || 0), 0));
    setScanning(false);
  };

  // Auto-show local on mount
  useEffect(() => {
    if (localOpportunities.length > 0) {
      setOpportunities(localOpportunities);
      setTotalFound(localOpportunities.reduce((s, o) => s + (o.monthly_saving || 0), 0));
    }
  }, []);

  const handleClaimConfirm = async (opp) => {
    // Move savings amount from expenses to savings in profile
    if (profile?.id && opp.monthly_saving > 0) {
      const newSavingsBalance = (profile.savingsCurrentBalance || 0) + opp.monthly_saving;
      await base44.entities.FinancialProfile.update(profile.id, {
        savingsCurrentBalance: newSavingsBalance,
      });
      // Log as transaction
      await base44.entities.Transaction.create({
        type: 'savings_deposit',
        amount: opp.monthly_saving,
        label: `Vinst: ${opp.title}`,
        category: 'savings',
      });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
    setClaimed(c => ({ ...c, [opp.id]: true }));
    setPendingClaim(null);
  };

  return (
    <div className="space-y-5">
      {/* Header + scan */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Möjlighets-Radarn</h3>
          </div>
          {totalFound > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="px-3 py-1 rounded-full text-xs font-black text-amber-900"
              style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}>
              🪙 {fmt(totalFound)} kr/mån hittat!
            </motion.div>
          )}
        </div>

        <Button onClick={handleDeepScan} disabled={scanning}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white hover:opacity-90">
          {scanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Jagar gratispengar…</> : <><Radar className="w-4 h-4 mr-2" />Starta djupskanning</>}
        </Button>
      </div>

      {/* Opportunities list */}
      <AnimatePresence>
        {opportunities && opportunities.length > 0 && (
          <div className="space-y-3">
            {opportunities.map((opp, i) => (
              <motion.div key={opp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-4 transition-all ${claimed[opp.id] ? 'opacity-50' : ''}`}
                style={{ background: 'rgba(17,24,39,0.6)', border: claimed[opp.id] ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(251,191,36,0.25)' }}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{opp.icon || '🪙'}</span>
                    {!claimed[opp.id] && <GoldCoin delay={i * 0.1 + 0.3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{opp.title}</p>
                      <span className="text-amber-400 font-black text-sm flex-shrink-0">+{fmt(opp.monthly_saving)} kr/mån</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{opp.description}</p>
                    {opp.tip && <p className="text-xs text-emerald-300 mb-3">"{ opp.tip}"</p>}
                    {!claimed[opp.id] ? (
                      pendingClaim === opp.id ? (
                        <div className="space-y-2">
                          <p className="text-xs text-amber-300">Bekräfta: {opp.monthly_saving > 0 ? `+${fmt(opp.monthly_saving)} kr läggs till i "${savingsGoalName}"` : 'Åtgärd genomförd?'}</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleClaimConfirm(opp)}
                              className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ja, klar!
                            </button>
                            <button onClick={() => setPendingClaim(null)}
                              className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Avbryt</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPendingClaim(opp.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                          {opp.action} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <p className="text-xs text-emerald-400 font-bold">✓ +{fmt(opp.monthly_saving)} kr till {savingsGoalName}!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Total summary */}
            {totalFound > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="rounded-2xl p-4 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))', border: '1px solid rgba(251,191,36,0.3)' }}>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Om du agerar på allt</p>
                <p className="text-3xl font-black text-amber-400">{fmt(totalFound * 12)} kr</p>
                <p className="text-xs text-slate-400 mt-1">extra per år till "{savingsGoalName}"</p>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}