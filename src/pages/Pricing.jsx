import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';
import { dashLabel } from '@/lib/dashboardTheme';
import { pageEnter, staggerItem } from '@/lib/motionPresets';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/lib/billingPlans';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const MotionLink = motion.create(Link);

const linkTap = {
  whileTap: { scale: 0.96, opacity: 0.72 },
  transition: { duration: 0.12, ease: 'easeOut' },
};

export default function Pricing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { plan: currentPlan, startCheckout } = useBilling();
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      toast.success('Tack! Din plan aktiveras inom några sekunder.');
      setSearchParams({}, { replace: true });
    } else if (checkout === 'canceled') {
      toast.message('Betalningen avbröts — du kan försöka igen när du vill.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePlanClick = async (planId) => {
    if (planId === 'free') {
      window.location.href = isAuthenticated ? createPageUrl('Dashboard') : createPageUrl('CreateAccount');
      return;
    }
    if (!isAuthenticated) {
      window.location.href = createPageUrl('Login');
      return;
    }
    if (planId === currentPlan) {
      toast.message('Det här är din nuvarande plan.');
      return;
    }
    setLoadingPlan(planId);
    try {
      await startCheckout(planId);
    } catch (err) {
      toast.error(err.message || 'Kunde inte starta betalning');
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div
      className="min-h-screen min-h-[100dvh] anchor-page px-6 py-10 sm:py-12"
      style={{ background: 'var(--color-background-primary)' }}
      {...pageEnter}
    >
      <div className="max-w-lg mx-auto">
        <MotionLink
          to="/"
          className="inline-flex min-h-12 items-center text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] no-underline touch-manipulation"
          {...linkTap}
        >
          ← Till startsidan
        </MotionLink>

        <div className="anchor-premium-hero mt-6 mb-8">
          <div className="relative z-10 anchor-hero-asymmetric">
            <div className="min-w-0 pr-4">
              <p className={dashLabel}>Priser</p>
              <h1 className="anchor-type-display mt-1">Enkla priser</h1>
              <p className="anchor-type-body-sm mt-3 max-w-[28rem]">
                Anchor är byggt för svensk vardagsekonomi. Börja gratis — uppgradera när du vill gå
                djupare.
              </p>
            </div>
            <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] bg-white/[0.06] flex items-center justify-center shadow-[var(--anchor-shadow-1)] anchor-elev-1 shrink-0">
              <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {PRICING_PLANS.map((plan, i) => {
            const isCurrent = plan.id === currentPlan;
            const isPopular = plan.id === 'pro';
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.article
                key={plan.id}
                className={cn(
                  'rounded-[var(--anchor-radius-xl)] p-5 sm:p-6 border',
                  isPopular ? 'anchor-elev-3' : 'anchor-elev-2',
                )}
                style={{
                  background: isPopular
                    ? 'color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-raised))'
                    : 'var(--color-surface-raised)',
                  borderColor: isPopular
                    ? 'color-mix(in srgb, var(--color-accent) 35%, transparent)'
                    : 'rgba(255, 255, 255, 0.08)',
                }}
                {...staggerItem(i)}
              >
                {isPopular && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                    Mest populär
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 ml-2">
                    Din plan
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-4 mt-1">
                  <h2 className="anchor-type-headline">{plan.name}</h2>
                  <div className="text-right shrink-0">
                    <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
                      {plan.priceKr === 0 ? '0 kr' : `${plan.priceKr} kr`}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">{plan.period}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[14px] text-[var(--color-text-secondary)]"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  type="button"
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isLoading || (isCurrent && plan.id !== 'free')}
                  className={cn(
                    'mt-6 flex items-center justify-center gap-2 w-full min-h-12 rounded-[var(--anchor-radius-lg)] font-semibold text-[15px] touch-manipulation disabled:opacity-60',
                    isPopular
                      ? 'bg-[var(--color-text-primary)] text-[var(--color-background-primary)] anchor-elev-1'
                      : 'bg-white/[0.08] text-[var(--color-text-primary)] ring-1 ring-white/[0.12] hover:bg-white/[0.12]',
                  )}
                  whileTap={{ scale: 0.96 }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {plan.id === 'free'
                        ? (isAuthenticated ? 'Fortsätt gratis' : 'Skapa konto')
                        : isCurrent
                          ? 'Nuvarande plan'
                          : `Välj ${plan.name}`}
                      {!isLoading && <ArrowRight className="w-4 h-4" aria-hidden />}
                    </>
                  )}
                </motion.button>
              </motion.article>
            );
          })}
        </div>

        <motion.p
          className="text-[13px] text-[var(--color-text-tertiary)] text-center mt-10 leading-relaxed"
          {...staggerItem(PRICING_PLANS.length)}
        >
          Alla priser i SEK inkl. moms.{' '}
          <Link to="/TermsOfService" className="underline text-[var(--color-text-secondary)]">
            Villkor
          </Link>
          {' · '}
          <Link to="/PrivacyPolicy" className="underline text-[var(--color-text-secondary)]">
            Integritet
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}

export const pageSeo = pageSeoFor('Pricing');
