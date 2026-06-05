import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';

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
    <div
      className="min-h-screen min-h-[100dvh] anchor-page px-6 py-12"
      style={{ background: 'var(--color-background-primary)' }}
    >
      <div className="max-w-lg mx-auto">
        <Link
          to="/"
          className="text-[13px] text-white/45 hover:text-white/70 no-underline"
        >
          ← Till startsidan
        </Link>

        <h1 className="text-[32px] font-semibold text-white tracking-tight mt-8">
          Enkla priser
        </h1>
        <p className="text-[15px] text-white/50 mt-3 leading-relaxed">
          Anchor är byggt för svensk vardagsekonomi. Börja gratis — uppgradera när du vill gå djupare.
        </p>

        <div className="mt-10 space-y-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-6 border"
              style={{
                background: plan.highlight ? 'rgba(127,160,255,0.08)' : 'rgba(255,255,255,0.04)',
                borderColor: plan.highlight ? 'rgba(127,160,255,0.35)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {plan.highlight && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#9FB5FF]">
                  Mest populär
                </span>
              )}
              <div className="flex items-baseline justify-between gap-4 mt-1">
                <h2 className="text-[20px] font-semibold text-white">{plan.name}</h2>
                <div className="text-right">
                  <p className="text-[22px] font-bold text-white tabular-nums">{plan.price}</p>
                  <p className="text-[12px] text-white/40">{plan.period}</p>
                </div>
              </div>
              <p className="text-[14px] text-white/55 mt-3 leading-relaxed">{plan.description}</p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-white/75">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`mt-6 flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-semibold text-[15px] no-underline ${
                  plan.highlight
                    ? 'bg-white text-[#050d28]'
                    : 'bg-white/[0.08] text-white ring-1 ring-white/[0.12] hover:bg-white/[0.12]'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-white/40 text-center mt-10 leading-relaxed">
          Alla priser i SEK. Ingen bindningstid på Plus.{' '}
          <Link to="/TermsOfService" className="underline text-white/55">Villkor</Link>
          {' · '}
          <Link to="/PrivacyPolicy" className="underline text-white/55">Integritet</Link>
        </p>
      </div>
    </div>
  );
}

export const pageSeo = pageSeoFor('Pricing');
