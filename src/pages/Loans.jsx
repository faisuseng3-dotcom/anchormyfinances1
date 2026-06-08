// @ts-nocheck
import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MessageSquare, X, Scissors, Zap, PiggyBank } from 'lucide-react';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import {
  DashboardDivider,
  DashboardSection,
  DashboardStatStrip,
} from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { staggerItem } from '@/lib/motionPresets';
import { surface } from '@/lib/designTokens';
import ContextualLessonLink from '@/components/anchorBrain/ContextualLessonLink';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function LoansHero({ totalDebt, totalMonthly, loanCount }) {
  return (
    <div className="anchor-premium-hero">
      <div className="relative z-10 anchor-hero-asymmetric">
        <div>
          <p className="anchor-type-body-sm text-white/45">Total skuld</p>
          <p className="anchor-type-headline text-[26px] mt-1 tabular-nums">{fmt(totalDebt)} kr</p>
          <p className="anchor-type-body-sm mt-2">
            {fmt(totalMonthly)} kr/mån · {loanCount} lån
          </p>
        </div>
        <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] bg-rose-400/10 ring-1 ring-rose-400/20 flex items-center justify-center anchor-elev-1 shrink-0">
          <PiggyBank className="w-5 h-5 text-rose-300" />
        </div>
      </div>
    </div>
  );
}

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
    const res = await base44.integrations.Core.InvokeLLM({
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
    setLoadingEraser(null);
  };

  const runNegotiation = async (loan, idx) => {
    setLoadingNegotiate(idx);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Förhandlingsmanus svenska för att sänka ränta. Lån: ${loan.name}, ${loan.interestRate}%, ${loan.totalAmount} kr. 3-4 meningar.`,
      response_json_schema: { type: 'object', properties: { script: { type: 'string' } } },
    });
    setNegotiationScript({ script: res.script, loanName: loan.name, idx });
    setLoadingNegotiate(null);
  };

  const highestInterestLoan = sortedLoans.find((l) => (l.interestRate || 0) > 0);
  const interestPct = totalMonthly > 0 ? Math.min((totalInterestMonthly / totalMonthly) * 100, 100) : 0;

  return (
    <PageShell title="Lån" subtitle="Jämför och förbättra" backHref={createPageUrl('Dashboard')}>
      {loans.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle className="w-10 h-10 mx-auto mb-4 text-emerald-400/80" />
          <p className="anchor-type-headline mb-1">Inget lån här ännu</p>
          <p className={sectionSubtitleClass}>
            Lägg till ditt lån under inställningar — då kan vi räkna på ränta och extra betalningar.
          </p>
          <Link
            to={createPageUrl('Settings')}
            className="inline-flex mt-6 h-12 px-6 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold items-center anchor-elev-2 no-underline"
          >
            Gå till inställningar
          </Link>
        </div>
      ) : (
        <>
          <motion.div {...staggerItem(0)}>
            <LoansHero totalDebt={totalDebt} totalMonthly={totalMonthly} loanCount={loans.length} />
          </motion.div>

          <motion.div {...staggerItem(1)}>
            <DashboardStatStrip
              items={[
                { label: 'Total skuld', value: `${fmt(totalDebt)} kr` },
                { label: 'Per månad', value: `${fmt(totalMonthly)} kr` },
              ]}
            />
          </motion.div>

          <motion.div {...staggerItem(2)}>
            <ContextualLessonLink profile={profile} transactions={transactions} className="block mb-6" />
          </motion.div>

          <motion.div {...staggerItem(3)}>
            <GlassSection title="Räntekostnad">
              {totalInterestMonthly > 0 ? (
                <>
                  <p className="text-[28px] font-light text-rose-300 tabular-nums leading-none tracking-tight">
                    {fmt(totalInterestMonthly)} <span className="text-lg text-white/45">kr/mån</span>
                  </p>
                  <p className={`${sectionSubtitleClass} mt-2`}>
                    {fmt(totalInterestYearly)} kr per år i ren ränta · {Math.round(interestPct)}% av betalningen
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${interestPct}%` }}
                      className="h-full bg-rose-400/80 rounded-full"
                    />
                  </div>
                </>
              ) : (
                <p className="text-[15px] text-emerald-300/90">
                  Inga räntekostnader — hela betalningen minskar skulden.
                </p>
              )}
            </GlassSection>
          </motion.div>

          <motion.div {...staggerItem(4)}>
            <DashboardSection nested title="Dina lån">
              {sortedLoans.map((loan, i) => {
                const monthlyInterest = (loan.totalAmount || 0) * ((loan.interestRate || 0) / 100 / 12);
                const isZeroInterest = (loan.interestRate || 0) === 0;
                const isHighestPrio =
                  highestInterestLoan && loan.name === highestInterestLoan.name && (loan.interestRate || 0) > 0;

                return (
                  <React.Fragment key={i}>
                    {i > 0 && <DashboardDivider className="my-2" />}
                    <div className={`${surface.cardInset} p-4 my-2`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-[15px] font-medium text-white flex items-center gap-2 flex-wrap">
                            {loan.name}
                            {isHighestPrio && (
                              <span className="text-[11px] text-rose-300/90 font-medium px-2 py-0.5 rounded-full bg-rose-500/10 ring-1 ring-rose-400/20">
                                Högst prio
                              </span>
                            )}
                            {isZeroInterest && (
                              <span className="text-[11px] text-emerald-300/90 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20">
                                Räntefritt
                              </span>
                            )}
                          </p>
                          <p className="anchor-type-body-sm mt-0.5">
                            {loan.interestRate || 0}% · {fmt(loan.totalAmount)} kr · {fmt(loan.monthlyPayment)} kr/mån
                          </p>
                        </div>
                      </div>

                      {!isZeroInterest && monthlyInterest > 0 && (
                        <p className="text-[13px] text-rose-300/85 mb-3 tabular-nums">
                          {fmt(monthlyInterest)} kr i ränta per månad
                        </p>
                      )}

                      <div className="flex gap-2">
                        <AnchorPressable
                          type="button"
                          minTouch={false}
                          onClick={() => runDebtEraser(loan, i)}
                          disabled={loadingEraser === i || !(loan.monthlyPayment > 0)}
                          className="flex-1 h-11 rounded-full bg-white/[0.08] text-white/90 text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
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
                            className="flex-1 h-11 rounded-full bg-white/[0.08] text-white/90 text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
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
                            <div className="pt-4 mt-3 border-t border-white/[0.08]">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[14px] font-medium text-white/80 flex items-center gap-1.5">
                                  <Zap className="w-4 h-4 text-[var(--color-accent)]" /> Analys
                                </span>
                                <AnchorPressable
                                  type="button"
                                  minTouch={false}
                                  onClick={() => setDebtEraserResult(null)}
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 text-white/40" />
                                </AnchorPressable>
                              </div>
                              {debtEraserResult.monthsNow > 0 && debtEraserResult.monthsNow !== Infinity && (
                                <div className="flex flex-wrap gap-4 mb-2 text-[13px] text-white/55">
                                  <span>Nu: {debtEraserResult.monthsNow} mån</span>
                                  <span>Med extra: {debtEraserResult.monthsWithExtra} mån</span>
                                  <span className="text-emerald-300">−{debtEraserResult.monthsFaster} mån</span>
                                </div>
                              )}
                              <p className="text-[14px] text-white/70 leading-relaxed">{debtEraserResult.message}</p>
                              {debtEraserResult.interestSaved > 0 && (
                                <p className="text-[14px] text-emerald-300 mt-2 tabular-nums">
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
                            <div className="pt-4 mt-3 border-t border-white/[0.08]">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[14px] font-medium text-white/80">Förhandlingsmanus</span>
                                <AnchorPressable
                                  type="button"
                                  minTouch={false}
                                  onClick={() => setNegotiationScript(null)}
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 text-white/40" />
                                </AnchorPressable>
                              </div>
                              <p className="text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap">
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
                  </React.Fragment>
                );
              })}
            </DashboardSection>
          </motion.div>

          <motion.div {...staggerItem(5)}>
            <GlassSection title="Tips">
              <ul className="space-y-3">
                {[
                  'Betala mer på lånet med högst ränta först',
                  'Amortera extra vid bonus eller skatteåterbäring',
                  'Jämför räntor — byt till billigare alternativ',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[14px] text-white/55 leading-relaxed">
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