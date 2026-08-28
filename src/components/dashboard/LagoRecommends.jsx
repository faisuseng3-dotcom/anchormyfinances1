// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getMonthlyMargin, getBufferRunwayMonths, calcLiquidityForecast, whatIfExtraSavings } from '@/lib/financialEngine';
import { applySavingsTransfer } from '@/lib/planActions';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import ConfirmPlanChangeSheet from '@/components/plan/ConfirmPlanChangeSheet';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');
const MIN_SURPLUS_KR = 500;

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

export default function LagoRecommends({ profile, transactions }) {
  const { updateProfile } = useFinancialProfile();
  const { createTransaction } = useOptimisticTransactions();
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rec = useMemo(() => buildRecommendation(profile, transactions), [profile, transactions]);

  if (!rec || applied) return null;

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
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Lago rekommenderar</h2>
      <div className="rounded-2xl p-4 organic-surface bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-accent)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] text-white/80 leading-relaxed">
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
              <p className="text-[13px] text-white/45 mt-1.5">
                Det gör att du når {rec.goalName || 'sparmålet'} ungefär {rec.whatIf.monthsEarlier} månad{rec.whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.
              </p>
            )}
            {rec.toGoal > 0 && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-[#08110c] bg-[#4fae82] hover:opacity-90 transition-opacity"
              >
                Gör detta till min plan
              </button>
            )}
          </div>
        </div>
      </div>

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
    </section>
  );
}
