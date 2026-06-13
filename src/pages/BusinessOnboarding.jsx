import React, { useState, useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowRight,
  CheckCircle2, Building2, TrendingUp, Shield, ChevronRight, Loader2,
  User, Palette, Laptop, Scissors, ShoppingCart, GraduationCap, Home, HandMetal, Ban,
} from 'lucide-react';
import {
  ensureOnboardingMode,
} from '@/lib/onboardingRouter';

// ─── Legal entity types ─────────────────────────────────────────────────────────
const LEGAL_ENTITIES = [
  {
    id: 'enskild',
    label: 'Enskild firma',
    desc: 'Aktiverar egenavgifter (28.97%) och F-skatteberegning',
    Icon: User,
    color: '#4B7CF3',
    bg: 'rgba(75,124,243,0.1)',
    border: 'rgba(75,124,243,0.4)',
  },
  {
    id: 'ab',
    label: 'Aktiebolag (AB)',
    desc: 'Aktiverar bolagsskatt (20.6%), lön & utdelningsutrymme',
    Icon: Building2,
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.1)',
    border: 'rgba(212,175,55,0.4)',
  },
];

// ─── Persona data ────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    id: 'artist',
    Icon: Palette,
    title: 'Kreatören',
    subtitle: 'Frilansaren',
    who: 'Fotograf, copywriter, designer',
    hook: 'Vi hjälper dig med oregelbundna inkomster',
    keyMetric: 'Buffertfokus',
    color: '#A78BFA',
    bgAccent: 'rgba(167,139,250,0.12)',
    borderAccent: 'rgba(167,139,250,0.5)',
    aiSetup: 'Bygger buffert för månader utan uppdrag & jagar avdrag för utrustning och mjukvara.',
  },
  {
    id: 'consultant',
    Icon: Laptop,
    title: 'Gig-konsulten',
    subtitle: 'The Professional',
    who: 'IT-konsult, projektledare, interim-chef',
    hook: 'Vi optimerar din skatt och lön',
    keyMetric: 'Skatteoptimering',
    color: '#4B7CF3',
    bgAccent: 'rgba(75,124,243,0.12)',
    borderAccent: 'rgba(75,124,243,0.5)',
    aiSetup: 'Fokus på pension och utdelning. Bevakar brytpunkten för statlig skatt.',
  },
  {
    id: 'local',
    Icon: Scissors,
    title: 'Tjänsteutövaren',
    subtitle: 'The Local Hero',
    who: 'Frisör, PT, massör, hantverkare',
    hook: 'Vi dödar ditt kvitto-kaos',
    keyMetric: 'Kvittomatching',
    color: '#3DAA7A',
    bgAccent: 'rgba(61,170,122,0.12)',
    borderAccent: 'rgba(61,170,122,0.5)',
    aiSetup: 'Aktiverar Instant Receipt Matching. AI:n pushar på att fota kvittot direkt vid kassan.',
  },
  {
    id: 'hustler',
    Icon: Zap,
    title: 'Sido-projektet',
    subtitle: 'The Hustler',
    who: 'Anställd som kör eget på kvällar & helger',
    hook: 'Minimal admin, maximal koll',
    keyMetric: 'Nettofokus',
    color: '#F59E0B',
    bgAccent: 'rgba(245,158,11,0.12)',
    borderAccent: 'rgba(245,158,11,0.5)',
    aiSetup: 'Fokus på enkelhet. Beräknar vad du faktiskt tjänar efter egenavgifter.',
  },
  {
    id: 'merchant',
    Icon: ShoppingCart,
    title: 'E-handlaren',
    subtitle: 'The Digital Merchant',
    who: 'Shopify, Amazon, Dropshipping',
    hook: 'Vi maximerar din marginal och ROAS',
    keyMetric: 'Marginalanalys',
    color: '#F97316',
    bgAccent: 'rgba(249,115,22,0.12)',
    borderAccent: 'rgba(249,115,22,0.5)',
    aiSetup: 'Marginalanalys (COGS), fraktkostnader och annonsavkastning. Förbered Shopify/Stripe-koppling.',
  },
  {
    id: 'educator',
    Icon: GraduationCap,
    title: 'Utbildaren',
    subtitle: 'The Knowledge Guru',
    who: 'Onlinekurser, nyhetsbrev, coachning',
    hook: 'Vi håller koll på din MRR och churn',
    keyMetric: 'MRR-tillväxt',
    color: '#EC4899',
    bgAccent: 'rgba(236,72,153,0.12)',
    borderAccent: 'rgba(236,72,153,0.5)',
    aiSetup: 'Bevakar MRR och churn. Förbereder logik för Substack/Kajabi/Teachable.',
  },
  {
    id: 'landlord',
    Icon: Home,
    title: 'Uthyraren',
    subtitle: 'The Space Manager',
    who: 'Studio, kontorsplatser, Airbnb',
    hook: 'Vi optimerar beläggning vs. driftskostnad',
    keyMetric: 'Beläggningsgrad',
    color: '#06B6D4',
    bgAccent: 'rgba(6,182,212,0.12)',
    borderAccent: 'rgba(6,182,212,0.5)',
    aiSetup: 'Beläggningsgrad vs. fasta driftskostnader. Fastighetsrelaterade utgiftskategorier aktiverade.',
  },
];

// ─── Pain points ─────────────────────────────────────────────────────────────
const PAIN_POINTS = [
  {
    id: 'tax',
    icon: Shield,
    label: 'Moms & Skatt',
    description: 'Jag vill ha koll på varje krona',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.1)',
    border: 'rgba(212,175,55,0.4)',
  },
  {
    id: 'automate',
    icon: Zap,
    label: 'Automatisera allt',
    description: 'Jag vill maximera min fritid',
    color: '#4B7CF3',
    bg: 'rgba(75,124,243,0.1)',
    border: 'rgba(75,124,243,0.4)',
  },
  {
    id: 'grow',
    icon: TrendingUp,
    label: 'Investeringar & Arvoden',
    description: 'Jag vill växa',
    color: '#3DAA7A',
    bg: 'rgba(61,170,122,0.1)',
    border: 'rgba(61,170,122,0.4)',
  },
];

// ─── Integrations ─────────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { id: 'fortnox', name: 'Fortnox', color: '#22c55e', popular: true },
  { id: 'bokio', name: 'Bokio', color: '#3b82f6', popular: true },
  { id: 'stripe', name: 'Stripe', color: '#a855f7', popular: true },
  { id: 'swish', name: 'Swish Företag', color: '#ec4899', popular: false },
  { id: 'klarna', name: 'Klarna', color: '#eab308', popular: false },
  { id: 'none', name: 'Inget ännu', color: '#94a3b8', popular: false },
];

// ─── Simulated horoscope data per persona ─────────────────────────────────────
const HOROSCOPE = {
  artist: {
    insight: 'Jag ser att du har 3 oregelbundna intäktssvängar de senaste 90 dagarna. Din buffert bör vara minst 2,4 månaders drift.',
    actions: ['Adobe Creative Suite tillagd som avdrag (5 940 kr/år)', 'Kameraavdrag förberett i din skattemapp', 'Buffert-alarm satt till < 45 000 kr'],
  },
  consultant: {
    insight: 'Du passerade troligen brytpunkten för statlig skatt förra kvartalet. Det finns pengar att spara via tjänstepension.',
    actions: ['Tjänstepensions-optimering beräknad', 'Utdelnings-kalender skapad för rätt kvartal', 'Skatteprognos för nästa 12 månader klar'],
  },
  local: {
    insight: 'Jag identifierar 12 kvitton som saknas i din bokföring — det är potentiellt 4 200 kr i missade avdrag.',
    actions: ['Instant Receipt Matching aktiverat', 'F-skatteavdrag för verktyg förberedda', 'ROT/RUT-modul aktiverad (om tillämpligt)'],
  },
  hustler: {
    insight: 'Din effektiva inkomst från sidoprojektet är 23% lägre än bruttobeloppet efter egenavgifter. Jag visar dig nettot.',
    actions: ['Egenavgiftskalkyl aktiv (28,97%)', 'Separation av privat vs. företagsskatt', 'Minimalistisk vy aktiverad — bara det viktigaste'],
  },
  merchant: {
    insight: 'Jag ser att dina fraktkostnader äter upp 18% av din bruttomarginal. Det finns potential att förbättra ROAS med bättre kostnadsspridning.',
    actions: ['Marginalanalys (COGS) aktiverad per produkt', 'Shopify/Stripe-koppling förberedd', 'Lagervärde vs. Cashflow-widget aktiverad'],
  },
  educator: {
    insight: 'Din MRR-tillväxt är positiv men churnen på månad 3 är högre än snittet. Jag har flaggat detta åt dig.',
    actions: ['MRR Growth-widget aktiverad', 'Substack/Kajabi-logik förberedd', 'Churn-analys inbyggd i prognos'],
  },
  landlord: {
    insight: 'Dina fasta driftskostnader är höga relativt beläggningsgraden. En extra uthyrningsdag per månad täcker din el-kostnad.',
    actions: ['Beläggningsgrad-tracker aktiverad', 'Fastighetsavdrag förberedd (el, underhåll, försäkring)', 'Hyresfaktura-påminnelse schemalagd'],
  },
};

// ─── Step components ─────────────────────────────────────────────────────────

function StepLegalEntity({ onNext }) {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Steg 1 av 5</p>
        <h2 className="text-2xl font-black" style={{ color: '#F0EAD6' }}>Din företagsform</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(155,173,184,0.75)' }}>
          Vi anpassar skatte- och momslogiken efter din bolagsform.
        </p>
      </div>

      <div className="space-y-3">
        {LEGAL_ENTITIES.map(e => {
          const sel = selected === e.id;
          return (
            <motion.button
              key={e.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(e.id)}
              className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all relative"
              style={{
                background: sel ? e.bg : 'rgba(255,255,255,0.04)',
                border: sel ? `2px solid ${e.border.replace('0.4', '0.8')}` : '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: sel ? e.bg : 'rgba(255,255,255,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <e.Icon className="w-7 h-7" style={{ color: e.color }} />
              </div>
              <div className="flex-1">
                <p className="font-black text-base" style={{ color: sel ? e.color : '#F0EAD6' }}>{e.label}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.6)' }}>{e.desc}</p>
              </div>
              {sel && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: e.color }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0D1B2A" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && onNext(selected)}
        className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: selected ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)' : 'rgba(212,175,55,0.15)',
          color: selected ? '#0D1B2A' : 'rgba(212,175,55,0.5)',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
      >
        Fortsätt <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function StepHandshake({ onNext }) {
  const [typing, setTyping] = useState('');
  const fullText = 'Hej! Jag är Anchor. Ge mig 30 sekunder — så bygger jag din personliga ekonomiavdelning.';

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyping(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-8">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.08) 100%)', border: '1.5px solid rgba(212,175,55,0.4)' }}
      >
        <Building2 className="w-12 h-12" style={{ color: '#D4AF37' }} />
      </motion.div>

      <div className="space-y-3 max-w-xs">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Anchor Business</p>
        <div className="min-h-[80px] flex items-center justify-center">
          <h1 className="text-xl font-bold leading-snug" style={{ color: '#F0EAD6' }}>
            {typing}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="inline-block w-0.5 h-5 bg-amber-400 ml-1 align-middle" />
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(155,173,184,0.75)' }}>
          Anchor analyserar din bransch, SNI-kod och transaktionshistorik — och bygger din vy från grunden.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="w-full max-w-xs h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)', color: '#0D1B2A' }}
      >
        Bygg min ekonomiavdelning <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function StepPersona({ onNext }) {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Steg 2 av 5</p>
        <h2 className="text-2xl font-black" style={{ color: '#F0EAD6' }}>Vem är du?</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(155,173,184,0.75)' }}>
          Välj din profil — Anchor anpassar AI:ns fokus direkt.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PERSONAS.map(p => {
          const sel = selected === p.id;
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelected(p.id)}
              className="p-4 rounded-2xl flex flex-col items-start gap-2 text-left transition-all relative"
              style={{
                background: sel ? p.bgAccent : 'rgba(255,255,255,0.04)',
                border: sel ? `2px solid ${p.borderAccent.replace('0.5', '0.8')}` : '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: sel ? p.bgAccent : 'rgba(255,255,255,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <p.Icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight" style={{ color: sel ? p.color : '#F0EAD6' }}>{p.title}</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(155,173,184,0.6)' }}>{p.who}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
                style={{
                  background: sel ? p.bgAccent : 'rgba(255,255,255,0.06)',
                  color: sel ? p.color : 'rgba(155,173,184,0.5)',
                  boxShadow: 'var(--anchor-shadow-1)',
                }}>
                {p.keyMetric}
              </span>
              {sel && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: p.color }}>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#0D1B2A" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && onNext(selected)}
        className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: selected ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)' : 'rgba(212,175,55,0.15)',
          color: selected ? '#0D1B2A' : 'rgba(212,175,55,0.5)',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
      >
        Fortsätt <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function StepPainPoints({ persona, onNext }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const p = PERSONAS.find(x => x.id === persona);

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Steg 3 av 5</p>
        <h2 className="text-2xl font-black" style={{ color: '#F0EAD6' }}>Vad skaver mest?</h2>
        {p && (
          <p className="text-sm mt-1" style={{ color: 'rgba(155,173,184,0.75)' }}>
            Som <span style={{ color: p.color }}>{p.title}</span> — {p.hook.toLowerCase()}.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {PAIN_POINTS.map(pt => {
          const Icon = pt.icon;
          const sel = selected.includes(pt.id);
          return (
            <motion.button
              key={pt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(pt.id)}
              className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all"
              style={{
                background: sel ? pt.bg : 'rgba(255,255,255,0.04)',
                border: sel ? `2px solid ${pt.border.replace('0.4', '0.8')}` : '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: sel ? pt.bg : 'rgba(255,255,255,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <Icon className="w-6 h-6" style={{ color: sel ? pt.color : 'rgba(155,173,184,0.5)' }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base" style={{ color: sel ? pt.color : '#F0EAD6' }}>{pt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(155,173,184,0.65)' }}>{pt.description}</p>
              </div>
              {sel && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: pt.color }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0D1B2A" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => selected.length > 0 && onNext(selected)}
        className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        style={{
          background: selected.length > 0 ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)' : 'rgba(212,175,55,0.15)',
          color: selected.length > 0 ? '#0D1B2A' : 'rgba(212,175,55,0.5)',
          cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Aktivera min setup <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function StepIntegrations({ persona, onNext }) {
  const [selected, setSelected] = useState([]);
  const p = PERSONAS.find(x => x.id === persona);
  const suggested =
    persona === 'local' ? ['fortnox', 'swish'] :
    persona === 'artist' ? ['bokio', 'stripe'] :
    persona === 'merchant' ? ['stripe', 'bokio'] :
    persona === 'educator' ? ['stripe', 'bokio'] :
    persona === 'landlord' ? ['fortnox', 'swish'] :
    ['fortnox', 'stripe'];

  const toggle = (id) => {
    if (id === 'none') { setSelected(['none']); return; }
    setSelected(prev => {
      const without = prev.filter(x => x !== 'none');
      return without.includes(id) ? without.filter(x => x !== id) : [...without, id];
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Steg 4 av 5</p>
        <h2 className="text-2xl font-black" style={{ color: '#F0EAD6' }}>Dina verktyg</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(155,173,184,0.75)' }}>
          {p ? `De flesta ${p.title.toLowerCase()}er använder dessa — koppla dem direkt.` : 'Välj de system du använder.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTEGRATIONS.map(intg => {
          const sel = selected.includes(intg.id);
          const isSuggested = suggested.includes(intg.id);
          return (
            <motion.button
              key={intg.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(intg.id)}
              className="p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all relative"
              style={{
                background: sel ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                border: sel ? '2px solid rgba(212,175,55,0.7)' : '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {isSuggested && !sel && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>Rek</span>
              )}
              {intg.id === 'none'
                ? <Ban className="w-6 h-6 text-slate-400" />
                : <span className="w-6 h-6 rounded-full inline-block" style={{ background: intg.color }} />}
              <span className="text-xs font-bold" style={{ color: sel ? '#D4AF37' : '#F0EAD6' }}>{intg.name}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onNext(selected)}
        className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)', color: '#0D1B2A' }}
      >
        Skapa min profil <Zap className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function StepHoroscope({ persona, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(0);
  const p = PERSONAS.find(x => x.id === persona);
  const h = HOROSCOPE[persona] || HOROSCOPE.consultant;

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      // Reveal action items one by one
      let count = 0;
      const timer = setInterval(() => {
        count++;
        setRevealed(count);
        if (count >= h.actions.length) clearInterval(timer);
      }, 600);
      return () => clearInterval(timer);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-6 py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
          <Loader2 className="w-12 h-12" style={{ color: '#D4AF37' }} />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="font-bold" style={{ color: '#F0EAD6' }}>Analyserar din profil…</p>
          <p className="text-sm" style={{ color: 'rgba(155,173,184,0.7)' }}>Anchor skannar branschkod, transaktionsmönster och förbereder dina avdragskategorier.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Din Financial Horoscope</p>
        <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: '#F0EAD6' }}>
          Välkommen, {p?.title} <HandMetal className="w-6 h-6" style={{ color: '#D4AF37' }} />
        </h2>
      </div>

      {/* Main insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)', border: '1.5px solid rgba(212,175,55,0.4)' }}
      >
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
          <p className="text-sm leading-relaxed font-medium" style={{ color: '#F0EAD6' }}>
            {h.insight}
          </p>
        </div>
      </motion.div>

      {/* Actions prepared */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(155,173,184,0.5)' }}>Redan förberett åt dig</p>
        {h.actions.map((action, i) => (
          <AnimatePresence key={i}>
            {i < revealed && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(61,170,122,0.1)', boxShadow: 'var(--anchor-shadow-1)' }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3DAA7A' }} />
                <p className="text-xs font-medium" style={{ color: '#F0EAD6' }}>{action}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {revealed >= h.actions.length && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)', color: '#0D1B2A' }}
        >
          Öppna min dashboard <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [legalEntity, setLegalEntity] = useState(null);
  const [persona, setPersona] = useState(null);
  const [pains, setPains] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  const handleComplete = async () => {
    ensureOnboardingMode('business');
    localStorage.setItem('anchor_biz_onboarded', 'true');
    localStorage.setItem('anchor_biz_legal_entity', legalEntity || 'enskild');
    localStorage.setItem('anchor_biz_persona', persona);
    localStorage.setItem('anchor_biz_pains', JSON.stringify(pains));
    localStorage.setItem('anchor_biz_integrations', JSON.stringify(integrations));

    try {
      const profiles = await base44.entities.FinancialProfile.list('-updated_date', 1);
      if (profiles[0]?.id) {
        await base44.entities.FinancialProfile.update(profiles[0].id, {
          onboardingCompleted: true,
          businessPersona: persona,
          businessLegalEntity: legalEntity,
          businessPainPoints: pains,
          businessIntegrations: integrations,
        });
      }
    } catch (err) {
      console.warn('Kunde inte spara företagsprofil:', err);
    }

    navigate('/BusinessDashboard', { replace: true });
  };

  const steps = [
    <StepHandshake key="handshake" onNext={() => setStep(1)} />,
    <StepLegalEntity key="legal" onNext={(e) => { setLegalEntity(e); setStep(2); }} />,
    <StepPersona key="persona" onNext={(p) => { setPersona(p); setStep(3); }} />,
    <StepPainPoints key="pain" persona={persona} onNext={(p) => { setPains(p); setStep(4); }} />,
    <StepIntegrations key="integrations" persona={persona} onNext={(i) => { setIntegrations(i); setStep(5); }} />,
    <StepHoroscope key="horoscope" persona={persona} onComplete={handleComplete} />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #080f18 100%)' }}>

      {/* Progress dots */}
      {step > 0 && step < 6 && (
        <div className="fixed top-6 left-0 right-0 flex justify-center gap-2 z-10">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 6 }}
              className="h-1.5 rounded-full"
              style={{ background: i <= step ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <Building2 className="w-4 h-4" style={{ color: '#D4AF37' }} />
        </div>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.7)' }}>Anchor Business</span>
      </div>

      {/* Step content */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const pageSeo = pageSeoFor('BusinessOnboarding');
