import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, TrendingDown, Wallet, ChevronRight, Info } from 'lucide-react';
import { useFuturePulse } from '@/hooks/useFuturePulse';
import { GlassSection } from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';

const STATUS_BG = {
  grön: 'border-emerald-400/25 bg-emerald-500/10',
  gul: 'border-amber-400/25 bg-amber-500/10',
  röd: 'border-rose-400/25 bg-rose-500/10',
};

function fmt(n) {
  if (n == null) return '—';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

function DetailTimeline({ tidslinje, selectedDay, onSelectDay }) {
  if (!tidslinje?.length) return null;

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {tidslinje.filter((_, i) => i % 3 === 0 || tidslinje[i].händelse).slice(0, 25).map((d) => (
        <button
          key={d.dag}
          type="button"
          onClick={() => onSelectDay(d.dag)}
          className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-colors ${
            selectedDay === d.dag ? 'bg-white/15 border border-white/20' : 'bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-white/40 w-8 flex-shrink-0">+{d.dag}d</span>
            {d.ikon && <span>{d.ikon}</span>}
            <span className="text-sm text-white/80 truncate">{d.händelse || 'Vardagsköp'}</span>
          </div>
          <span
            className={`text-sm font-bold flex-shrink-0 ml-2 ${
              d.saldo < 0 ? 'text-rose-300' : d.status === 'gul' ? 'text-amber-200' : 'text-white'
            }`}
          >
            {fmt(d.saldo)}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function FuturePulseDetail({ profile, transactions }) {
  const { data: forecast, isLoading } = useFuturePulse(profile, transactions, { compact: false });
  const [selectedDay, setSelectedDay] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-2xl skeleton" />
        <div className="h-48 rounded-2xl skeleton" />
      </div>
    );
  }

  if (!forecast?.tidslinje?.length) {
    return (
      <div className="anchor-glass-card p-8 text-center">
        <p className="text-white font-semibold mb-2">Ingen prognos än</p>
        <p className="text-sm text-white/50 mb-6">Fyll i buffert, inkomst och transaktioner.</p>
        <Link to="/Import" className="anchor-btn-primary inline-flex px-6 py-3 text-sm font-bold">
          Importera data
        </Link>
      </div>
    );
  }

  const statusKey = forecast.status_key || 'grön';
  const selected = forecast.tidslinje[selectedDay] || forecast.tidslinje[0];
  const events = forecast.framtida_handelser || [];

  return (
    <div className="space-y-4">
      {/* Status + utökad coach */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[26px] p-5 border ${STATUS_BG[statusKey] || STATUS_BG.grön}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{forecast.status_emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/45">Din prognos</p>
            <p className="text-xl font-bold text-white">{forecast.status_label}</p>
          </div>
        </div>
        <p className="text-sm text-white/75 leading-relaxed">{forecast.coach_detaljer}</p>
      </motion.div>

      {/* Siffror */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Buffert idag', value: fmt(forecast.buffert), icon: Wallet },
          { label: 'Snitt/dag ut', value: fmt(forecast.daglig_spend), icon: TrendingDown },
          { label: 'Lägsta punkt', value: fmt(forecast.min_saldo), icon: Calendar },
          { label: 'Om 30 dagar', value: forecast.prognos_saldo_30, icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="anchor-glass-card-sm p-3 rounded-2xl">
            <Icon className="w-4 h-4 text-white/40 mb-1" />
            <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Tidslinje + daglista */}
      <GlassSection title="60-dagars tidslinje" subtitle="Tryck på en dag för detaljer">
        <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
            Dag {selectedDay} · {selected.datum}
          </p>
          <p className="text-2xl font-black text-white">{fmt(selected.saldo)}</p>
          {selected.händelse && (
            <p className="text-sm text-white/55 mt-1">{selected.ikon} {selected.händelse}</p>
          )}
        </div>
        <DetailTimeline
          tidslinje={forecast.tidslinje}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </GlassSection>

      {/* Steg / händelser */}
      {events.length > 0 && (
        <GlassSection title="Det här väntar" subtitle="Sorterat efter vikt">
          <div className="space-y-3">
            {events.map((ev, i) => (
              <div
                key={`${ev.id || ev.tidsfönster}-${i}`}
                className="p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                  {ev.tidsfönster}
                </p>
                <p className="text-base font-semibold text-white">{ev.händelse}</p>
                {ev.ai_losning && (
                  <p className="text-sm text-emerald-200/90 mt-2 flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {ev.ai_losning}
                  </p>
                )}
              </div>
            ))}
          </div>
        </GlassSection>
      )}

      {/* Kommande utgifter */}
      {forecast.kommande_utgifter?.length > 0 && (
        <GlassSection title="Kommande på kalendern" subtitle="Fasta drag + lön">
          <div className="divide-y divide-white/8">
            {forecast.kommande_utgifter.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{u.ikon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.namn}</p>
                    <p className="text-xs text-white/40">
                      {u.datum} · dag {u.dag}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-bold ${u.belopp > 0 ? 'text-emerald-300' : 'text-white'}`}>
                    {u.belopp > 0 ? '+' : ''}
                    {u.belopp.toLocaleString('sv-SE')} kr
                  </p>
                  <p className="text-[10px] text-white/35">→ {fmt(u.saldo_efter)}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassSection>
      )}

      {/* Förklaring */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/8">
        <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/45 leading-relaxed">
          Prognosen simulerar dina fasta kostnader, abonnemang och snittutgifter senaste 14 dagarna.
          Det är en vägledning — inte exakt bokföring.
        </p>
      </div>

      <Link
        to={`${createPageUrl('TransactionHistory')}?tab=insights`}
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white/80 border border-white/14 hover:bg-white/8 transition-colors"
      >
        Se kategorier & insikter
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
