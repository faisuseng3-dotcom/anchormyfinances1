import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useBilling } from '@/hooks/useBilling';
import { PLANS, formatPlanLabel } from '@/lib/billingPlans';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const FEATURE_COPY = {
  ai_coach_unlimited: {
    title: 'Obegränsad Coach',
    description: 'Du har nått månadens gratisgräns. Uppgradera till Pro för obegränsad coach.',
    minPlan: 'pro',
  },
  future_pulse: {
    title: 'Din Framtid',
    description: 'Scenarier och 60-dagarsprognos ingår i Pro och Business.',
    minPlan: 'pro',
  },
  squads: {
    title: 'Squads',
    description: 'Spara tillsammans med vänner — tillgängligt från Pro.',
    minPlan: 'pro',
  },
  business_dashboard: {
    title: 'Företagsdashboard',
    description: 'Kvitton, moms och verifikat kräver Business-planen.',
    minPlan: 'business',
  },
};

export default function PlanGate({ feature, children, compact = false }) {
  const { canAccess, plan, aiCoachRemaining, canUseAiCoach } = useBilling();

  const isAiCoachFeature = feature === 'ai_coach_unlimited';
  const allowed = isAiCoachFeature ? canUseAiCoach : canAccess(feature);

  if (allowed) return <>{children}</>;

  const copy = FEATURE_COPY[feature] || {
    title: 'Kräver uppgradering',
    description: 'Den här funktionen ingår i en högre plan.',
    minPlan: 'pro',
  };
  const needed = PLANS[copy.minPlan];
  const neededLabel = needed?.name || formatPlanLabel(copy.minPlan);

  if (compact) {
    return (
      <div className="rounded-2xl p-4 organic-surface bg-[var(--copilot-bg-card)] text-center">
        <p className="text-sm text-[var(--copilot-text-secondary)]">{copy.description}</p>
        <Link
          to={createPageUrl('Pricing')}
          className="inline-flex mt-3 items-center gap-2 text-sm font-semibold text-[var(--color-accent)] no-underline"
        >
          <Sparkles className="w-4 h-4" />
          Uppgradera till {neededLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-10">
      <div
        className="rounded-[var(--anchor-radius-xl)] p-8 flex flex-col items-center gap-4 text-center max-w-sm w-full anchor-elev-2"
        style={{ background: 'var(--color-surface-raised)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white mb-1">{copy.title}</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            {isAiCoachFeature && aiCoachRemaining === 0
              ? `Du har använt alla ${PLANS[plan]?.aiCoachLimit ?? 5} Coach-frågor den här månaden.`
              : copy.description}
          </p>
        </div>
        <Link to={createPageUrl('Pricing')} className="w-full no-underline">
          <AnchorPressable
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold text-[#08110c] bg-[#4fae82]"
          >
            Uppgradera till {neededLabel} →
          </AnchorPressable>
        </Link>
      </div>
    </div>
  );
}
