// @ts-nocheck
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  getSavingsGoalProjection,
  whatIfExtraSavings,
  getRequiredMonthlyRate,
  getMonthlyMargin,
} from '@/lib/financialEngine';

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
    <div className="rounded-2xl p-4 mt-2 organic-surface bg-white/[0.03] border border-white/[0.06] space-y-2">
      <p className="text-[13px] text-white/55">
        Beräknad måldatum: <span className="text-white font-semibold">{projection.targetDateLabel}</span>
        {projection.isRateAssumed && ' (uppskattat sparande)'}
      </p>

      {whatIf?.monthsEarlier > 0 && (
        <p className="text-[13px] text-white/55">
          Om du sparar {fmt(suggestedExtra)} kr mer/mån når du målet {whatIf.monthsEarlier} månad{whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowDeadlinePicker((v) => !v)}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)]"
      >
        Vill du nå målet till ett visst datum?
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showDeadlinePicker ? 'rotate(180deg)' : 'none' }} />
      </button>

      {showDeadlinePicker && (
        <div className="pt-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="month"
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); setRequiredResult(null); }}
              className="flex-1 h-10 rounded-xl px-3 text-[14px] text-white bg-white/[0.06] border border-white/10"
            />
            <button
              type="button"
              onClick={handleCheckDeadline}
              disabled={!deadline}
              className="px-4 rounded-xl text-[13px] font-semibold text-[#08110c] bg-[#4fae82] disabled:opacity-40"
            >
              Räkna
            </button>
          </div>

          {requiredResult && (
            requiredResult.isRealistic ? (
              <p className="text-[13px] text-white/70">
                Du behöver spara cirka {fmt(requiredResult.requiredMonthly)} kr/mån för att nå målet till {requiredResult.deadlineLabel}.
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[13px] text-white/70">
                  Det kräver cirka {fmt(requiredResult.requiredMonthly)} kr/mån, vilket är mer än ditt nuvarande sparande på {fmt(projection.monthlyRate)} kr/mån. Här är tre alternativ.
                </p>
                <p className="text-[12px] text-white/50">1. Spara mer — {fmt(requiredResult.alternatives.saveMore.monthlyRate)} kr/mån.</p>
                {requiredResult.alternatives.laterDate && (
                  <p className="text-[12px] text-white/50">2. Flytta fram måldatumet till {requiredResult.alternatives.laterDate.dateLabel}.</p>
                )}
                <p className="text-[12px] text-white/50">3. Sänk målbeloppet till cirka {fmt(requiredResult.alternatives.lowerTarget.achievableTarget)} kr.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
