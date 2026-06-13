import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Share2, CalendarDays } from 'lucide-react';
import { ScenarioIcon } from '@/lib/anchorIcons';
import {
  SCENARIO_MODES,
  computeScenarioForecast,
  normalizeScenarioMode,
  scenarioShareLine,
} from '@/lib/dinFramtidScenarios';
import { calculatePengometer } from '@/lib/anchorBrain';
import { getSafeToSpend, buildUpcomingExpenses, getUpcomingDates, calculateRunningBalance, getNextDangerEvent } from '@/components/pulse/pulseEngine';
import { GlassSection } from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { copilotGhostBtnClass } from '@/lib/copilotTheme';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motionPresets';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { triggerHaptic } from '@/lib/haptics';

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
      <p className="text-[14px] text-[var(--copilot-text-secondary)] py-12 text-center">
        Slutför onboardingen för att se din framtid.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Läget nu — kompakt */}
      <motion.div {...staggerItem(0)} className="rounded-2xl px-4 py-4 organic-surface bg-[var(--copilot-bg-card)]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2">Läget nu</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[var(--copilot-text-secondary)]">
          <span><strong className="text-white tabular-nums">{fmt(pulseNow?.remainingWeek)}</strong> kvar den här veckan</span>
          <span><strong className="text-[var(--copilot-accent-green)] tabular-nums">{fmt(pulseNow?.safe)}</strong> säkert att spendera</span>
          {pulseNow?.next && (
            <span className="text-[var(--copilot-accent-blue)]">Kommande: {pulseNow.next.name}</span>
          )}
        </div>
      </motion.div>

      {/* Scenario-väljare */}
      <div>
        <p className="text-[15px] font-semibold text-white mb-1">Din Framtid</p>
        <p className="text-[14px] text-[var(--copilot-text-secondary)] mb-4">{activeMode.blurb}</p>
        <div className="grid grid-cols-3 gap-2">
          {SCENARIO_MODES.map((m) => (
            <AnchorPressable
              key={m.id}
              type="button"
              minTouch={false}
              onClick={() => { triggerHaptic('light'); setMode(m.id); }}
              className={cn(
                'rounded-2xl px-2 py-3 min-h-[4.5rem] text-center border',
                mode === m.id
                  ? 'bg-[var(--copilot-accent-blue)] text-white border-[rgba(74,122,255,0.4)]'
                  : 'bg-[var(--copilot-bg-card)] text-[var(--copilot-text-secondary)] ',
              )}
            >
              <ScenarioIcon mode={m.id} size={20} className="block mx-auto mb-1" />
              <span className="text-[11px] font-semibold leading-tight">{m.label}</span>
            </AnchorPressable>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <GlassSection title="Justera antaganden">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-[var(--copilot-text-secondary)]">Inkomstförändring</span>
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
              <span className="text-[var(--copilot-text-secondary)]">Vardagsutgifter</span>
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
              <span className="text-[var(--copilot-text-secondary)]">Extra sparande / mån</span>
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
      </GlassSection>

      {/* Prognos */}
      {forecast && (
        <motion.div key={mode + incomePct + spendPct + saveKr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-2xl p-4 mb-4 border" style={{ borderColor: `${accent}40`, background: `${accent}12` }}>
            <p className="text-[17px] font-semibold text-white">{forecast.status_label}</p>
            <p className="text-[22px] font-bold text-white mt-2 tabular-nums">{forecast.prognos_30_dagar}</p>
            {forecast.coach_detaljer && (
              <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-3 leading-relaxed">{forecast.coach_detaljer}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]">
              <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">60 dagar min</p>
              <p className="text-[18px] font-bold text-white tabular-nums mt-1">{fmt(forecast._meta?.minBalance)}</p>
            </div>
            <div className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]">
              <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Snitt/dag</p>
              <p className="text-[18px] font-bold text-white tabular-nums mt-1">{fmt(forecast._meta?.dailySpend)}</p>
            </div>
          </div>

          {(forecast.framtida_handelser || []).length > 0 && (
            <GlassSection title="Det som väntar" className="mt-6">
              <ul className="space-y-2">
                {forecast.framtida_handelser.slice(0, 4).map((ev, i) => (
                  <li key={i} className="text-[14px] text-[var(--copilot-text-secondary)]">
                    <span className="text-[var(--copilot-text-muted)]">{ev.tidsfönster}</span>
                    {' · '}
                    {ev.händelse}
                  </li>
                ))}
              </ul>
            </GlassSection>
          )}

          <GlassSection title="Saldo över tid" className="mt-6">
            <Timeline tidslinje={forecast.tidslinje} />
          </GlassSection>

          <button
            type="button"
            onClick={() => { triggerHaptic('light'); handleShare(); }}
            className={`${copilotGhostBtnClass} w-full mt-6 justify-center gap-2`}
          >
            <Share2 className="w-4 h-4" />
            Dela scenariot
          </button>
        </motion.div>
      )}

      <Link
        to={`${createPageUrl('FuturePulse')}?view=kalender`}
        className={`${copilotGhostBtnClass} w-full justify-center gap-2 no-underline`}
      >
        <CalendarDays className="w-4 h-4" />
        Öppna ekonomikalender
      </Link>
    </div>
  );
}
