// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import {
  getSavingsGoalProjection,
  whatIfExtraSavings,
  getRequiredMonthlyRate,
  getMonthlyMargin,
} from '@/lib/financialEngine';
import { createPageUrl } from '@/utils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * "Sparmål 2.0" — måldatum, "spara X mer → Y tidigare", och en baklängesräknare
 * för "jag vill nå det till ett visst datum". Byggd på financialEngine, inte
 * på gissningar. Visas bara för profilens primära namngivna sparmål.
 */
export default function GoalProjectionRow({ profile }) {
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [requiredResult, setRequiredResult] = useState(null);

  const projection = getSavingsGoalProjection(profile);
  if (!projection || projection.monthsToGoal == null) return null;

  const margin = getMonthlyMargin(profile);
  const suggestedExtra = margin > 0 ? Math.max(200, Math.round(margin * 0.15)) : 300;
  const whatIf = whatIfExtraSavings(profile, suggestedExtra);

  const handleCheckDeadline = () => {
    if (!deadline) return;
    const goal = { current: profile.savingsCurrentBalance || 0, target: profile.savingsGoal };
    setRequiredResult(getRequiredMonthlyRate(goal, deadline, projection.monthlyRate));
  };

  return (
    <div className="rounded-2xl p-4 mt-2 organic-surface">
      <div className="space-y-1.5">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Beräknad måldatum: <span className="text-[var(--color-text-primary)] font-semibold">{projection.targetDateLabel}</span>
          {projection.isRateAssumed && ' (uppskattat sparande)'}
        </p>

        {whatIf?.monthsEarlier > 0 && (
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Om du sparar {fmt(suggestedExtra)} kr mer/mån når du målet {whatIf.monthsEarlier} månad{whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          to={createPageUrl('FuturePulse')}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline"
        >
          Utforska i Framtid
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => setShowDeadlinePicker((v) => !v)}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)]"
        >
          Sätt ett måldatum
          <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showDeadlinePicker ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {showDeadlinePicker && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
          <div className="flex gap-2">
            <input
              type="month"
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); setRequiredResult(null); }}
              className="flex-1 h-10 rounded-xl px-3 text-[14px] text-[var(--color-text-primary)] bg-[var(--color-background-secondary)] border border-[var(--color-border)]"
            />
            <button
              type="button"
              onClick={handleCheckDeadline}
              disabled={!deadline}
              className="px-4 rounded-xl text-[13px] font-semibold text-white bg-[var(--color-accent)] disabled:opacity-40"
            >
              Räkna
            </button>
          </div>

          {requiredResult && (
            requiredResult.isRealistic ? (
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Du behöver spara cirka {fmt(requiredResult.requiredMonthly)} kr/mån för att nå målet till {requiredResult.deadlineLabel}.
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  Det kräver cirka {fmt(requiredResult.requiredMonthly)} kr/mån, vilket är mer än ditt nuvarande sparande på {fmt(projection.monthlyRate)} kr/mån. Här är tre alternativ.
                </p>
                <p className="text-[12px] text-[var(--color-text-muted)]">1. Spara mer — {fmt(requiredResult.alternatives.saveMore.monthlyRate)} kr/mån.</p>
                {requiredResult.alternatives.laterDate && (
                  <p className="text-[12px] text-[var(--color-text-muted)]">2. Flytta fram måldatumet till {requiredResult.alternatives.laterDate.dateLabel}.</p>
                )}
                <p className="text-[12px] text-[var(--color-text-muted)]">3. Sänk målbeloppet till cirka {fmt(requiredResult.alternatives.lowerTarget.achievableTarget)} kr.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
