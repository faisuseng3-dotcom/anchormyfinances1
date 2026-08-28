// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import FutureMetric from './FutureMetric';
import FutureLineChart from './charts/FutureLineChart';
import FutureBarChart from './charts/FutureBarChart';
import FutureScenarioComparison from './FutureScenarioComparison';
import { whatIfExtraSavings } from '@/lib/financialEngine';
import { applySavingsRateChange } from '@/lib/planActions';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import ConfirmPlanChangeSheet from '@/components/plan/ConfirmPlanChangeSheet';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Ett svar i tråden: fråga, berättande text, nyckeltal som räknas upp,
 * och det diagram som passar frågan bäst. Allt bygger på den riktiga
 * uträkningen i scenarioMath — ingenting här är påhittat av en modell.
 * För sparande-scenarier läggs en jämförelse mot baseline + en
 * "Använd denna plan"-knapp till, byggd av samma financialEngine-funktion
 * som Sparmål-sidan och Dashboard redan använder.
 */
export default function FutureAnswerCard({ question, result, intent, amountKr, profile }) {
  const { updateProfile } = useFinancialProfile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!result) return null;
  const { title, narrative, assumption, metrics, chart } = result;

  const isSavingsChange = intent === 'increase_savings' && amountKr > 0 && profile;
  const whatIf = isSavingsChange ? whatIfExtraSavings(profile, amountKr) : null;
  const newMonthlyTarget = (profile?.savingsGoalMonthlyTarget > 0 ? profile.savingsGoalMonthlyTarget : (whatIf?.before?.monthlyRate || 0)) + amountKr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] p-5 sm:p-6"
      style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
    >
      <p className="text-[13px] text-[var(--color-text-muted)] mb-1">{question}</p>
      <h3 className="text-[19px] font-bold text-[var(--color-text-primary)] mb-3">{title}</h3>

      {narrative && (
        <p className="text-[14.5px] text-[var(--color-text-secondary)] leading-relaxed mb-4">{narrative}</p>
      )}

      {assumption && (
        <p className="flex items-start gap-1.5 text-[12px] text-[var(--color-text-muted)] mb-4 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {assumption}
        </p>
      )}

      {metrics?.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-4 mb-5">
          {metrics.map((m) => (
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:opacity-90 transition-opacity"
        >
          Använd denna plan
        </button>
      )}
      {applied && (
        <p className="text-[13px] text-[var(--color-accent)] font-medium">Planen är uppdaterad.</p>
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
