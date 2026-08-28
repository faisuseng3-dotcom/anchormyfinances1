// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';
import {
  getGoalInsight,
  getMonthlyMargin,
  getBufferRunwayMonths,
  calcLiquidityForecast,
  whatIfExtraSavings,
} from '@/lib/financialEngine';
import { applySavingsTransfer } from '@/lib/planActions';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import ConfirmPlanChangeSheet from '@/components/plan/ConfirmPlanChangeSheet';

const MAX_SHOWN = 2;
const MIN_TRANSACTIONS_FOR_PATTERN = 10;
const MIN_SURPLUS_KR = 500;
const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/** Sparmålsinsikt i samma format som runInsightEngine — bara när målet
 * tydligt riskerar att missas eller kan nås märkbart tidigare. */
function buildGoalDiscovery(profile) {
  if (!profile?.savingsGoal || profile.savingsGoal <= 0) return null;

  const rate = profile.savingsGoalMonthlyTarget > 0
    ? profile.savingsGoalMonthlyTarget
    : Math.max(0, Math.round(getMonthlyMargin(profile) * 0.3));
  const goal = { current: profile.savingsCurrentBalance || 0, target: profile.savingsGoal, goalName: profile.savingsGoalName || 'sparmålet' };
  const insight = getGoalInsight(goal, rate, {
    deadlineDate: profile.savingsGoalDeadline || null,
    marginAvailable: getMonthlyMargin(profile),
  });
  if (!insight) return null;

  if (insight.status === 'at_risk') {
    return {
      id: 'goal_at_risk',
      severity: 3,
      title: `${insight.goalName} riskerar att missa måldatumet`,
      description: `Med nuvarande takt (${fmt(insight.monthlyRate)} kr/mån) når du målet ${insight.targetDateLabel || 'senare än planerat'} — det är efter ${new Date(profile.savingsGoalDeadline).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}.`,
      consequence: `Om du sparar ${fmt(insight.suggestedExtra)} kr mer/mån kommer du närmare måldatumet.`,
      action: 'Sparmål',
      actionLink: '/SavingsGoals',
    };
  }
  if (insight.status === 'reachable_earlier' && insight.monthsEarlier >= 1) {
    return {
      id: 'goal_reachable_earlier',
      severity: 2,
      title: `${insight.goalName} kan nås tidigare`,
      description: `Du behöver bara cirka ${fmt(insight.suggestedExtra)} kr extra/mån för att nå målet ${insight.monthsEarlier} månad${insight.monthsEarlier === 1 ? '' : 'er'} tidigare.`,
      consequence: `Nuvarande måldatum: ${insight.targetDateLabel}.`,
      action: 'Sparmål',
      actionLink: '/SavingsGoals',
    };
  }
  return null;
}

/** Ren funktion av financialEngine-output — inget AI-anrop, ingen gissning. */
function buildRecommendation(profile, transactions) {
  if (!profile?.income) return null;

  const margin = getMonthlyMargin(profile);
  const liquidity = calcLiquidityForecast(profile, transactions || []);
  if (!liquidity) return null;

  const estimatedMonthlyVariableSpend = Math.round((liquidity.avgDailySpend || 0) * 30);
  const committedSavings = profile.savingsGoalMonthlyTarget || 0;
  const surplus = Math.round(margin - committedSavings - estimatedMonthlyVariableSpend);
  if (surplus < MIN_SURPLUS_KR) return null;

  const bufferRunway = getBufferRunwayMonths(profile);
  const hasGoal = profile.savingsGoal > 0;
  const bufferHealthy = bufferRunway == null || bufferRunway >= 3;

  const toGoal = hasGoal ? (bufferHealthy ? surplus : Math.round(surplus / 2)) : 0;
  const toBuffer = surplus - toGoal;
  const whatIf = toGoal > 0 ? whatIfExtraSavings(profile, toGoal) : null;

  return { surplus, toGoal, toBuffer, whatIf, goalName: profile.savingsGoalName };
}

function InsightCard({ insight }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl p-4 organic-surface bg-white border border-[var(--color-border)]">
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 mt-0.5" aria-hidden>💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-snug">{insight.title}</p>
          <p className="text-[14px] text-[var(--color-text-secondary)] leading-snug mt-0.5">{insight.description}</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)] hover:opacity-80"
          >
            Visa vad det betyder
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </button>
          {open && (
            <div className="mt-2 space-y-2 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {insight.consequence && <p>{insight.consequence}</p>}
              {insight.actionLink && (
                <Link to={insight.actionLink} className="inline-block font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] underline underline-offset-2">
                  {insight.action ? `Gå till: ${insight.action}` : 'Visa detaljer'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, onOpenConfirm }) {
  return (
    <div className="rounded-2xl p-4 organic-surface bg-white border border-[var(--color-border)]">
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-accent)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed">
            Du har cirka {fmt(rec.surplus)} kr mer än förväntat kvar den här månaden.
            {rec.toGoal > 0 && rec.toBuffer > 0 && (
              <> Jag rekommenderar att du lägger {fmt(rec.toGoal)} kr på {rec.goalName || 'ditt sparmål'} och behåller {fmt(rec.toBuffer)} kr som buffert.</>
            )}
            {rec.toGoal > 0 && rec.toBuffer <= 0 && (
              <> Jag rekommenderar att du lägger hela beloppet, {fmt(rec.toGoal)} kr, på {rec.goalName || 'ditt sparmål'} — din buffert ser redan stabil ut.</>
            )}
            {rec.toGoal <= 0 && (
              <> Jag rekommenderar att du behåller det som buffert — det ger dig mer marginal om något oväntat händer.</>
            )}
          </p>
          {rec.whatIf?.monthsEarlier > 0 && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5">
              Det gör att du når {rec.goalName || 'sparmålet'} ungefär {rec.whatIf.monthsEarlier} månad{rec.whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.
            </p>
          )}
          {rec.toGoal > 0 && (
            <button
              type="button"
              onClick={onOpenConfirm}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Gör detta till min plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Ett enda "vad borde jag göra"-svar — inte tre konkurrerande kort. Slår ihop
 * riktiga upptäckter (utgiftsmönster, sparmålsrisk) och Lagos överskotts-
 * rekommendation till EN prioriterad lista, viktigast först.
 */
export default function LagoInsights({ profile, transactions }) {
  const { updateProfile } = useFinancialProfile();
  const { createTransaction } = useOptimisticTransactions();
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const insights = useMemo(() => {
    const spending = runInsightEngine(profile, transactions || []);
    const goalDiscovery = buildGoalDiscovery(profile);
    return goalDiscovery ? [...spending, goalDiscovery] : spending;
  }, [profile, transactions]);

  const rec = useMemo(
    () => (applied ? null : buildRecommendation(profile, transactions)),
    [profile, transactions, applied],
  );

  const items = useMemo(() => {
    const list = insights.map((i) => ({ kind: 'insight', severity: i.severity, key: i.id, data: i }));
    if (rec) list.push({ kind: 'recommendation', severity: 2, key: 'recommendation', data: rec });
    return list.sort((a, b) => b.severity - a.severity).slice(0, MAX_SHOWN);
  }, [insights, rec]);

  const hasEnoughData = (transactions?.length || 0) >= MIN_TRANSACTIONS_FOR_PATTERN;

  if (items.length === 0 && hasEnoughData) return null;

  const handleConfirm = async () => {
    await applySavingsTransfer(profile, rec.toGoal, {
      updateProfile,
      createTransaction,
      label: `Lago rekommenderar: +${fmt(rec.toGoal)} kr till ${rec.goalName || 'sparmålet'}`,
    });
    setApplied(true);
  };

  return (
    <section className="pt-2">
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Lago säger</h2>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key}>
              {item.kind === 'insight' ? (
                <InsightCard insight={item.data} />
              ) : (
                <RecommendationCard rec={item.data} onOpenConfirm={() => setConfirmOpen(true)} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
          Jag behöver ungefär en månads transaktioner innan jag kan identifiera ett tydligt mönster.
        </p>
      )}

      {rec && (
        <ConfirmPlanChangeSheet
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Din nya plan"
          change={{ label: 'Överföring till sparande nu', before: 0, after: rec.toGoal }}
          impactLine={rec.whatIf?.monthsEarlier > 0
            ? `Du når ${rec.goalName || 'sparmålet'} ungefär ${rec.whatIf.monthsEarlier} månad${rec.whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.`
            : `${fmt(rec.toGoal)} kr flyttas från buffert till ${rec.goalName || 'sparmålet'}.`}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
