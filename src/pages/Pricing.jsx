import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';
import { dashLabel } from '@/lib/dashboardTheme';
import { pageEnter, staggerItem } from '@/lib/motionPresets';
import { cn } from '@/lib/utils';

const MotionLink = motion.create(Link);

const linkTap = {
  whileTap: { scale: 0.96, opacity: 0.72 },
  transition: { duration: 0.12, ease: 'easeOut' },
};

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '0 kr',
    period: 'för alltid',
    description: 'Kom igång med budget, historik och grundläggande insikter.',
    features: [
      'Översikt & pengometer',
      'Transaktionshistorik',
      'Budget per kategori',
      'Planera kalender',
    ],
    cta: 'Skapa konto',
    href: createPageUrl('CreateAccount'),
    highlight: false,
  },
  {
    id: 'plus',
    name: 'Anchor Plus',
    price: '79 kr',
    period: 'per månad',
    description: 'För dig som vill simulera, jämföra och fatta tryggare beslut.',
    features: [
      'Allt i Gratis',
      'Scenarier & 60-dagarsprognos',
      'Jämför anonymt med andra',
      'Avancerade insikter & läckagedetektor',
      'Anchor Academy-lektioner',
    ],
    cta: 'Kom igång med Plus',
    href: createPageUrl('CreateAccount'),
    highlight: true,
  },
  {
    id: 'business',
    name: 'Anchor Business',
    price: 'Från 149 kr',
    period: 'per månad',
    description: 'Enskild firma och AB — kvitton, moms och verifikat på svenska villkor.',
    features: [
      'Företagsöversikt & kassa',
      'Kvitto & moms',
      'Verifikat & export',
      'Årsbokslut-stöd',
    ],
    cta: 'Välj företag',
    href: '/',
    highlight: false,
  },
];

export default function Pricing() {
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
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.id}
              className={cn(
                'rounded-[var(--anchor-radius-xl)] p-5 sm:p-6 border',
                plan.highlight ? 'anchor-elev-3' : 'anchor-elev-2',
              )}
              style={{
                background: plan.highlight
                  ? 'color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-raised))'
                  : 'var(--color-surface-raised)',
                borderColor: plan.highlight
                  ? 'color-mix(in srgb, var(--color-accent) 35%, transparent)'
                  : 'rgba(255, 255, 255, 0.08)',
              }}
              {...staggerItem(i)}
            >
              {plan.highlight && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Mest populär
                </span>
              )}
              <div className="flex items-baseline justify-between gap-4 mt-1">
                <h2 className="anchor-type-headline">{plan.name}</h2>
                <div className="text-right shrink-0">
                  <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
                    {plan.price}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{plan.period}</p>
                </div>
              </div>
              <p className="anchor-type-body-sm mt-3">{plan.description}</p>
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
              <MotionLink
                to={plan.href}
                className={cn(
                  'mt-6 flex items-center justify-center gap-2 w-full min-h-12 rounded-[var(--anchor-radius-lg)] font-semibold text-[15px] no-underline touch-manipulation',
                  plan.highlight
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-background-primary)] anchor-elev-1'
                    : 'bg-white/[0.08] text-[var(--color-text-primary)] ring-1 ring-white/[0.12] hover:bg-white/[0.12]',
                )}
                {...linkTap}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </MotionLink>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="text-[13px] text-[var(--color-text-tertiary)] text-center mt-10 leading-relaxed"
          {...staggerItem(PLANS.length)}
        >
          Alla priser i SEK. Ingen bindningstid på Plus.{' '}
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
