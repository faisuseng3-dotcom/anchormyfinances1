import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function EventAnalysis({ mode, profile }) {
  const [event, setEvent] = useState({ name: '', cost: '', date: '', type: '' });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);

    if (mode === 'basic') {
      const monthsToSave = Math.ceil(parseInt(event.cost) / ((profile.income - profile.housingCost) * 0.2));
      const canAfford = parseInt(event.cost) <= profile.buffer;
      setAnalysis({
        type: 'basic',
        cost: parseInt(event.cost),
        monthsToSave,
        canAfford
      });
      setLoading(false);
      return;
    }

    const prompt = mode === 'smart'
      ? `Säsongsoptimering för ${event.name} (${event.type}) med budget ${event.cost} kr i ${event.date}.

Beräkna:
1. Alternativa datum som är billigare (off-season)
2. Alternativa platser med liknande kvalitet men lägre pris
3. Vad kan sparas utan att sänka kvaliteten?
4. Konkreta leverantörsalternativ

Ge optimeringsförslag som behåller upplevelsen men sänker kostnaden.`
      : `Recovery Plan för ${event.name} (${event.type}) till ${event.cost} kr.

Nuvarande buffert: ${profile.buffer} kr
Månatligt sparande: ${Math.round((profile.income - profile.housingCost) * 0.2)} kr
Sparmål: ${profile.savingsGoal} kr (${profile.savingsGoalName})

Beräkna:
1. Exakt antal månader att återställa bufferten efter eventet
2. Påverkan på långsiktiga sparmål
3. Om återhämtningen tar >18 månader, föreslå 15% budgetminskning
4. Risk-bedömning för ekonomisk stabilitet post-event
5. Alternative timeline: Vad händer om eventet skjuts upp 6 månader?

Ge detaljerad recovery plan och strategisk rekommendation.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: mode === 'smart',
        response_json_schema: mode === 'smart' ? {
          type: 'object',
          properties: {
            alternative_dates: {
              type: 'array',
              items: { type: 'string' }
            },
            alternative_locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  savings: { type: 'number' }
                }
              }
            },
            optimization_tips: {
              type: 'array',
              items: { type: 'string' }
            },
            total_potential_savings: { type: 'number' }
          }
        } : {
          type: 'object',
          properties: {
            recovery_months: { type: 'number' },
            goal_delay_months: { type: 'number' },
            suggest_reduction: { type: 'boolean' },
            reduced_budget: { type: 'number' },
            risk_assessment: { type: 'string' },
            alternative_timeline: { type: 'string' },
            recommendation: { type: 'string' }
          }
        }
      });

      setAnalysis({ type: mode, ...result });
    } catch (error) {
      console.error('Failed to analyze:', error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-amber-400" />
          Eventinformation
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Typ av event</Label>
            <Input
              value={event.type}
              onChange={(e) => setEvent({ ...event, type: e.target.value })}
              placeholder="t.ex. Bröllop, 30-årsfest, Studenten"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Eventnamn</Label>
            <Input
              value={event.name}
              onChange={(e) => setEvent({ ...event, name: e.target.value })}
              placeholder="t.ex. Bröllop i skärgården"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total kostnad (kr)</Label>
              <Input
                type="number"
                value={event.cost}
                onChange={(e) => setEvent({ ...event, cost: e.target.value })}
                placeholder="150000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Datum/Månad</Label>
              <Input
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                placeholder="Juni 2026"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <Button
        onClick={handleAnalyze}
        disabled={!event.name || !event.cost || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Analyserar event...
          </>
        ) : (
          <>Analysera event</>
        )}
      </Button>

      {analysis && (
        <>
          {analysis.type === 'basic' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border-2 ${
                analysis.canAfford
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-amber-500 bg-amber-500/10'
              }`}
            >
              <h3 className="font-bold text-white text-xl mb-2">
                {formatNumber(analysis.cost)} kr
              </h3>
              {analysis.canAfford ? (
                <p className="text-sm font-medium text-emerald-400">
                  ✓ Du har råd från nuvarande buffert
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-amber-400 mb-2">
                    ⚠️ Behöver spara {analysis.monthsToSave} månader
                  </p>
                  <p className="text-xs text-slate-400">
                    Baserat på 20% av disponibel inkomst per månad
                  </p>
                </>
              )}
            </motion.div>
          )}

          {analysis.type === 'smart' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {analysis.total_potential_savings > 0 && (
                <div className="glass-effect p-6 rounded-2xl text-center">
                  <p className="text-sm text-slate-400 mb-1">Potentiell besparing</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    {formatNumber(analysis.total_potential_savings)} kr
                  </p>
                </div>
              )}

              {analysis.alternative_dates?.length > 0 && (
                <div className="dark-card p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Billigare datum</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.alternative_dates.map((date, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="text-blue-400">→</span>
                        {date}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.alternative_locations?.length > 0 && (
                <div className="dark-card p-5 rounded-xl">
                  <h4 className="font-semibold text-white mb-3">Alternativa platser</h4>
                  <div className="space-y-3">
                    {analysis.alternative_locations.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-sm text-slate-300">{loc.name}</span>
                        <span className="text-emerald-400 font-medium">-{formatNumber(loc.savings)} kr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.optimization_tips?.length > 0 && (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <h4 className="font-semibold text-white mb-3">Optimeringstips</h4>
                  <ul className="space-y-2">
                    {analysis.optimization_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {analysis.type === 'pro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="dark-card p-6 rounded-2xl">
                <h3 className="font-semibold text-white mb-4">Recovery Plan</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Återställningstid för buffert</p>
                    <p className="text-3xl font-bold text-amber-400">{analysis.recovery_months} månader</p>
                  </div>
                  {analysis.goal_delay_months > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Fördröjning av sparmål</p>
                      <p className="text-2xl font-bold text-blue-400">+{analysis.goal_delay_months} månader</p>
                    </div>
                  )}
                </div>
              </div>

              {analysis.suggest_reduction && (
                <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        ⚠️ Återhämtning över 18 månader
                      </h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Förslag: Minska budgeten med 15%
                      </p>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                        <span className="text-sm text-slate-400">Justerad budget:</span>
                        <span className="text-amber-400 font-bold">{formatNumber(analysis.reduced_budget)} kr</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="dark-card p-5 rounded-xl">
                <h4 className="font-semibold text-white mb-2">Riskbedömning</h4>
                <p className="text-sm text-slate-300 mb-4">{analysis.risk_assessment}</p>
                
                {analysis.alternative_timeline && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-slate-400 mb-2">Alternativ: Skjut upp 6 månader</p>
                    <p className="text-sm text-blue-300">{analysis.alternative_timeline}</p>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                <h4 className="font-semibold text-white mb-2">Strategisk rekommendation</h4>
                <p className="text-sm text-slate-300">{analysis.recommendation}</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}