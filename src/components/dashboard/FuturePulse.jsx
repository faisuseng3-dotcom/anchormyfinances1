import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  computeLocalFuturePulse,
  summarizeForFutureEngine,
  mergeFuturePulse,
  extractPatterns,
} from '@/lib/futurePulseEngine';
import { glassSurface } from '@/lib/anchorTheme';

const STATUS_THEME = {
  grön: {
    glow: 'rgba(15,222,189,0.25)',
    line: ['#0FDEBD', '#6B8FFF'],
    badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25',
    ambient: 'rgba(15,222,189,0.12)',
  },
  gul: {
    glow: 'rgba(246,173,85,0.28)',
    line: ['#F6AD55', '#E8B84A'],
    badge: 'bg-amber-500/15 text-amber-100 border-amber-400/25',
    ambient: 'rgba(246,173,85,0.14)',
  },
  röd: {
    glow: 'rgba(255,100,120,0.28)',
    line: ['#FF6B8A', '#FF4466'],
    badge: 'bg-rose-500/15 text-rose-100 border-rose-400/25',
    ambient: 'rgba(255,100,120,0.14)',
  },
};

function fmtSaldo(n) {
  return `${Math.round(n || 0).toLocaleString('sv-SE')} kr`;
}

function TimelineTrack({ tidslinje, statusKey, onDayFocus }) {
  const scrollRef = useRef(null);
  const [focusedDay, setFocusedDay] = useState(0);
  const theme = STATUS_THEME[statusKey] || STATUS_THEME.grön;

  if (!tidslinje?.length) return null;

  const balances = tidslinje.map((p) => p.saldo);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances, 1);
  const range = maxBal - minBal || 1;
  const TRACK_H = 72;
  const getY = (bal) => TRACK_H - Math.round(((bal - minBal) / range) * (TRACK_H - 12)) - 6;

  const step = 44;
  const points = tidslinje.map((p, i) => ({
    x: 32 + i * step,
    y: getY(p.saldo),
    point: p,
  }));

  const totalW = 32 + tidslinje.length * step + 32;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const idx = Math.max(0, Math.min(tidslinje.length - 1, Math.round((center - 32) / step)));
    if (idx !== focusedDay) {
      setFocusedDay(idx);
      onDayFocus?.(tidslinje[idx]);
    }
  }, [focusedDay, onDayFocus, tidslinje, step]);

  const focused = tidslinje[focusedDay];
  const focusTheme = STATUS_THEME[focused?.status] || theme;

  return (
    <div className="mt-4">
      <div
        className="rounded-2xl px-4 py-3 mb-3 transition-colors duration-500"
        style={{ background: focusTheme.ambient, border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
          {focusedDay === 0 ? 'Idag' : `+${focusedDay} dagar`}
        </p>
        <p className="text-xl font-black text-white">{fmtSaldo(focused?.saldo)}</p>
        {focused?.händelse && (
          <p className="text-xs text-white/55 mt-1">{focused.ikon} {focused.händelse}</p>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ width: totalW, minWidth: '100%' }}>
          <svg width={totalW} height={TRACK_H + 28} style={{ display: 'block' }}>
            <defs>
              <linearGradient id="fpLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.line[0]} />
                <stop offset="100%" stopColor={theme.line[1]} />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((pct) => (
              <line
                key={pct}
                x1={16}
                y1={Math.round(TRACK_H * (1 - pct))}
                x2={totalW - 16}
                y2={Math.round(TRACK_H * (1 - pct))}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {minBal < 0 && (
              <line
                x1={16}
                y1={getY(0)}
                x2={totalW - 16}
                y2={getY(0)}
                stroke="rgba(255,100,120,0.35)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )}

            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#fpLine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />

            {points.map(({ x, y, point }, i) => {
              const isFocus = i === focusedDay;
              const nodeColor =
                point.status === 'röd' ? '#FF6B8A' : point.status === 'gul' ? '#F6AD55' : '#0FDEBD';
              const hasEvent = !!point.händelse;

              return (
                <g key={i}>
                  {hasEvent && (
                    <line
                      x1={x}
                      y1={y + 5}
                      x2={x}
                      y2={TRACK_H + 2}
                      stroke={nodeColor}
                      strokeWidth="1"
                      opacity="0.25"
                      strokeDasharray="2 3"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isFocus ? 6 : hasEvent ? 5 : 3}
                    fill={nodeColor}
                    opacity={isFocus ? 1 : 0.65}
                    style={{ filter: isFocus ? `drop-shadow(0 0 6px ${nodeColor})` : undefined }}
                  />
                </g>
              );
            })}
          </svg>
          <p className="text-[9px] text-center text-white/30 -mt-1">Scrolla framåt i tiden →</p>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, index }) {
  const typeStyle =
    event.typ === 'kritisk'
      ? 'border-rose-400/20 bg-rose-500/8'
      : event.typ === 'möjlighet'
        ? 'border-emerald-400/20 bg-emerald-500/8'
        : 'border-white/10 bg-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
      className={`rounded-2xl p-4 border ${typeStyle}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">
        {event.tidsfönster}
      </p>
      <p className="text-sm font-semibold text-white leading-snug">{event.händelse}</p>
      {event.ai_losning && (
        <p className="text-xs text-white/55 mt-2 leading-relaxed flex items-start gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#0FDEBD]" />
          {event.ai_losning}
        </p>
      )}
    </motion.div>
  );
}

export default function FuturePulse({ profile, transactions, enabled = true }) {
  const personalTxs = useMemo(
    () => (transactions || []).filter((t) => t.context !== 'BUSINESS'),
    [transactions]
  );

  const { data: forecast, isLoading, isFetching } = useQuery({
    queryKey: ['futurePulse', profile?.id, personalTxs.length],
    queryFn: async () => {
      const local = computeLocalFuturePulse(profile, personalTxs);
      const payload = summarizeForFutureEngine(profile, personalTxs);
      const patterns = extractPatterns(profile, personalTxs);

      try {
        const res = await base44.functions.invoke('futureEngine', {
          ...payload,
          localBaseline: local,
          patterns,
          context: 'PERSONAL',
        });
        return mergeFuturePulse(local, res.data);
      } catch {
        return local;
      }
    },
    enabled: enabled && !!profile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const statusKey = forecast?.status_key || 'grön';
  const theme = STATUS_THEME[statusKey] || STATUS_THEME.grön;

  if (!profile) return null;

  return (
    <motion.section
      className="mx-4 sm:mx-5 rounded-[28px] overflow-hidden"
      style={{
        ...glassSurface(),
        boxShadow: `0 22px 48px rgba(2,8,26,0.42), 0 0 60px ${theme.glow}`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.ambient} 0%, transparent 70%)` }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#0FDEBD]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Framtidspuls
              </p>
              {(isLoading || isFetching) && (
                <Loader2 className="w-3 h-3 animate-spin text-white/40" />
              )}
            </div>
            <span className={`inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full border ${theme.badge}`}>
              {forecast?.framtids_status || 'Analyserar…'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Om 30 dagar</p>
            <p className="text-sm font-bold text-white/90 max-w-[140px] leading-tight">
              {isLoading ? '…' : forecast?.prognos_30_dagar?.replace(' kr', '') || '—'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-2">
            <div className="h-4 w-4/5 rounded-lg skeleton" />
            <div className="h-20 rounded-2xl skeleton" />
          </div>
        ) : (
          <>
            <p className="text-sm text-white/75 leading-relaxed mb-1">
              {forecast?.coach_meddelande}
            </p>

            <TimelineTrack
              tidslinje={forecast?.tidslinje}
              statusKey={statusKey}
            />

            {forecast?.framtida_handelser?.length > 0 && (
              <div className="mt-4 space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Det här väntar runt hörnet
                </p>
                {forecast.framtida_handelser.map((ev, i) => (
                  <EventCard key={`${ev.tidsfönster}-${i}`} event={ev} index={i} />
                ))}
              </div>
            )}

            {forecast?.tidslinje?.length === 0 && (
              <p className="text-sm text-white/45 text-center py-6">
                Ladda upp transaktioner eller fyll i din profil — då kan jag visa vägen framåt.
              </p>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
