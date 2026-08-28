// @ts-nocheck
import React from 'react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * "Fortsätt som nu" vs "Med din förändring" — samma tal som resten av appen
 * (byggt av financialEngine.whatIfExtraSavings av anroparen), inte en egen
 * uträkning här.
 */
export default function FutureScenarioComparison({ whatIf }) {
  if (!whatIf?.before || !whatIf?.after) return null;
  const { before, after, monthsEarlier } = whatIf;

  return (
    <div className="rounded-2xl p-4 mb-5 grid grid-cols-2 gap-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-white/35 mb-1">Fortsätt som nu</p>
        <p className="text-[13px] text-white/70">Sparande: {fmt(before.monthlyRate)} kr/mån</p>
        <p className="text-[13px] text-white/70">Måldatum: {before.targetDateLabel || '—'}</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-accent)] mb-1">Med din förändring</p>
        <p className="text-[13px] text-white">Sparande: {fmt(after.monthlyRate)} kr/mån</p>
        <p className="text-[13px] text-white">Måldatum: {after.targetDateLabel || '—'}</p>
      </div>
      {monthsEarlier > 0 && (
        <div className="col-span-2 pt-3 border-t border-white/10">
          <p className="text-[13px] font-semibold text-[var(--color-accent)]">
            Resultat: {monthsEarlier} månad{monthsEarlier === 1 ? '' : 'er'} tidigare
          </p>
        </div>
      )}
    </div>
  );
}
