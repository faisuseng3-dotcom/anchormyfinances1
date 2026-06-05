import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ChevronRight } from 'lucide-react';
import { useFuturePulse } from '@/hooks/useFuturePulse';
import { createPageUrl } from '@/utils';
import { DashboardDivider, DashboardSection, DashboardStatStrip } from './DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { getUpcomingPreview, EVENT_COLORS } from '@/lib/planCalendarEngine';
import { mergePlannedEvents } from '@/lib/plannedEventsStorage';

const DETAIL_PATH = createPageUrl('FuturePulse');

const STATUS_LINE = {
  grön: ['#34D9BE', '#6B9FFF'],
  gul: ['#F6AD55', '#E8C468'],
  röd: ['#FF7A92', '#FF5570'],
};

function fmtSaldo(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

function TimelinePreview({ tidslinje, statusKey }) {
  const line = STATUS_LINE[statusKey] || STATUS_LINE.grön;
  if (!tidslinje?.length) return null;

  const balances = tidslinje.map((p) => p.saldo);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances, 1);
  const range = maxBal - minBal || 1;
  const H = 44;
  const getY = (bal) => H - Math.round(((bal - minBal) / range) * (H - 6)) - 3;

  const samples = [0, 7, 14, 21, 30].filter((i) => i < tidslinje.length);
  const step = 56;
  const points = samples.map((i, idx) => ({
    x: 16 + idx * step,
    y: getY(tidslinje[i].saldo),
    point: tidslinje[i],
  }));
  const totalW = 16 + samples.length * step;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div className="py-3 pointer-events-none select-none">
      <svg width="100%" viewBox={`0 0 ${totalW} ${H + 2}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fpPulseLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={line[0]} />
            <stop offset="100%" stopColor={line[1]} />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#fpPulseLine)" strokeWidth="2.5" strokeLinecap="round" />
        {points.map(({ x, y, point }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill={point.status === 'röd' ? '#FF7A92' : point.status === 'gul' ? '#F6AD55' : '#34D9BE'}
          />
        ))}
      </svg>
    </div>
  );
}

function EventLine({ event }) {
  return (
    <div className="flex items-center gap-2.5 py-2 pointer-events-none">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background:
            event.typ === 'kritisk' ? '#FF7A92' : event.typ === 'varning' ? '#F6AD55' : '#34D9BE',
        }}
      />
      <p className="text-[14px] text-white/85 truncate flex-1">{event.händelse}</p>
      <span className="text-[12px] text-white/35 flex-shrink-0">{event.tidsfönster}</span>
    </div>
  );
}

export default function FuturePulse({ profile, transactions, enabled = true }) {
  const { data: forecast, isLoading, isFetching } = useFuturePulse(profile, transactions, {
    compact: true,
    enabled,
  });

  const statusKey = forecast?.status_key || 'grön';
  const events = forecast?.framtida_handelser || [];

  if (!profile) return null;

  return (
    <DashboardSection
      title="Din Framtid"
      subtitle={isLoading ? 'Räknar…' : forecast?.status_label || '60-dagarsprognos'}
      actionHref={DETAIL_PATH}
      actionLabel="Öppna"
    >
      <Link
        to={DETAIL_PATH}
        className="block no-underline -mx-1 px-1 rounded-xl active:opacity-80 transition-opacity"
        aria-label="Öppna Framtidspuls"
      >
        {isLoading ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : forecast?.tidslinje?.length === 0 ? (
          <p className={sectionSubtitleClass}>
            Fyll i profil och transaktioner för prognosen.
          </p>
        ) : (
          <>
            <DashboardStatStrip
              items={[
                { label: 'Idag', value: fmtSaldo(forecast.idag_saldo) },
                {
                  label: 'Lägsta',
                  value: fmtSaldo(forecast.min_saldo),
                  sub: forecast.min_dag != null ? `dag ${forecast.min_dag}` : undefined,
                },
                { label: '30 dagar', value: forecast.prognos_saldo_30 || '—' },
              ]}
            />

            {forecast?.coach_meddelande && (
              <p className={`${sectionSubtitleClass} text-center py-2 pointer-events-none`}>
                {forecast.coach_meddelande}
              </p>
            )}

            <TimelinePreview tidslinje={forecast.tidslinje} statusKey={statusKey} />

            {profile && (() => {
              const upcoming = getUpcomingPreview({ ...profile, plannedEvents: mergePlannedEvents(profile) }, 4);
              if (!upcoming.length) return null;
              return (
                <>
                  <DashboardDivider className="my-2" />
                  <div className="pointer-events-none space-y-2 py-1">
                    {upcoming.map((ev, i) => (
                      <div key={`${ev.id}-${i}`} className="flex items-center gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: ev.color || EVENT_COLORS.planned }}
                        />
                        <span className="text-[12px] text-white/40 w-14 flex-shrink-0 tabular-nums">{ev.dayLabel}</span>
                        <span className="text-[14px] text-white/80 truncate flex-1">{ev.title}</span>
                        {ev.amount !== 0 && (
                          <span className="text-[13px] text-white/50 tabular-nums flex-shrink-0">
                            {ev.amount > 0 ? '+' : '−'}{Math.abs(ev.amount).toLocaleString('sv-SE')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {events.length > 0 && (
              <>
                <DashboardDivider className="my-1" />
                <div className="pointer-events-none">
                  {events.map((ev, i) => (
                    <EventLine key={`${ev.tidsfönster}-${i}`} event={ev} />
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-center gap-1 pt-4 text-[14px] font-medium text-white/60">
              Öppna kalender
              <ChevronRight className="w-4 h-4" />
              {(isLoading || isFetching) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
              )}
            </div>
          </>
        )}
      </Link>
    </DashboardSection>
  );
}
