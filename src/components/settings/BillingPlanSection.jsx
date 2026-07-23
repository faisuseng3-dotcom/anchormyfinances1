import React, { useState } from 'react';
import { CreditCard, Crown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useBilling } from '@/hooks/useBilling';
import { PLANS } from '@/lib/billingPlans';
import { GlassSection } from '@/components/layout/PageShell';
import UpgradeButton from '@/components/billing/UpgradeButton';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function BillingPlanSection() {
  const {
    plan,
    planLabel,
    renewalLabel,
    subscriptionId,
    openBillingPortal,
    aiCoachRemaining,
    aiCoachUnlimited,
  } = useBilling();
  const [portalLoading, setPortalLoading] = useState(false);

  const current = PLANS[plan];

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
    }
  };

  return (
    <GlassSection title="Din plan" icon={Crown}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-white">{planLabel}</p>
            <p className="text-sm text-white/50 mt-1">
              {current.priceKr === 0
                ? 'Gratis — uppgradera när du vill gå djupare'
                : `${current.priceKr} kr/månad`}
            </p>
            {renewalLabel && (
              <p className="text-sm text-white/45 mt-2">
                Förnyas {renewalLabel}
              </p>
            )}
            {!aiCoachUnlimited && aiCoachRemaining != null && (
              <p className="text-sm text-white/45 mt-1">
                Coach: {aiCoachRemaining} kvar denna månad
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {plan === 'free' && (
            <UpgradeButton targetPlan="basic" label="Uppgradera till Basic" />
          )}
          {plan === 'basic' && (
            <UpgradeButton targetPlan="pro" label="Uppgradera till Pro" />
          )}
          {plan === 'pro' && (
            <UpgradeButton targetPlan="business" label="Uppgradera till Business" variant="secondary" />
          )}
          {subscriptionId && (
            <AnchorPressable
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold bg-white/8 text-white ring-1 ring-white/12"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Hantera prenumeration
            </AnchorPressable>
          )}
          <Link
            to={createPageUrl('Pricing')}
            className="inline-flex items-center min-h-11 px-4 text-sm text-white/60 no-underline hover:text-white/80"
          >
            Jämför planer →
          </Link>
        </div>
      </div>
    </GlassSection>
  );
}
