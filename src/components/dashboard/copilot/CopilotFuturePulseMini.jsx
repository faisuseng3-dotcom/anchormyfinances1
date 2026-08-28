import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { planeraTabHref } from '@/lib/planeraTabs';
import { staggerItem } from '@/lib/motionPresets';

const STATUS_DOT = {
  grön: 'var(--color-success)',
  gul: 'var(--color-warning)',
  röd: 'var(--color-danger)',
};

const STATUS_SOFT = {
  grön: 'var(--color-success-soft)',
  gul: 'var(--color-warning-soft)',
  röd: 'var(--color-danger-soft)',
};

function fmtKr(n) {
  return `${Math.round(n || 0).toLocaleString('sv-SE')} kr`;
}

/**
 * Förenklad FuturePulse-tidslinje för dashboard — kompakt, framåtblickande.
 */
export default function CopilotFuturePulseMini({ forecast, className = '' }) {
  const events = forecast?.framtida_handelser || [];
  const timeline = forecast?.tidslinje || [];
  const statusKey = forecast?.status_key || 'grön';
  const saldo30 = forecast?.prognos_saldo_30 || '—';
  const coach = forecast?.coach_meddelande;

  const sparkPoints = timeline.slice(0, 14).map((pt, i) => {
    const x = timeline.length > 1 ? (i / (Math.min(timeline.length, 14) - 1)) * 100 : 50;
    const balances = timeline.slice(0, 14).map((p) => p.saldo);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;
    const y = 100 - ((pt.saldo - min) / range) * 70 - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.section
      {...staggerItem(1)}
      className={`organic-surface organic-surface--hero rounded-[24px] p-5 ${className}`}
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="anchor-card-title">Din framtid</h2>
          <p className="text-[18px] font-bold text-[var(--copilot-text-primary)] mt-1 tracking-tight">
            {saldo30} om 30 dagar
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0"
          style={{
            background: STATUS_SOFT[statusKey] || STATUS_SOFT.grön,
            color: STATUS_DOT[statusKey] || STATUS_DOT.grön,
            boxShadow: 'var(--organic-shadow-soft)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: STATUS_DOT[statusKey] || STATUS_DOT.grön }}
          />
          {forecast?.status_label || 'Stabil'}
        </span>
      </div>

      {sparkPoints && (
        <div className="mb-4 rounded-[20px] overflow-hidden bg-[var(--color-background-secondary)] p-3">
          <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="fp-mini-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
            </defs>
            {sparkPoints && (
              <>
                <polygon
                  points={`0,100 ${sparkPoints} 100,100`}
                  fill="url(#fp-mini-fill)"
                />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </div>
      )}

      {coach && (
        <p className="text-[13px] text-[var(--copilot-text-secondary)] leading-relaxed mb-4">
          {coach}
        </p>
      )}

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-[13px] text-[var(--copilot-text-muted)]">
            Inga större händelser de närmaste veckorna — lugnt läge.
          </p>
        ) : (
          events.slice(0, 3).map((ev, i) => (
            <div
              key={`${ev.händelse}-${i}`}
              className="flex items-center gap-3 p-3 rounded-[16px] bg-[var(--color-background-secondary)] active:scale-[0.98] transition-transform"
            >
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <CalendarDays className="w-4 h-4 text-[var(--copilot-accent-blue)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--copilot-text-primary)] truncate">{ev.händelse}</p>
                <p className="text-[11px] text-[var(--copilot-text-muted)] mt-0.5">
                  {ev.tidsfönster || 'Kommande'}
                  {ev.belopp ? ` · ${fmtKr(ev.belopp)}` : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        to={planeraTabHref('nu')}
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--copilot-accent-cyan)] no-underline active:scale-[0.98] transition-transform"
      >
        Öppna full tidslinje
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </motion.section>
  );
}
