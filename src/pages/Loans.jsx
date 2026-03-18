import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Landmark, TrendingDown, PiggyBank, AlertCircle, CheckCircle, ChevronRight, Percent, Zap, Scissors, MessageSquare, Droplets, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function Loans() {
  const [debtEraserResult, setDebtEraserResult] = useState(null);
  const [negotiationScript, setNegotiationScript] = useState(null);
  const [loadingEraser, setLoadingEraser] = useState(null);
  const [loadingNegotiate, setLoadingNegotiate] = useState(null);
  const [selectedLoanIdx, setSelectedLoanIdx] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const loans = profile?.loans || [];
  const totalDebt = loans.reduce((sum, l) => sum + (l.totalAmount || 0), 0);
  const totalMonthly = loans.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
  const totalInterestMonthly = loans.reduce((sum, l) => sum + ((l.totalAmount || 0) * ((l.interestRate || 0) / 100 / 12)), 0);
  const totalInterestYearly = totalInterestMonthly * 12;

  const sortedLoans = [...loans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));

  const monthlyDisposable = profile
    ? (profile.income || 0) - (profile.housingCost || 0) - totalMonthly - (profile.subscriptions || []).reduce((s, sub) => s + (sub.amount || 0), 0)
    : 0;
  const extraPayment = Math.round(Math.min(monthlyDisposable * 0.2, 500));

  const runDebtEraser = async (loan, idx) => {
    setLoadingEraser(idx);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en CFO. Användaren har ett lån:
Namn: ${loan.name}
Skuld: ${loan.totalAmount} kr
Ränta: ${loan.interestRate}%
Månadsbetalning: ${loan.monthlyPayment} kr/mån
Disponibel marginal att flytta: ${extraPayment} kr/mån

Beräkna:
1. Nuvarande tid att bli skuldfri (månader)
2. Tid om de betalar ${extraPayment} kr extra/mån
3. Hur många månader snabbare
4. Total räntebesparing i kr

Ge ett kort, engagerande svar på svenska. Max 3 meningar. Inkludera siffrorna.`,
      response_json_schema: {
        type: 'object',
        properties: {
          monthsNow: { type: 'number' },
          monthsWithExtra: { type: 'number' },
          monthsFaster: { type: 'number' },
          interestSaved: { type: 'number' },
          message: { type: 'string' }
        }
      }
    });
    setDebtEraserResult({ ...res, loanName: loan.name, extra: extraPayment, idx });
    setLoadingEraser(null);
  };

  const runNegotiation = async (loan, idx) => {
    setLoadingNegotiate(idx);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generera ett kort, professionellt förhandlingsmanus på svenska för att sänka räntan på ett lån.
Lånets namn: ${loan.name}
Nuvarande ränta: ${loan.interestRate}%
Skuld: ${loan.totalAmount} kr

Manus ska vara: Hej [Bankens namn]... och referera till att användaren har bättre koll på sin ekonomi via en app och vill matcha marknadsräntan. Ca 3-4 meningar. Avsluta med ett artigt "Tack på förhand."`,
      response_json_schema: {
        type: 'object',
        properties: { script: { type: 'string' } }
      }
    });
    setNegotiationScript({ script: res.script, loanName: loan.name, idx });
    setLoadingNegotiate(null);
  };

  return (
    <div className="min-h-screen pb-12 px-4 pt-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="rounded-xl text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Lånintelligens</h1>
          <p className="text-sm text-slate-400">Optimera & radera dina skulder</p>
        </div>
      </div>

      {loans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-white text-lg font-semibold">Inga lån registrerade</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Lägg till lån under Inställningar eller Onboarding så analyserar vi dem här.
          </p>
          <Link to={createPageUrl('Settings')}>
            <Button className="bg-indigo-500 hover:bg-indigo-600 mt-2">Gå till Inställningar</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Landmark className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-xs text-slate-400">Total skuld</p>
              <p className="text-lg font-bold text-white">{fmt(totalDebt)} kr</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <TrendingDown className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-xs text-slate-400">Månadsbetalning</p>
              <p className="text-lg font-bold text-white">{fmt(totalMonthly)} kr</p>
            </div>
          </div>

          {/* Ränte-Blödningen */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-rose-900/60 to-red-950/60 border border-rose-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Ränte-Blödningen</h3>
                <p className="text-rose-300 text-xs">Pengar du ger bort till banken varje månad</p>
              </div>
            </div>
            <div className="bg-rose-500/10 rounded-xl p-4 mb-3">
              <p className="text-3xl font-bold text-rose-300">{fmt(totalInterestMonthly)} kr/mån</p>
              <p className="text-rose-400 text-xs mt-1">= {fmt(totalInterestYearly)} kr per år i ren ränta</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalInterestMonthly / totalMonthly) * 100, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full"
              />
            </div>
            <p className="text-rose-400/70 text-xs mt-2">
              {Math.round((totalInterestMonthly / totalMonthly) * 100)}% av din månadsbetalning är ren ränta – resten amorterar.
            </p>
          </motion.div>

          {/* Loans list */}
          <h3 className="text-sm uppercase tracking-widest text-slate-400 mb-3 font-medium">Dina lån</h3>
          <div className="space-y-4 mb-6">
            {sortedLoans.map((loan, i) => {
              const monthlyInterest = (loan.totalAmount || 0) * ((loan.interestRate || 0) / 100 / 12);
              const pizzas = Math.round(monthlyInterest / 120);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-slate-300'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{loan.name}</p>
                          <p className="text-xs text-slate-400">{loan.interestRate || '?'}% ränta · {fmt(loan.totalAmount)} kr kvar</p>
                        </div>
                      </div>
                      {i === 0 && <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full">Högst prio</span>}
                    </div>

                    <div className="bg-rose-500/10 rounded-xl px-4 py-3 mb-3 text-sm">
                      <span className="text-rose-300 font-medium">{fmt(monthlyInterest)} kr</span>
                      <span className="text-rose-400/80"> i ränta / mån</span>
                      {pizzas > 0 && <span className="text-slate-400"> · {pizzas} 🍕 du ger bort varje månad</span>}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => runDebtEraser(loan, i)}
                        disabled={loadingEraser === i}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
                      >
                        {loadingEraser === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                        Radera snabbare
                      </button>
                      <button
                        onClick={() => runNegotiation(loan, i)}
                        disabled={loadingNegotiate === i}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                      >
                        {loadingNegotiate === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        Sänk min ränta
                      </button>
                    </div>
                  </div>

                  {/* Debt Eraser result */}
                  <AnimatePresence>
                    {debtEraserResult && debtEraserResult.idx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-indigo-900/30 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-indigo-400" />
                              <span className="text-indigo-300 font-semibold text-sm">Debt Eraser</span>
                            </div>
                            <button onClick={() => setDebtEraserResult(null)}><X className="w-4 h-4 text-slate-500" /></button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                              <p className="text-white font-bold">{debtEraserResult.monthsNow} mån</p>
                              <p className="text-slate-400 text-xs">Nu</p>
                            </div>
                            <div className="bg-indigo-500/20 rounded-xl p-3 text-center">
                              <p className="text-indigo-300 font-bold">{debtEraserResult.monthsWithExtra} mån</p>
                              <p className="text-slate-400 text-xs">Med extra</p>
                            </div>
                            <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
                              <p className="text-emerald-300 font-bold">{debtEraserResult.monthsFaster} mån</p>
                              <p className="text-slate-400 text-xs">Snabbare</p>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{debtEraserResult.message}</p>
                          <p className="text-emerald-400 text-sm font-medium mt-2">
                            Räntebesparing: {fmt(debtEraserResult.interestSaved)} kr 🎉
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Negotiation Script */}
                  <AnimatePresence>
                    {negotiationScript && negotiationScript.idx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-emerald-900/30 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-300 font-semibold text-sm">Förhandlingsmanus</span>
                            </div>
                            <button onClick={() => setNegotiationScript(null)}><X className="w-4 h-4 text-slate-500" /></button>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{negotiationScript.script}</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(negotiationScript.script)}
                            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Kopiera manus
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Payoff tips */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white mb-3 text-sm">Tips för snabbare avbetalning</h4>
            <ul className="space-y-2">
              {['Betala alltid mer på lånet med högst ränta först', 'Amortera extra vid bonus eller skatteåterbäring', 'Jämför räntor – byt till billigare alternativ'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}