// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';
import { getGoalInsight, getMonthlyMargin } from '@/lib/financialEngine';

const MAX_SHOWN = 2;
const MIN_TRANSACTIONS_FOR_PATTERN = 10;
const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/** Sparmålsinsikt i samma format som runInsightEngine — bara när målet
 * tydligt riskerar att missas eller kan nås märkbart tidigare. */
function buildGoalDiscovery(profile) {
  if (!profile?.savingsGoal || profile.savingsGoal <= 0) return null;

  const rate = profile.savingsGoalMonthlyTarget > 0
    ? profile.savingsGoalMonthlyTarget
    : Math.max(0, Math.round(getMonthlyMargin(profile) * 0.3));
  const goal = { current: profile.savingsCurrentBalance || 0, target: profile.savingsGoal, goalName: profile.savingsGoalName || 'sparmålet' };
  const insight = getGoalInsight(goal, rate, {
    deadlineDate: profile.savingsGoalDeadline || null,
    marginAvailable: getMonthlyMargin(profile),
  });
  if (!insight) return null;

  if (insight.status === 'at_risk') {
    return {
      id: 'goal_at_risk',
      severity: 3,
      title: `${insight.goalName} riskerar att missa måldatumet`,
      description: `Med nuvarande takt (${fmt(insight.monthlyRate)} kr/mån) når du målet ${insight.targetDateLabel || 'senare än planerat'} — det är efter ${new Date(profile.savingsGoalDeadline).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}.`,
      consequence: `Om du sparar ${fmt(insight.suggestedExtra)} kr mer/mån kommer du närmare måldatumet.`,
      action: 'Sparmål',
      actionLink: '/SavingsGoals',
    };
  }
  if (insight.status === 'reachable_earlier' && insight.monthsEarlier >= 1) {
    return {
      id: 'goal_reachable_earlier',
      severity: 2,
      title: `${insight.goalName} kan nås tidigare`,
      description: `Du behöver bara cirka ${fmt(insight.suggestedExtra)} kr extra/mån för att nå målet ${insight.monthsEarlier} månad${insight.monthsEarlier === 1 ? '' : 'er'} tidigare.`,
      consequence: `Nuvarande måldatum: ${insight.targetDateLabel}.`,
      action: 'Sparmål',
      actionLink: '/SavingsGoals',
    };
  }
  return null;
}

function DiscoveryCard({ insight }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl p-4 organic-surface bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 mt-0.5" aria-hidden>💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-white leading-snug">{insight.title}</p>
          <p className="text-[14px] text-white/60 leading-snug mt-0.5">{insight.description}</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)] hover:opacity-80"
          >
            Visa vad det betyder
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </button>
          {open && (
            <div className="mt-2 space-y-2 text-[13px] text-white/55 leading-relaxed">
              {insight.consequence && <p>{insight.consequence}</p>}
              {insight.actionLink && (
                <Link to={insight.actionLink} className="inline-block font-medium text-white/80 hover:text-white underline underline-offset-2">
                  {insight.action ? `Gå till: ${insight.action}` : 'Visa detaljer'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function DashboardDiscoveries({ profile, transactions }) {
  const insights = useMemo(() => {
    const spending = runInsightEngine(profile, transactions || []);
    const goalDiscovery = buildGoalDiscovery(profile);
    const combined = goalDiscovery ? [...spending, goalDiscovery] : spending;
    return combined.sort((a, b) => b.severity - a.severity).slice(0, MAX_SHOWN);
  }, [profile, transactions]);

  const hasEnoughData = (transactions?.length || 0) >= MIN_TRANSACTIONS_FOR_PATTERN;

  if (insights.length === 0 && hasEnoughData) return null;

  return (
    <section className="pt-2">
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Lago har upptäckt</h2>
      {insights.length > 0 ? (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <DiscoveryCard key={insight.id} insight={insight} />
          ))}
        </ul>
      ) : (
        <p className="text-[14px] text-white/45 leading-relaxed">
          Jag behöver ungefär en månads transaktioner innan jag kan identifiera ett tydligt utgiftsmönster.
        </p>
      )}
    </section>
  );
}
