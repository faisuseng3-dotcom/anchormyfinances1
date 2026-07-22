import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Sparkles,
  Wallet,
  Plane,
  ShoppingBag,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { useModeContext } from '@/components/modes/ModeContext';
import { PLANS, PLAN_ORDER } from '@/lib/billingPlans';
import { cn } from '@/lib/utils';
import './landing.css';

export const pageSeo = pageSeoFor('Landing');

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1800&q=80';

const FEATURE_TABS = [
  {
    id: 'coach',
    label: 'AI-coach',
    title: 'En coach som känner din ekonomi',
    body: 'Fråga på svenska, få konkreta råd baserat på dina siffror — inte generiska tips.',
    cta: 'Prova coach',
    icon: Sparkles,
    preview: { label: 'Coach', value: 'Du kan spara 1 240 kr den här månaden', tone: 'blue' },
  },
  {
    id: 'budget',
    label: 'Budget',
    title: 'Se vad som faktiskt blir kvar',
    body: 'Pengometer, fasta kostnader och läckagedetektor i ett flöde — så du vet exakt hur mycket du har att röra dig med.',
    cta: 'Öppna översikt',
    icon: Wallet,
    preview: { label: 'Fria pengar', value: '8 420 kr', tone: 'green' },
  },
  {
    id: 'travel',
    label: 'Resor',
    title: 'Planera resan inom budget',
    body: 'Beskriv destination och budget — Lago bygger tre paket med boende, aktiviteter och marginal per dag.',
    cta: 'Planera resa',
    icon: Plane,
    preview: { label: 'Barcelona', value: '12 000 kr · 5 nätter', tone: 'indigo' },
  },
  {
    id: 'purchase',
    label: 'Köpcheck',
    title: 'Stoppa impulsköp innan de sker',
    body: 'Klistra in en länk eller fotografera en produkt. Lago väger priset mot ditt sparmål och din marginal.',
    cta: 'Analysera köp',
    icon: ShoppingBag,
    preview: { label: 'Köpcheck', value: 'Vänta 48h · påverkar sparmålet', tone: 'amber' },
  },
  {
    id: 'future',
    label: 'Framtid',
    title: 'Se 60 dagar framåt',
    body: 'FuturePulse visar hur din ekonomi rör sig — och vad som händer om du höjer sparandet eller byter abonnemang.',
    cta: 'Se din framtid',
    icon: TrendingUp,
    preview: { label: 'Prognos', value: '+4 800 kr om 60 dagar', tone: 'teal' },
  },
];

const TRUST = [
  { title: 'GDPR', sub: 'Data lagras inom EU' },
  { title: 'Ingen bankkoppling', sub: 'Du styr vad du delar' },
  { title: 'AI på svenska', sub: 'Coach, resa & köpcheck' },
  { title: 'Privat & Business', sub: 'Separata miljöer' },
];

const PLAN_BLURBS = {
  free: 'De ekonomiska grunderna — översikt, historik och AI-coach några gånger i månaden.',
  basic: 'För dig som vill ha mer stöd — fler AI-frågor, scenarier och Academy.',
  pro: 'Obegränsad coach, FuturePulse och Squads för dig som vill maxa kontrollen.',
  business: 'Företagsdashboard, kvitton, moms och årsbokslut i samma app.',
};

function formatPrice(plan) {
  if (!plan.priceKr) return 'Kostnadsfritt';
  return `${plan.priceKr} kr/månad`;
}

function MarketingNav({ onSignup, onLogin, mode, setPersonal, setBusiness }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link to="/Landing" className="text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
          Lago
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium text-white/95 md:flex">
          <button
            type="button"
            onClick={setPersonal}
            className={cn('cursor-pointer transition-opacity hover:opacity-80', mode === 'personal' && 'underline underline-offset-8')}
          >
            Privat
          </button>
          <button
            type="button"
            onClick={setBusiness}
            className={cn('cursor-pointer transition-opacity hover:opacity-80', mode === 'business' && 'underline underline-offset-8')}
          >
            Business
          </button>
          <a href="#features" className="transition-opacity hover:opacity-80">Funktioner</a>
          <a href="#plans" className="transition-opacity hover:opacity-80">Paket</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onLogin}
            className="cursor-pointer px-3 py-2 text-[15px] font-medium text-white transition-opacity hover:opacity-80"
          >
            Logga in
          </button>
          <button
            type="button"
            onClick={onSignup}
            className="cursor-pointer rounded-full bg-[#eceef1] px-5 py-2.5 text-[15px] font-semibold text-[#191c1f] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Registrera dig
          </button>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-full p-2 text-white md:hidden"
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 rounded-2xl bg-white p-4 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-1 text-[15px] font-medium text-[#191c1f]">
              <button type="button" className="cursor-pointer rounded-xl px-3 py-3 text-left hover:bg-[#f4f5f7]" onClick={() => { setPersonal(); setOpen(false); }}>Privat</button>
              <button type="button" className="cursor-pointer rounded-xl px-3 py-3 text-left hover:bg-[#f4f5f7]" onClick={() => { setBusiness(); setOpen(false); }}>Business</button>
              <a href="#features" className="rounded-xl px-3 py-3 hover:bg-[#f4f5f7]" onClick={() => setOpen(false)}>Funktioner</a>
              <a href="#plans" className="rounded-xl px-3 py-3 hover:bg-[#f4f5f7]" onClick={() => setOpen(false)}>Paket</a>
              <button type="button" className="cursor-pointer rounded-xl px-3 py-3 text-left hover:bg-[#f4f5f7]" onClick={() => { setOpen(false); onLogin(); }}>Logga in</button>
              <button type="button" className="mt-1 cursor-pointer rounded-full bg-[#191c1f] px-4 py-3 text-center font-semibold text-white" onClick={() => { setOpen(false); onSignup(); }}>Registrera dig</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroPhonePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-[360px]"
    >
      <div className="rounded-[28px] border border-white/35 bg-white/15 p-4 shadow-2xl backdrop-blur-xl">
        <div className="rounded-2xl bg-black/25 px-5 py-8 text-center text-white">
          <p className="text-sm text-white/70">Personligt</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">72 144 kr</p>
          <span className="mt-4 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90">
            Konton
          </span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="absolute -bottom-6 left-1/2 w-[92%] -translate-x-1/2 rounded-2xl bg-white p-3.5 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#191c1f]">Lön</p>
            <p className="text-xs text-[#6b7280]">Idag 11:28</p>
          </div>
          <p className="text-sm font-semibold text-[#191c1f]">+30 600 kr</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeatureSection() {
  const [active, setActive] = useState(FEATURE_TABS[0].id);
  const tab = FEATURE_TABS.find((t) => t.id === active) || FEATURE_TABS[0];
  const Icon = tab.icon;

  return (
    <section id="features" className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1f] md:text-5xl">
            Din ekonomi i ny tappning
          </h2>
          <p className="mt-4 text-base text-[#6b7280] md:text-lg">
            Budget, AI-coach, resor och köpcheck — i en app som visar vad du faktiskt har råd med.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {FEATURE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active === t.id
                  ? 'bg-[#191c1f] text-white'
                  : 'bg-[#f4f5f7] text-[#191c1f] hover:bg-[#e8eaed]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f5f7]">
              <Icon className="h-6 w-6 text-[#191c1f]" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#191c1f] md:text-4xl">
              {tab.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#6b7280] md:text-lg">
              {tab.body}
            </p>
            <Link
              to={createPageUrl('CreateAccount')}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#191c1f] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {tab.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[28px] bg-[#f4f5f7] p-8 md:p-12">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-[#6b7280]">{tab.preview.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#191c1f] md:text-3xl">
                {tab.preview.value}
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8eaed]">
                <motion.div
                  key={tab.id}
                  initial={{ width: '18%' }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-[#2563eb]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section id="plans" className="bg-[#f4f5f7] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
          Välj ditt paket
        </p>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-[#191c1f] md:text-5xl">
          Börja gratis. Uppgradera när du vill.
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const featured = id === 'pro';
            return (
              <Link
                key={id}
                to={createPageUrl('CreateAccount')}
                className={cn(
                  'flex cursor-pointer flex-col rounded-[24px] p-6 transition-transform hover:scale-[1.02] active:scale-[0.99]',
                  featured ? 'bg-[#191c1f] text-white shadow-xl' : 'bg-white text-[#191c1f] shadow-sm',
                )}
              >
                <h3 className="text-xl font-extrabold">{plan.name}</h3>
                <p className={cn('mt-2 text-2xl font-bold', featured ? 'text-white' : 'text-[#191c1f]')}>
                  {formatPrice(plan)}
                </p>
                <p className={cn('mt-4 flex-1 text-sm leading-relaxed', featured ? 'text-white/70' : 'text-[#6b7280]')}>
                  {PLAN_BLURBS[id]}
                </p>
                <ul className={cn('mt-5 space-y-2 text-sm', featured ? 'text-white/85' : 'text-[#191c1f]')}>
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={featured ? 'text-white/50' : 'text-[#6b7280]'}>•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { mode, setPersonal, setBusiness } = useModeContext();

  const goSignup = () => {
    if (mode === 'business') setBusiness();
    else setPersonal();
    navigate(createPageUrl('CreateAccount'));
  };

  const goLogin = () => navigate(createPageUrl('Login'));

  return (
    <div className="anchor-marketing min-h-full overflow-x-hidden">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/40" />

        <MarketingNav
          onSignup={goSignup}
          onLogin={goLogin}
          mode={mode}
          setPersonal={setPersonal}
          setBusiness={setBusiness}
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center gap-12 px-5 pb-16 pt-28 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:pt-24">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80"
            >
              Lago
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl"
            >
              Ekonomi
              <br />
              &amp; mer
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mt-5 max-w-md text-base leading-relaxed text-white/90 md:text-lg"
            >
              Se vad som blir kvar, få AI-råd på svenska och planera köp och resor — utan att koppla banken.
              Registrera dig gratis på några sekunder.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={goSignup}
                className="cursor-pointer rounded-full bg-[#191c1f] px-7 py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Kom igång gratis
              </button>
              <button
                type="button"
                onClick={goLogin}
                className="cursor-pointer rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                Logga in
              </button>
            </motion.div>
          </div>

          <div className="pb-8 lg:pb-0">
            <HeroPhonePreview />
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eaed] bg-white px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-lg font-medium text-[#6b7280] md:text-xl">
            Ekonomiapen för dig som vill ha kontroll — inte fler kontoutdrag
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div key={item.title} className="text-center">
                <p className="text-base font-extrabold text-[#191c1f]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureSection />

      <section className="bg-[#191c1f] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Ett säkert utrymme för dina siffror
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
              Lago kräver ingen bankbehörighet. Du lägger in det du vill, datan lagras inom EU enligt GDPR,
              och du kan radera kontot när som helst.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <ul className="space-y-5 text-white">
              {[
                'Krypterad lagring inom EU',
                'Ingen delning av bankinloggning',
                'AI-svar baserade på din profil — inte öppna webben',
                'Tydliga villkor och integritetspolicy',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
                  <span className="text-white/90">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PlansSection />

      <section className="bg-white px-5 py-20 text-center md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1f] md:text-5xl">
            Börja med Lago idag
          </h2>
          <p className="mt-4 text-base text-[#6b7280] md:text-lg">
            Skapa konto gratis. Välj Privat eller Business. Uppgradera när du behöver mer AI och prognoser.
          </p>
          <button
            type="button"
            onClick={goSignup}
            className="mt-8 cursor-pointer rounded-full bg-[#191c1f] px-8 py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Registrera dig
          </button>
        </div>
      </section>

      <footer className="border-t border-[#e8eaed] bg-white px-5 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="text-xl font-extrabold text-[#191c1f]">Lago</p>
            <p className="mt-2 max-w-xs text-sm text-[#6b7280]">
              En komplett app för din ekonomi — budget, AI-coach och smarta beslut.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-[#191c1f]">Produkt</p>
              <div className="mt-3 flex flex-col gap-2 text-[#6b7280]">
                <a href="#features" className="hover:text-[#191c1f]">Funktioner</a>
                <a href="#plans" className="hover:text-[#191c1f]">Paket</a>
                <Link to={createPageUrl('Pricing')} className="hover:text-[#191c1f]">Priser</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#191c1f]">Konto</p>
              <div className="mt-3 flex flex-col gap-2 text-[#6b7280]">
                <Link to={createPageUrl('Login')} className="hover:text-[#191c1f]">Logga in</Link>
                <Link to={createPageUrl('CreateAccount')} className="hover:text-[#191c1f]">Registrera dig</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#191c1f]">Juridiskt</p>
              <div className="mt-3 flex flex-col gap-2 text-[#6b7280]">
                <Link to="/TermsOfService" className="hover:text-[#191c1f]">Villkor</Link>
                <Link to="/PrivacyPolicy" className="hover:text-[#191c1f]">Integritet</Link>
              </div>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-[#6b7280]">
          © {new Date().getFullYear()} Lago. Lago är inte en bank och erbjuder inte bankkonton eller
          betalningar. Designen är inspirerad av moderna fintech-upplevelser.
        </p>
      </footer>
    </div>
  );
}
