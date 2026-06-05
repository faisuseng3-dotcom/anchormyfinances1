import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Share2, CalendarDays } from 'lucide-react';
import {
  SCENARIO_MODES,
  computeScenarioForecast,
  normalizeScenarioMode,
  scenarioShareLine,
} from '@/lib/dinFramtidScenarios';
import { calculatePengometer } from '@/lib/anchorBrain';
import { getSafeToSpend, buildUpcomingExpenses, getUpcomingDates, calculateRunningBalance, getNextDangerEvent } from '@/components/pulse/pulseEngine';
import { DashboardSection, DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import { createPageUrl } from '@/utils';
import { anchorGhostButtonClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { cn } from '@/lib/utils';

const STATUS_ACCENT = { grön: '#34D9BE', gul: '#F6AD55', röd: '#FF7A92' };

function fmt(n) {
  if (n == null) return '—';
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

function Timeline({ tidslinje }) {
  if (!tidslinje?.length) return null;
  const rows = tidslinje.filter((_, i) => i % 4 === 0 || tidslinje[i].händelse).slice(0, 16);
  return (
    <div className="max-h-64 overflow-y-auto space-y-1">
      {rows.map((d) => (
        <div key={d.dag} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12px] text-white/35 w-8 tabular-nums">+{d.dag}d</span>
            <span className="text-[14px] text-white/75 truncate">{d.händelse || 'Vardagsköp'}</span>
          </div>
          <span className={`text-[14px] font-semibold tabular-nums ${d.saldo < 0 ? 'text-rose-300' : 'text-white'}`}>
            {fmt(d.saldo)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DinFramtidPanel({ profile, transactions }) {
  const [mode, setMode] = useState('realistic');
  const [incomePct, setIncomePct] = useState(0);
  const [spendPct, setSpendPct] = useState(0);
  const [saveKr, setSaveKr] = useState(0);

  const pengometer = useMemo(() => calculatePengometer(profile, transactions), [profile, transactions]);
  const pulseNow = useMemo(() => {
    if (!profile) return null;
    const balance = profile.buffer || 0;
    const safe = getSafeToSpend(profile, balance);
    const expenses = buildUpcomingExpenses(profile);
    const events = getUpcomingDates(expenses, balance, 25, profile.income || 0);
    const withBal = calculateRunningBalance(events, balance);
    const next = getNextDangerEvent(withBal);
    return { safe, next, remainingWeek: pengometer.remaining_week_kr };
  }, [profile, pengometer]);

  const forecast = useMemo(
    () => computeScenarioForecast(profile, transactions, normalizeScenarioMode(mode), {
      incomePct,
      spendPct,
      saveKr,
    }),
    [profile, transactions, mode, incomePct, spendPct, saveKr],
  );

  const activeMode = SCENARIO_MODES.find((m) => m.id === mode) || SCENARIO_MODES[1];
  const statusKey = forecast?.status_key || 'grön';
  const accent = STATUS_ACCENT[statusKey] || STATUS_ACCENT.grön;

  const handleShare = async () => {
    const text = scenarioShareLine(forecast, activeMode);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Din Framtid — Anchor', text });
        return;
      } catch { /* fallback */ }
    }
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
  };

  if (!profile) {
    return (
      <p className={`${sectionSubtitleClass} py-12 text-center`}>
        Slutför onboardingen för att se din framtid.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Läget nu — kompakt */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl px-4 py-4 border border-white/[0.08] bg-white/[0.04]">
        <p className="text-[12px] font-medium text-white/40 mb-2">Läget nu</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/75">
          <span><strong className="text-white tabular-nums">{fmt(pulseNow?.remainingWeek)}</strong> kvar den här veckan</span>
          <span><strong className="text-white tabular-nums">{fmt(pulseNow?.safe)}</strong> säkert att spendera</span>
          {pulseNow?.next && (
            <span className="text-amber-200/90">Nästa: {pulseNow.next.name}</span>
          )}
        </div>
      </motion.div>

      {/* Scenario-väljare */}
      <div>
        <p className="text-[15px] font-semibold text-white mb-1">Din Framtid</p>
        <p className={`${sectionSubtitleClass} mb-4`}>{activeMode.blurb}</p>
        <div className="grid grid-cols-3 gap-2">
          {SCENARIO_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                'rounded-xl px-2 py-3 text-center transition-colors ring-1',
                mode === m.id
                  ? 'bg-white text-[#050d28] ring-white'
                  : 'bg-white/[0.05] text-white/60 ring-white/[0.08] hover:text-white/85',
              )}
            >
              <span className="text-lg block mb-1">{m.emoji}</span>
              <span className="text-[11px] font-semibold leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <DashboardSection nested title="Justera antaganden">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-white/55">Inkomstförändring</span>
              <span className="text-white tabular-nums">{incomePct > 0 ? '+' : ''}{incomePct}%</span>
            </div>
            <input
              type="range"
              min={-15}
              max={15}
              step={1}
              value={incomePct}
              onChange={(e) => setIncomePct(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-white/55">Vardagsutgifter</span>
              <span className="text-white tabular-nums">{spendPct > 0 ? '+' : ''}{spendPct}%</span>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              step={1}
              value={spendPct}
              onChange={(e) => setSpendPct(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-white/55">Extra sparande / mån</span>
              <span className="text-white tabular-nums">{saveKr} kr</span>
            </div>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={saveKr}
              onChange={(e) => setSaveKr(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>
        </div>
      </DashboardSection>

      {/* Prognos */}
      {forecast && (
        <motion.div key={mode + incomePct + spendPct + saveKr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-2xl p-4 mb-4" style={{ border: `1px solid ${accent}40`, background: `${accent}12` }}>
            <p className="text-[17px] font-semibold text-white">{forecast.status_label}</p>
            <p className="text-[22px] font-light text-white mt-2 tabular-nums">{forecast.prognos_30_dagar}</p>
            {forecast.coach_detaljer && (
              <p className={`${sectionSubtitleClass} mt-3 leading-relaxed`}>{forecast.coach_detaljer}</p>
            )}
          </div>

          <DashboardStatStrip
            items={[
              { label: '60 dagar min', value: fmt(forecast._meta?.minBalance) },
              { label: 'Snitt/dag', value: `${fmt(forecast._meta?.dailySpend)}` },
            ]}
          />

          {(forecast.framtida_handelser || []).length > 0 && (
            <DashboardSection nested title="Det som väntar" className="mt-6">
              <ul className="space-y-2">
                {forecast.framtida_handelser.slice(0, 4).map((ev, i) => (
                  <li key={i} className="text-[14px] text-white/70">
                    <span className="text-white/40">{ev.tidsfönster}</span>
                    {' · '}
                    {ev.händelse}
                  </li>
                ))}
              </ul>
            </DashboardSection>
          )}

          <DashboardSection nested title="Saldo över tid" className="mt-6">
            <Timeline tidslinje={forecast.tidslinje} />
          </DashboardSection>

          <button
            type="button"
            onClick={handleShare}
            className={`${anchorGhostButtonClass} w-full mt-6 justify-center gap-2`}
          >
            <Share2 className="w-4 h-4" />
            Dela scenariot
          </button>
        </motion.div>
      )}

      <Link
        to={`${createPageUrl('FuturePulse')}?view=kalender`}
        className={`${anchorGhostButtonClass} w-full justify-center gap-2 no-underline`}
      >
        <CalendarDays className="w-4 h-4" />
        Öppna ekonomikalender
      </Link>
    </div>
  );
}
