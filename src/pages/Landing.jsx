import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Lock, BarChart2, Smartphone, ChevronRight, Shield } from 'lucide-react';

const valuePoints = [
  {
    icon: BarChart2,
    title: 'Fullständig ekonomisk historik',
    description: 'Din data bevaras kontinuerligt. Följ din ekonomiska utveckling över månader och år med exakta siffror.',
  },
  {
    icon: Lock,
    title: 'Data lagrad inom EU',
    description: 'Alla uppgifter lagras krypterat på servrar i Europa (Frankfurt/Stockholm) i enlighet med GDPR.',
  },
  {
    icon: Smartphone,
    title: 'Tillgänglig på alla enheter',
    description: 'Din data är synkroniserad och tillgänglig oavsett om du använder mobil eller dator.',
  },
];

export default function Landing() {
  const [agreed, setAgreed] = useState(false);

  const handleCTA = () => {
    if (!agreed) return;
    base44.auth.redirectToLogin(`${window.location.origin}/Onboarding`);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: 'var(--color-background-primary)' }}
    >
      {/* Flow indicator */}
      <div className="relative z-10 flex justify-center pt-8 pb-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: 'var(--color-accent)' }}
            >1</div>
            <span style={{ color: 'var(--color-text-primary)' }} className="font-medium">Skapa konto</span>
          </div>
          <div className="w-8 h-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>2</div>
            <span>Dina mål</span>
          </div>
          <div className="w-8 h-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>3</div>
            <span>Din ekonomi</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-10 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/4 text-sm"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)' }}
        >
          <span className="font-semibold tracking-wider" style={{ color: 'var(--color-text-primary)' }}>ANCHOR</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl font-black leading-tight mb-4 max-w-xs"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Din ekonomi i klartext
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm mb-8 max-w-xs leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Registrera dina inkomster, kostnader och lån. Anchor beräknar din ekonomiska marginal, prognos och buffert — utan koppling till din bank.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-xs space-y-3"
        >
          <button
            onClick={handleCTA}
            className="w-full h-14 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: agreed ? 'var(--color-accent)' : 'rgba(75,124,243,0.3)',
              opacity: agreed ? 1 : 0.55,
              cursor: agreed ? 'pointer' : 'not-allowed',
            }}
          >
            Skapa konto med e-post
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>eller</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleCTA}
            className="w-full h-12 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 border transition-opacity"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.12)',
              color: 'var(--color-text-primary)',
              opacity: agreed ? 1 : 0.55,
              cursor: agreed ? 'pointer' : 'not-allowed',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Fortsätt med Google
          </button>

          {/* GDPR Consent */}
          <label className="flex items-start gap-3 cursor-pointer text-left mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded shrink-0"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Jag har läst och godkänner{' '}
              <Link
                to="/TermsOfService"
                className="underline underline-offset-2 hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
                onClick={e => e.stopPropagation()}
              >
                Användarvillkoren
              </Link>
              {' '}och{' '}
              <Link
                to="/PrivacyPolicy"
                className="underline underline-offset-2 hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
                onClick={e => e.stopPropagation()}
              >
                Integritetspolicyn
              </Link>.
            </span>
          </label>

          <div className="flex items-center justify-center gap-1 pt-1">
            <Shield className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              GDPR-kompatibel &nbsp;·&nbsp; Data lagras inom EU &nbsp;·&nbsp; Ingen bankbehörighet krävs
            </p>
          </div>
        </motion.div>
      </section>

      {/* Value Points */}
      <section className="relative z-10 px-6 pb-16 space-y-3 max-w-sm mx-auto w-full">
        <p
          className="text-center text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Om tjänsten
        </p>

        {valuePoints.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
            className="flex items-start gap-4 p-4 rounded-2xl border"
            style={{
              background: 'var(--color-card)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-surface)' }}
            >
              <Icon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 mt-auto pb-10 pt-4 flex justify-center gap-8 text-xs border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
      >
        <Link to="/TermsOfService" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
          Användarvillkor
        </Link>
        <Link to="/PrivacyPolicy" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
          Integritetspolicy
        </Link>
      </footer>
    </div>
  );
}