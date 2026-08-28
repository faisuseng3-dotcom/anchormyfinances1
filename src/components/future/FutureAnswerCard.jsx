// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import FutureMetric from './FutureMetric';
import FutureLineChart from './charts/FutureLineChart';
import FutureBarChart from './charts/FutureBarChart';
import FutureScenarioComparison from './FutureScenarioComparison';
import { whatIfExtraSavings } from '@/lib/financialEngine';
import { applySavingsRateChange } from '@/lib/planActions';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import ConfirmPlanChangeSheet from '@/components/plan/ConfirmPlanChangeSheet';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function formatValue(value, format) {
  if (format === 'months') return `${fmt(value)} mån`;
  if (format === 'count') return `${fmt(value)}`;
  return `${fmt(value)} kr`;
}

const TONE_COLOR = {
  accent: 'var(--color-accent)',
  critical: 'var(--color-danger)',
};

/** Den huvudsakliga siffran — samma svar som förr, bara mycket större och alltid synlig. */
function HeadlineMetric({ label, value, format = 'kr', accent = false, tone }) {
  const displayed = useCountUp(value ?? 0, 800);
  const resolvedTone = tone || (accent ? 'accent' : null);
  return (
    <div className="mb-4">
      <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{label}</p>
      <p
        className="font-black tabular-nums leading-none tracking-tight"
        style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', color: TONE_COLOR[resolvedTone] || 'var(--color-text-primary)' }}
      >
        {formatValue(displayed, format)}
      </p>
    </div>
  );
}

/**
 * Ett svar i tråden: fråga + huvudsiffra alltid synliga (svaret på en gång),
 * resten (berättande text, diagram, jämförelse, "Använd denna plan") bakom
 * "Visa detaljer" — annars blir varje kort det tätaste elementet på sidan.
 * Allt bygger på den riktiga uträkningen i scenarioMath — ingenting här är
 * påhittat av en modell.
 */
export default function FutureAnswerCard({ question, result, intent, amountKr, profile, defaultExpanded = false }) {
  const { updateProfile } = useFinancialProfile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!result) return null;
  const { title, narrative, assumption, metrics, chart } = result;
  // The most relevant figure isn't always listed first — computeScenario marks
  // it with accent/tone. Fall back to the first metric if none is marked.
  const headlineIndex = (metrics || []).findIndex((m) => m.accent || m.tone);
  const resolvedIndex = headlineIndex >= 0 ? headlineIndex : 0;
  const headlineMetric = (metrics || [])[resolvedIndex];
  const restMetrics = (metrics || []).filter((_, i) => i !== resolvedIndex);

  const isSavingsChange = intent === 'increase_savings' && amountKr > 0 && profile;
  const whatIf = isSavingsChange ? whatIfExtraSavings(profile, amountKr) : null;
  const newMonthlyTarget = (profile?.savingsGoalMonthlyTarget > 0 ? profile.savingsGoalMonthlyTarget : (whatIf?.before?.monthlyRate || 0)) + amountKr;

  const hasDetails = Boolean(narrative || restMetrics.length > 0 || chart || whatIf || isSavingsChange);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] p-5 sm:p-6"
      style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
    >
      <p className="text-[13px] text-[var(--color-text-muted)] mb-1">{question}</p>
      <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)] mb-3">{title}</h3>

      {headlineMetric && <HeadlineMetric {...headlineMetric} />}

      {hasDetails && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)] hover:opacity-80"
        >
          {expanded ? 'Dölj detaljer' : 'Visa detaljer'}
          <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
        </button>
      )}

      {expanded && (
        <div className="mt-4">
          {narrative && (
            <p className="text-[14.5px] text-[var(--color-text-secondary)] leading-relaxed mb-4">{narrative}</p>
          )}

          {assumption && (
            <p className="flex items-start gap-1.5 text-[12px] text-[var(--color-text-muted)] mb-4 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {assumption}
            </p>
          )}

          {restMetrics.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-4 mb-5">
              {restMetrics.map((m) => (
                <FutureMetric key={m.label} {...m} />
              ))}
            </div>
          )}

          {chart?.type === 'line' && (
            <FutureLineChart data={chart.data} lines={chart.lines} />
          )}
          {chart?.type === 'bar' && <FutureBarChart data={chart.data} />}

          {whatIf && <div className="mt-5"><FutureScenarioComparison whatIf={whatIf} /></div>}

          {isSavingsChange && !applied && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Använd denna plan
            </button>
          )}
          {applied && (
            <p className="mt-4 text-[13px] text-[var(--color-accent)] font-medium">Planen är uppdaterad.</p>
          )}
        </div>
      )}

      {isSavingsChange && (
        <ConfirmPlanChangeSheet
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Din nya plan"
          change={{ label: 'Löpande sparande', before: newMonthlyTarget - amountKr, after: newMonthlyTarget, suffix: 'kr/mån' }}
          impactLine={whatIf?.monthsEarlier > 0
            ? `Du når ${whatIf.before.goalName || 'sparmålet'} ungefär ${whatIf.monthsEarlier} månad${whatIf.monthsEarlier === 1 ? '' : 'er'} tidigare.`
            : `Ditt löpande sparande höjs med ${fmt(amountKr)} kr/mån.`}
          onConfirm={async () => {
            await applySavingsRateChange(profile, newMonthlyTarget, { updateProfile });
            setApplied(true);
          }}
        />
      )}
    </motion.div>
  );
}
