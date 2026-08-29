// @ts-nocheck
import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MessageSquare, X, Scissors, Zap, TrendingUp } from 'lucide-react';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import CopilotDebtFreedomHero from '@/components/ui-premium/copilot/CopilotDebtFreedomHero';
import { copilotSecondaryBtnClass, copilotPrimaryBtnClass } from '@/lib/copilotTheme';
import { staggerItem } from '@/lib/motionPresets';
import ContextualLessonLink from '@/components/anchorBrain/ContextualLessonLink';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { triggerHaptic } from '@/lib/haptics';
import { toast } from 'sonner';
import { estimateMonthsToDebtFree } from '@/lib/loanMath';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function Loans() {
  const [debtEraserResult, setDebtEraserResult] = useState(null);
  const [negotiationScript, setNegotiationScript] = useState(null);
  const [loadingEraser, setLoadingEraser] = useState(null);
  const [loadingNegotiate, setLoadingNegotiate] = useState(null);
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions();

  const loans = profile?.loans || [];
  const totalDebt = loans.reduce((sum, l) => sum + (l.totalAmount || 0), 0);
  const totalMonthly = loans.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
  const totalInterestMonthly = loans.reduce(
    (sum, l) => sum + ((l.totalAmount || 0) * ((l.interestRate || 0) / 100 / 12)),
    0,
  );
  const totalInterestYearly = totalInterestMonthly * 12;
  const sortedLoans = [...loans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));

  const monthlyDisposable = profile
    ? (profile.income || 0)
      - (profile.housingCost || 0)
      - totalMonthly
      - (profile.subscriptions || []).reduce((s, sub) => s + (sub.amount || 0), 0)
    : 0;
  const extraPayment = Math.round(Math.min(monthlyDisposable * 0.2, 500));

  const runDebtEraser = async (loan, idx) => {
    if (!(loan.monthlyPayment > 0)) return;
    setLoadingEraser(idx);
    const isZero = (loan.interestRate || 0) === 0;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Du är en CFO. Lån: ${loan.name}, skuld ${loan.totalAmount} kr, ränta ${loan.interestRate}%, ${loan.monthlyPayment} kr/mån. Extra: ${extraPayment} kr/mån.
${isZero
  ? `Ränta 0%. Fokus på tid och kassaflöde. interestSaved=0.`
  : `Beräkna månader nu, med extra, månader snabbare, räntebesparing.`}
Kort svar svenska, max 3 meningar.`,
        response_json_schema: {
          type: 'object',
          properties: {
            monthsNow: { type: 'number' },
            monthsWithExtra: { type: 'number' },
            monthsFaster: { type: 'number' },
            interestSaved: { type: 'number' },
            message: { type: 'string' },
          },
        },
      });
      setDebtEraserResult({ ...res, loanName: loan.name, extra: extraPayment, idx });
      triggerHaptic('success');
    } catch {
      toast.error('Kunde inte hämta analys just nu. Försök igen.');
    } finally {
      setLoadingEraser(null);
    }
  };

  const runNegotiation = async (loan, idx) => {
    setLoadingNegotiate(idx);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Förhandlingsmanus svenska för att sänka ränta. Lån: ${loan.name}, ${loan.interestRate}%, ${loan.totalAmount} kr. 3-4 meningar.`,
        response_json_schema: { type: 'object', properties: { script: { type: 'string' } } },
      });
      setNegotiationScript({ script: res.script, loanName: loan.name, idx });
    } catch {
      toast.error('Kunde inte generera förhandlingsmanus. Försök igen.');
    } finally {
      setLoadingNegotiate(null);
    }
  };

  const highestInterestLoan = sortedLoans.find((l) => (l.interestRate || 0) > 0);
  const monthsLeft = estimateMonthsToDebtFree(loans);
  const principalMonthly = Math.max(0, totalMonthly - totalInterestMonthly);
  const principalPct = totalMonthly > 0 ? Math.min((principalMonthly / totalMonthly) * 100, 100) : 100;

  return (
    <PageShell title="Skuldfrihet" subtitle="Din plan mot frihet — steg för steg" backHref={createPageUrl('Dashboard')}>
      {loans.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle className="w-10 h-10 mx-auto mb-4 text-emerald-400/80" />
          <p className="text-[20px] font-bold text-[var(--color-text-primary)] mb-1">Du är redan på rätt spår</p>
          <p className="text-[14px] text-[var(--copilot-text-secondary)] leading-relaxed">
            Inga lån registrerade — lägg till under inställningar om du vill bygga en skuldfrihetsplan.
          </p>
          <Link
            to={createPageUrl('Settings')}
            className={`inline-flex mt-6 px-6 no-underline ${copilotPrimaryBtnClass}`}
          >
            Gå till inställningar
          </Link>
        </div>
      ) : (
        <>
          <motion.div {...staggerItem(0)}>
            <CopilotDebtFreedomHero loans={loans} extraPayment={extraPayment} className="mb-6" />
          </motion.div>

          <motion.div {...staggerItem(1)}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]">
                <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Mot frihet</p>
                <p className="text-[20px] font-bold text-[var(--color-text-primary)] tabular-nums mt-1">
                  {monthsLeft > 0 ? `${monthsLeft} mån` : 'På väg'}
                </p>
              </div>
              <div className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]">
                <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Plan per månad</p>
                <p className="text-[20px] font-bold text-[var(--copilot-accent-green)] tabular-nums mt-1">
                  {fmt(totalMonthly)} kr
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div {...staggerItem(2)}>
            <ContextualLessonLink profile={profile} transactions={transactions} className="block mb-6" />
          </motion.div>

          <motion.div {...staggerItem(3)}>
            <GlassSection title="Varje betalning räknas">
              <p className="text-[15px] text-[var(--copilot-text-secondary)] leading-relaxed mb-3">
                {principalMonthly > 0 ? (
                  <>
                    <span className="text-[var(--color-text-primary)] font-semibold tabular-nums">{fmt(principalMonthly)} kr</span>
                    {' '}av din månadsbetalning minskar skulden direkt.
                  </>
                ) : (
                  'Hela betalningen går mot skuldfrihet — inga räntekostnader.'
                )}
              </p>
              {totalMonthly > 0 && (
                <div
                  className="flex h-2.5 rounded-full overflow-hidden mb-2"
                  role="img"
                  aria-label={`${Math.round(principalPct)}% av betalningen går till amortering, resten till ränta`}
                >
                  <div style={{ width: `${principalPct}%`, background: 'var(--copilot-accent-green)' }} />
                  <div style={{ width: `${100 - principalPct}%`, background: 'var(--color-text-muted)' }} />
                </div>
              )}
              <div className="flex items-center gap-4 text-[12px] text-[var(--copilot-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--copilot-accent-green)' }} />
                  Amortering {Math.round(principalPct)}%
                </span>
                {totalInterestMonthly > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--color-text-muted)]" />
                    Ränta {Math.round(100 - principalPct)}%
                  </span>
                )}
              </div>
              {totalInterestMonthly > 0 && (
                <p className="text-[12px] text-[var(--copilot-text-muted)] mt-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--copilot-accent-green)]" />
                  Extra betalningar sparar upp till {fmt(totalInterestYearly)} kr/år.
                </p>
              )}
            </GlassSection>
          </motion.div>

          <motion.div {...staggerItem(4)}>
            <GlassSection title="Nästa steg i planen">
              <div className="space-y-3">
              {sortedLoans.map((loan, i) => {
                const isZeroInterest = (loan.interestRate || 0) === 0;
                const isHighestPrio =
                  highestInterestLoan && loan.name === highestInterestLoan.name && (loan.interestRate || 0) > 0;

                return (
                  <div key={i} className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-[15px] font-medium text-[var(--color-text-primary)] flex items-center gap-2 flex-wrap">
                            {loan.name}
                            {isHighestPrio && (
                              <span
                                className="text-[11px] text-[var(--copilot-accent-blue)] font-medium px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--color-accent-soft)', border: '1px solid rgba(37,99,235,0.25)' }}
                              >
                                Fokus nu
                              </span>
                            )}
                            {isZeroInterest && (
                              <span
                                className="text-[11px] text-[var(--copilot-accent-green)] font-medium px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--color-success-soft)', border: '1px solid rgba(22,163,74,0.25)' }}
                              >
                                Räntefritt
                              </span>
                            )}
                          </p>
                          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-0.5">
                            {fmt(loan.monthlyPayment)} kr/mån · kvar {fmt(loan.totalAmount)} kr
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <AnchorPressable
                          type="button"
                          minTouch={false}
                          onClick={() => runDebtEraser(loan, i)}
                          disabled={loadingEraser === i || !(loan.monthlyPayment > 0)}
                          className={`flex-1 !h-11 !text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40 ${copilotSecondaryBtnClass}`}
                        >
                          {loadingEraser === i ? (
                            <span className="w-4 h-4 rounded-full skeleton" />
                          ) : (
                            <Scissors className="w-4 h-4" />
                          )}
                          Snabbare avbetalning
                        </AnchorPressable>
                        {!isZeroInterest && (
                          <AnchorPressable
                            type="button"
                            minTouch={false}
                            onClick={() => runNegotiation(loan, i)}
                            disabled={loadingNegotiate === i}
                            className={`flex-1 !h-11 !text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40 ${copilotSecondaryBtnClass}`}
                          >
                            {loadingNegotiate === i ? (
                              <span className="w-4 h-4 rounded-full skeleton" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                            Sänk ränta
                          </AnchorPressable>
                        )}
                      </div>

                      <AnimatePresence>
                        {debtEraserResult?.idx === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-3 border-t border-[var(--color-border)]">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[14px] font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                                  <Zap className="w-4 h-4 text-[var(--color-accent)]" /> Analys
                                </span>
                                <AnchorPressable
                                  type="button"
                                  minTouch={false}
                                  onClick={() => setDebtEraserResult(null)}
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                                </AnchorPressable>
                              </div>
                              {debtEraserResult.monthsNow > 0 && debtEraserResult.monthsNow !== Infinity && (
                                <div className="flex flex-wrap gap-4 mb-2 text-[13px] text-[var(--color-text-secondary)]">
                                  <span>Nu: {debtEraserResult.monthsNow} mån</span>
                                  <span>Med extra: {debtEraserResult.monthsWithExtra} mån</span>
                                  <span className="text-[var(--color-success)]">−{debtEraserResult.monthsFaster} mån</span>
                                </div>
                              )}
                              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{debtEraserResult.message}</p>
                              {debtEraserResult.interestSaved > 0 && (
                                <p className="text-[14px] text-[var(--color-success)] mt-2 tabular-nums">
                                  Sparar {fmt(debtEraserResult.interestSaved)} kr i ränta
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {negotiationScript?.idx === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-3 border-t border-[var(--color-border)]">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[14px] font-medium text-[var(--color-text-secondary)]">Förhandlingsmanus</span>
                                <AnchorPressable
                                  type="button"
                                  minTouch={false}
                                  onClick={() => setNegotiationScript(null)}
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                                </AnchorPressable>
                              </div>
                              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                                {negotiationScript.script}
                              </p>
                              <AnchorPressable
                                type="button"
                                minTouch={false}
                                onClick={() => navigator.clipboard.writeText(negotiationScript.script)}
                                className="text-[13px] text-[var(--color-accent)] mt-2 font-medium min-h-10 px-1"
                              >
                                Kopiera
                              </AnchorPressable>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                );
              })}
              </div>
            </GlassSection>
          </motion.div>

          <motion.div {...staggerItem(5)}>
            <GlassSection title="Bygg momentum">
              <ul className="space-y-3">
                {[
                  'Fokusera på ett lån i taget — snabbast väg till skuldfrihet',
                  'Lägg bonus eller skatteåterbäring som extra steg i planen',
                  'Förhandla ränta — varje sparad krona fyller din frihetsring',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[14px] text-[var(--copilot-text-secondary)] leading-relaxed">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </GlassSection>
          </motion.div>
        </>
      )}
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Loans');