import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ChevronRight } from 'lucide-react';
import { useFuturePulse } from '@/hooks/useFuturePulse';
import { createPageUrl } from '@/utils';
import { glassSurface } from '@/lib/anchorTheme';

const DETAIL_PATH = createPageUrl('FuturePulse');

const STATUS_THEME = {
  grön: { glow: 'rgba(15,222,189,0.22)', line: ['#0FDEBD', '#6B8FFF'], ambient: 'rgba(15,222,189,0.12)' },
  gul: { glow: 'rgba(246,173,85,0.25)', line: ['#F6AD55', '#E8B84A'], ambient: 'rgba(246,173,85,0.14)' },
  röd: { glow: 'rgba(255,100,120,0.25)', line: ['#FF6B8A', '#FF4466'], ambient: 'rgba(255,100,120,0.14)' },
};

const EVENT_STYLE = {
  kritisk: { dot: 'bg-rose-400', label: 'text-rose-200' },
  varning: { dot: 'bg-amber-400', label: 'text-amber-100' },
  möjlighet: { dot: 'bg-emerald-400', label: 'text-emerald-200' },
  trend: { dot: 'bg-blue-400', label: 'text-blue-200' },
};

function fmtSaldo(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

function StatCell({ label, value, sub }) {
  return (
    <div className="flex-1 text-center px-1">
      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-black text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

/** Förhandsvisning — ingen scroll (scroll fångar klick och blockerar navigation) */
function TimelinePreview({ tidslinje, statusKey }) {
  const theme = STATUS_THEME[statusKey] || STATUS_THEME.grön;
  if (!tidslinje?.length) return null;

  const balances = tidslinje.map((p) => p.saldo);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances, 1);
  const range = maxBal - minBal || 1;
  const TRACK_H = 48;
  const getY = (bal) => TRACK_H - Math.round(((bal - minBal) / range) * (TRACK_H - 8)) - 4;

  const samples = [0, 7, 14, 21, 30].filter((i) => i < tidslinje.length);
  const step = 56;
  const points = samples.map((i, idx) => ({
    x: 20 + idx * step,
    y: getY(tidslinje[i].saldo),
    point: tidslinje[i],
  }));
  const totalW = 20 + samples.length * step;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div className="mt-3 rounded-xl py-2 pointer-events-none select-none" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <svg width="100%" viewBox={`0 0 ${totalW} ${TRACK_H + 4}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="fpLinePreview" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.line[0]} />
            <stop offset="100%" stopColor={theme.line[1]} />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#fpLinePreview)" strokeWidth="2" strokeLinecap="round" />
        {points.map(({ x, y, point }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={point.status === 'röd' ? '#FF6B8A' : point.status === 'gul' ? '#F6AD55' : '#0FDEBD'}
          />
        ))}
      </svg>
      <p className="text-center text-[10px] text-white/35 mt-1">60 dagar · öppna för att bläddra</p>
    </div>
  );
}

function CompactEvent({ event }) {
  const style = EVENT_STYLE[event.typ] || EVENT_STYLE.varning;
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 border border-white/8 pointer-events-none">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-xs font-bold truncate ${style.label}`}>{event.händelse}</p>
          <span className="text-[10px] text-white/35 flex-shrink-0">{event.tidsfönster}</span>
        </div>
        {event.ai_losning && (
          <p className="text-[11px] text-white/50 mt-0.5 truncate">→ {event.ai_losning}</p>
        )}
      </div>
    </div>
  );
}

export default function FuturePulse({ profile, transactions, enabled = true }) {
  const { data: forecast, isLoading, isFetching } = useFuturePulse(profile, transactions, {
    compact: true,
    enabled,
  });

  const statusKey = forecast?.status_key || 'grön';
  const theme = STATUS_THEME[statusKey] || STATUS_THEME.grön;
  const events = forecast?.framtida_handelser || [];

  if (!profile) return null;

  return (
    <Link
      to={DETAIL_PATH}
      className="mx-4 sm:mx-5 block rounded-[28px] overflow-hidden no-underline cursor-pointer active:scale-[0.99] transition-transform relative z-20"
      style={{
        ...glassSurface(),
        boxShadow: `0 22px 48px rgba(2,8,26,0.42), 0 0 48px ${theme.glow}`,
      }}
      aria-label="Öppna Framtidspuls"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.ambient} 0%, transparent 70%)` }}
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{forecast?.status_emoji || '⚪'}</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Framtidspuls
                </p>
                <p className="text-sm font-bold text-white">{forecast?.status_label || '…'}</p>
              </div>
              {(isLoading || isFetching) && <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />}
            </div>
            <div className="flex items-center gap-1 text-white/70 flex-shrink-0">
              <span className="text-xs font-semibold">Öppna</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {isLoading ? (
            <div className="h-24 rounded-2xl skeleton" />
          ) : forecast?.tidslinje?.length === 0 ? (
            <>
              <p className="text-sm text-white/50 text-center py-4">
                Fyll i profil och transaktioner för att se prognosen.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-slate-900 bg-white">
                Öppna Framtidspuls
                <ChevronRight className="w-4 h-4" />
              </div>
            </>
          ) : (
            <>
              <div
                className="flex rounded-2xl py-3 mb-3 pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <StatCell label="Idag" value={fmtSaldo(forecast.idag_saldo)} />
                <div className="w-px bg-white/10 self-stretch my-1" />
                <StatCell
                  label="Lägsta"
                  value={fmtSaldo(forecast.min_saldo)}
                  sub={forecast.min_dag != null ? `dag ${forecast.min_dag}` : undefined}
                />
                <div className="w-px bg-white/10 self-stretch my-1" />
                <StatCell label="Om 30 d" value={forecast.prognos_saldo_30 || '—'} />
              </div>

              <p className="text-sm font-medium text-white/80 text-center px-1 mb-1 pointer-events-none">
                {forecast?.coach_meddelande}
              </p>

              <TimelinePreview tidslinje={forecast.tidslinje} statusKey={statusKey} />

              {events.length > 0 && (
                <div className="mt-3 space-y-1.5 pointer-events-none">
                  {events.map((ev, i) => (
                    <CompactEvent key={`${ev.tidsfönster}-${i}`} event={ev} />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm text-slate-900 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                Visa full prognos
                <ChevronRight className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
