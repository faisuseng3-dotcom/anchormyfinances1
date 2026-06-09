import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useFuturePulse } from '@/hooks/useFuturePulse';
import {
  DashboardDivider,
  DashboardListRow,
  DashboardSection,
  DashboardStatStrip,
} from '@/components/dashboard/DashboardChrome';
import { createPageUrl } from '@/utils';
import { anchorGhostButtonClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { StatusDot } from '@/lib/anchorIcons';

const STATUS_ACCENT = {
  grön: '#34D9BE',
  gul: '#F6AD55',
  röd: '#FF7A92',
};

function fmt(n) {
  if (n == null) return '—';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

function DetailTimeline({ tidslinje, selectedDay, onSelectDay }) {
  if (!tidslinje?.length) return null;

  const rows = tidslinje.filter((_, i) => i % 3 === 0 || tidslinje[i].händelse).slice(0, 25);

  return (
    <div className="max-h-72 overflow-y-auto">
      {rows.map((d, i) => (
        <React.Fragment key={d.dag}>
          {i > 0 && <DashboardDivider />}
          <button
            type="button"
            onClick={() => onSelectDay(d.dag)}
            className={`flex items-center justify-between w-full py-3.5 text-left transition-opacity ${
              selectedDay === d.dag ? 'opacity-100' : 'opacity-75 hover:opacity-90'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[13px] text-white/40 w-9 flex-shrink-0 tabular-nums">+{d.dag}d</span>
              {d.ikon && <span className="text-base">{d.ikon}</span>}
              <span className="text-[15px] text-white truncate">{d.händelse || 'Vardagsköp'}</span>
            </div>
            <span
              className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ml-2 ${
                d.saldo < 0 ? 'text-rose-300' : d.status === 'gul' ? 'text-amber-200' : 'text-white'
              }`}
            >
              {fmt(d.saldo)}
            </span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function FuturePulseDetail({ profile, transactions }) {
  const { data: forecast, isLoading } = useFuturePulse(profile, transactions, { compact: false });
  const [selectedDay, setSelectedDay] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 skeleton rounded-xl" />
        <div className="h-40 skeleton rounded-xl" />
      </div>
    );
  }

  if (!forecast?.tidslinje?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-[17px] font-semibold text-white mb-2">Ingen prognos än</p>
        <p className={sectionSubtitleClass}>Fyll i buffert, inkomst och transaktioner.</p>
        <Link to="/Import" className="anchor-btn-primary inline-flex mt-6 px-6">
          Importera data
        </Link>
      </div>
    );
  }

  const statusKey = forecast.status_key || 'grön';
  const accent = STATUS_ACCENT[statusKey] || STATUS_ACCENT.grön;
  const selected = forecast.tidslinje[selectedDay] || forecast.tidslinje[0];
  const events = forecast.framtida_handelser || [];

  return (
    <div className="space-y-10 -mt-2">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <StatusDot status={statusKey} size={12} className="mt-1" />
          <div>
            <p className="text-[17px] font-semibold text-white">{forecast.status_label}</p>
            <p className="text-[13px] text-white/45">60-dagars prognos</p>
          </div>
        </div>
        <p
          className="text-[15px] leading-relaxed pl-1 border-l-2"
          style={{ borderColor: accent, color: 'rgba(255,255,255,0.78)' }}
        >
          {forecast.coach_detaljer}
        </p>
      </motion.div>

      <DashboardStatStrip
        items={[
          { label: 'Buffert', value: fmt(forecast.buffert) },
          { label: 'Per dag', value: fmt(forecast.daglig_spend) },
          { label: 'Lägsta', value: fmt(forecast.min_saldo) },
          { label: '30 dagar', value: forecast.prognos_saldo_30 || '—' },
        ]}
      />

      <DashboardSection title="Vald dag" subtitle={`Dag ${selectedDay} · ${selected.datum}`}>
        <p className="text-[32px] font-semibold text-white tabular-nums leading-none">{fmt(selected.saldo)}</p>
        {selected.händelse && (
          <p className="text-[14px] text-white/55 mt-2">
            {selected.ikon} {selected.händelse}
          </p>
        )}
        <div className="mt-4">
          <DetailTimeline
            tidslinje={forecast.tidslinje}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>
      </DashboardSection>

      {events.length > 0 && (
        <DashboardSection title="Det här väntar">
          {events.map((ev, i) => (
            <React.Fragment key={`${ev.id || ev.tidsfönster}-${i}`}>
              {i > 0 && <DashboardDivider />}
              <div className="py-3">
                <p className="text-[13px] text-white/45 mb-1">{ev.tidsfönster}</p>
                <p className="text-[15px] font-medium text-white">{ev.händelse}</p>
                {ev.ai_losning && (
                  <p className="text-[14px] text-emerald-200/85 mt-2 flex items-start gap-1.5">
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {ev.ai_losning}
                  </p>
                )}
              </div>
            </React.Fragment>
          ))}
        </DashboardSection>
      )}

      {forecast.kommande_utgifter?.length > 0 && (
        <DashboardSection title="Kommande">
          {forecast.kommande_utgifter.map((u, i) => (
            <React.Fragment key={i}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                leading={<span className="text-lg">{u.ikon}</span>}
                title={u.namn}
                subtitle={`${u.datum} · dag ${u.dag}`}
                trailing={
                  <div className="text-right">
                    <p className={u.belopp > 0 ? 'text-emerald-300' : 'text-white'}>
                      {u.belopp > 0 ? '+' : ''}
                      {u.belopp.toLocaleString('sv-SE')} kr
                    </p>
                    <p className="text-[12px] text-white/35 font-normal">→ {fmt(u.saldo_efter)}</p>
                  </div>
                }
                trailingClassName="text-[15px] font-semibold tabular-nums"
              />
            </React.Fragment>
          ))}
        </DashboardSection>
      )}

      <Link
        to={`${createPageUrl('TransactionHistory')}?tab=insights`}
        className={`${anchorGhostButtonClass} w-full justify-center py-3`}
      >
        Se kategorier & insikter
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
