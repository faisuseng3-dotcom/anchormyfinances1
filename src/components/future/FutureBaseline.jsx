// @ts-nocheck
import React from 'react';
import { getSafeToSpend, getSavingsGoalProjection } from '@/lib/financialEngine';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * "Fortsätt som nu" — baseline innan användaren ställt någon fråga. Samma
 * financialEngine-funktioner som Dashboard och Sparmål, så talen matchar
 * exakt oavsett var i appen man tittar.
 */
export default function FutureBaseline({ profile, transactions }) {
  const safeToSpend = getSafeToSpend(profile, transactions);
  const goal = getSavingsGoalProjection(profile);

  if (!safeToSpend.isReady) return null;

  return (
    <div className="rounded-[24px] p-5 sm:p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[12px] uppercase tracking-wide text-white/35 mb-1">Fortsätt som nu</p>
      <h2 className="text-[19px] font-bold text-white mb-3">Så här ser din ekonomi ut om inget förändras</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        <div className="flex-1 min-w-[140px]">
          <p className="text-[11px] uppercase tracking-wide text-white/35 mb-1">Tryggt att spendera</p>
          <p className="text-[22px] font-extrabold text-white tabular-nums">{fmt(safeToSpend.amount)} kr</p>
        </div>
        {goal && (
          <div className="flex-1 min-w-[140px]">
            <p className="text-[11px] uppercase tracking-wide text-white/35 mb-1">Beräknat måldatum, {goal.goalName}</p>
            <p className="text-[22px] font-extrabold text-white tabular-nums">{goal.targetDateLabel || '—'}</p>
          </div>
        )}
      </div>
      <p className="text-[12.5px] text-white/40 mt-4 leading-relaxed">
        Beräknat utifrån din senaste ekonomiska historik{goal?.isRateAssumed ? ' och ett uppskattat sparande' : ''} — inte en garanti, men en rimlig riktning om du fortsätter ungefär som idag.
      </p>
    </div>
  );
}
