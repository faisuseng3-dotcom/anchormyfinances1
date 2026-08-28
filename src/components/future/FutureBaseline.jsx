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
    <div className="rounded-[24px] p-6 sm:p-7 mb-6 text-center" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
      <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">Fortsätt som nu</p>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">Så här ser din ekonomi ut om inget förändras</p>

      <p className="text-[13px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">Tryggt att spendera</p>
      <p
        className="font-black tabular-nums leading-none tracking-tight text-[var(--color-text-primary)]"
        style={{ fontSize: 'clamp(2.25rem, 8vw, 3.25rem)' }}
      >
        {fmt(safeToSpend.amount)}
        <span className="text-[0.35em] font-semibold text-[var(--color-text-secondary)] ml-1">kr</span>
      </p>

      {goal && (
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-4">
          Beräknat måldatum för {goal.goalName}:{' '}
          <span className="font-semibold text-[var(--color-text-primary)]">{goal.targetDateLabel || '—'}</span>
        </p>
      )}

      <p className="text-[12.5px] text-[var(--color-text-muted)] mt-4 leading-relaxed max-w-[420px] mx-auto">
        Beräknat utifrån din senaste ekonomiska historik{goal?.isRateAssumed ? ' och ett uppskattat sparande' : ''} — inte en garanti, men en rimlig riktning om du fortsätter ungefär som idag.
      </p>
    </div>
  );
}
