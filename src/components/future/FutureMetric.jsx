import React from 'react';
import { useCountUp } from '@/hooks/useCountUp';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function formatValue(value, format) {
  const displayed = value;
  if (format === 'months') return `${fmt(displayed)} mån`;
  if (format === 'count') return `${fmt(displayed)}`;
  return `${fmt(displayed)} kr`;
}

const TONE_COLOR = {
  accent: 'var(--color-accent)',
  critical: 'var(--color-danger)',
};

/** En nyckelsiffra i ett Framtid-svar — räknar upp, understryker om den är huvudpoängen. */
export default function FutureMetric({ label, value, format = 'kr', accent = false, tone }) {
  const displayed = useCountUp(value ?? 0, 800);
  const resolvedTone = tone || (accent ? 'accent' : null);

  return (
    <div className="flex-1 min-w-[120px]">
      <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{label}</p>
      <p
        className="text-[22px] font-extrabold tabular-nums leading-tight"
        style={{ color: TONE_COLOR[resolvedTone] || 'var(--color-text-primary)' }}
      >
        {formatValue(displayed, format)}
      </p>
    </div>
  );
}
