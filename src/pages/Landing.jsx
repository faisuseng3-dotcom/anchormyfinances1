import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lock, BarChart2, Smartphone, Shield, User, Building2, ArrowRight, Check } from 'lucide-react';
import { useModeContext } from '@/components/modes/ModeContext';
import { pageSeoFor } from '@/lib/pageSeo';
import { dashLabel } from '@/lib/dashboardTheme';
import { pageEnter, staggerItem } from '@/lib/motionPresets';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { cn } from '@/lib/utils';

export const pageSeo = pageSeoFor('Landing');

const MotionLink = motion.create(Link);

const linkTap = {
  whileTap: { scale: 0.96, opacity: 0.72 },
  transition: { duration: 0.12, ease: 'easeOut' },
};

const STEPS = ['Välj instans', 'Logga in', 'Din ekonomi'];

const valuePoints = [
  {
    icon: BarChart2,
    title: 'Fullständig ekonomisk historik',
    description:
      'Din data bevaras kontinuerligt. Följ din ekonomiska utveckling över månader och år med exakta siffror.',
  },
  {
    icon: Lock,
    title: 'Data lagrad inom EU',
    description:
      'Alla uppgifter lagras krypterat på servrar i Europa (Frankfurt/Stockholm) i enlighet med GDPR.',
  },
  {
    icon: Smartphone,
    title: 'Tillgänglig på alla enheter',
    description: 'Din data är synkroniserad och tillgänglig oavsett om du använder mobil eller dator.',
  },
];

const MODES = [
  {
    id: 'personal',
    title: 'Anchor Personal',
    description: 'Privatbudget, signaler och verktyg',
    icon: User,
    accent: 'var(--color-accent)',
  },
  {
    id: 'business',
    title: 'Anchor Business',
    description: 'Likviditet, moms, fakturor & kassaflöde',
    icon: Building2,
    accent: '#D4AF37',
  },
];

function StepIndicator({ accentColor }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && <div className="w-8 h-px bg-white/15" />}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                i === 0 ? 'text-white' : 'bg-white/10 text-[var(--color-text-tertiary)]',
              )}
              style={i === 0 ? { background: accentColor } : undefined}
            >
              {i + 1}
            </div>
            <span className={i === 0 ? 'font-medium text-[var(--color-text-primary)]' : undefined}>
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function ModeCard({ mode, selected, onSelect }) {
  const isSelected = selected === mode.id;
  const Icon = mode.icon;

  return (
    <AnchorPressable
      type="button"
      onClick={() => onSelect(mode.id)}
      className={cn(
        'w-full rounded-[var(--anchor-radius-xl)] p-4 flex items-center gap-4 text-left',
        isSelected ? 'anchor-elev-3' : 'anchor-elev-2',
      )}
      style={{
        background: isSelected
          ? `color-mix(in srgb, ${mode.accent} 16%, var(--color-surface-raised))`
          : 'var(--color-surface-raised)',
        boxShadow: isSelected
          ? `0 0 0 2px ${mode.accent}, var(--anchor-shadow-2)`
          : 'var(--anchor-shadow-1)',
      }}
    >
      <div
        className="w-12 h-12 rounded-[var(--anchor-radius-lg)] flex items-center justify-center shrink-0 anchor-elev-1"
        style={{
          background: isSelected
            ? `color-mix(in srgb, ${mode.accent} 22%, transparent)`
            : 'rgba(255, 255, 255, 0.06)',
          border: `1px solid color-mix(in srgb, ${mode.accent} 30%, transparent)`,
        }}
      >
        <Icon
          className="w-6 h-6"
          style={{ color: isSelected ? mode.accent : 'var(--color-text-tertiary)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="anchor-wordmark text-base"
          style={{ color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
        >
          {mode.title}
        </p>
        <p className="text-xs mt-0.5 text-[var(--color-text-tertiary)]">{mode.description}</p>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: mode.accent }}
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </AnchorPressable>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const { setPersonal, setBusiness } = useModeContext();

  const handleCTA = () => {
    if (!agreed || !selectedMode) return;
    if (selectedMode === 'business') {
      setBusiness();
    } else {
      setPersonal();
    }
    navigate(createPageUrl('CreateAccount'));
  };

  const isBusiness = selectedMode === 'business';
  const accentColor = isBusiness ? '#D4AF37' : 'var(--color-accent)';
  const bgGradient = isBusiness
    ? 'linear-gradient(135deg, #0D1B2A 0%, #0a1520 100%)'
    : 'var(--color-background-primary)';

  return (
    <motion.div
      animate={{ background: bgGradient }}
      transition={{ duration: 0.5 }}
      className="h-full anchor-scroll-panel flex flex-col relative overflow-x-hidden anchor-page"
      style={{ background: bgGradient }}
      {...pageEnter}
    >
      <div className="relative z-10 flex justify-center pt-8 pb-2 px-6">
        <StepIndicator accentColor={accentColor} />
      </div>

      <section className="relative z-10 flex flex-col items-center px-6 pt-6 pb-6 text-center max-w-sm mx-auto w-full">
        <motion.div {...staggerItem(0)} className="w-full mb-8 text-left">
          <p className={dashLabel}>Välkommen</p>
          <h1 className="anchor-type-display mt-1">Välj din instans</h1>
          <p className="anchor-type-body-sm mt-3">
            Personal och Business är separata miljöer. Välj instans här vid inloggning — för att byta
            måste du logga ut och välja igen.
          </p>
        </motion.div>

        <motion.div {...staggerItem(1)} className="w-full space-y-3 mb-6">
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              selected={selectedMode}
              onSelect={setSelectedMode}
            />
          ))}
        </motion.div>

        <motion.div {...staggerItem(2)} className="w-full space-y-3">
          <AnimatePresence>
            {selectedMode && (
              <motion.div
                key="login-buttons"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <AnchorPressable
                  type="button"
                  onClick={handleCTA}
                  disabled={!agreed}
                  className={cn(
                    'w-full min-h-14 rounded-[var(--anchor-radius-xl)] font-semibold text-sm flex items-center justify-center gap-2 anchor-elev-2',
                    !agreed && 'opacity-55 cursor-not-allowed',
                  )}
                  style={{
                    background: agreed
                      ? isBusiness
                        ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)'
                        : 'var(--color-accent)'
                      : isBusiness
                        ? 'rgba(212, 175, 55, 0.3)'
                        : 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                    color: isBusiness ? '#0D1B2A' : 'white',
                  }}
                >
                  Logga in med {isBusiness ? 'Business' : 'Personal'}
                  <ArrowRight className="w-4 h-4" />
                </AnchorPressable>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-[var(--color-text-tertiary)]">eller</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <AnchorPressable
                  type="button"
                  onClick={handleCTA}
                  disabled={!agreed}
                  className={cn(
                    'w-full min-h-12 rounded-[var(--anchor-radius-xl)] font-medium text-sm flex items-center justify-center gap-2 border anchor-elev-1',
                    !agreed && 'opacity-55 cursor-not-allowed',
                  )}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Fortsätt med Google
                </AnchorPressable>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedMode && (
            <p className="text-xs text-center text-[var(--color-text-tertiary)]">
              Välj en instans ovan för att fortsätta
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer text-left mt-1 min-h-12">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded shrink-0"
              style={{ accentColor }}
            />
            <span className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              Jag har läst och godkänner{' '}
              <Link
                to="/TermsOfService"
                className="underline underline-offset-2 hover:opacity-80"
                style={{ color: accentColor }}
                onClick={(e) => e.stopPropagation()}
              >
                Användarvillkoren
              </Link>{' '}
              och{' '}
              <Link
                to="/PrivacyPolicy"
                className="underline underline-offset-2 hover:opacity-80"
                style={{ color: accentColor }}
                onClick={(e) => e.stopPropagation()}
              >
                Integritetspolicyn
              </Link>
              .
            </span>
          </label>

          <div className="flex items-center justify-center gap-1 pt-1">
            <Shield className="w-3 h-3 text-[var(--color-text-tertiary)]" />
            <p className="text-xs text-[var(--color-text-tertiary)]">
              GDPR-kompatibel · Data lagras inom EU · Ingen bankbehörighet krävs
            </p>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 pb-16 space-y-3 max-w-sm mx-auto w-full">
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-6 text-[var(--color-text-tertiary)]">
          Om tjänsten
        </p>
        {valuePoints.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            className="flex items-start gap-4 p-4 rounded-[var(--anchor-radius-xl)] border anchor-elev-2"
            style={{
              background: 'var(--color-surface-raised)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
            {...staggerItem(3 + i)}
          >
            <div className="w-10 h-10 rounded-[var(--anchor-radius-md)] flex items-center justify-center shrink-0 bg-white/[0.06] anchor-elev-1">
              <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1 text-[var(--color-text-primary)]">{title}</p>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <footer
        className="relative z-10 mt-auto pb-10 pt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs mt-2 pt-2 text-[var(--color-text-tertiary)]"
      >
        {[
          { to: '/Login', label: 'Logga in' },
          { to: '/CreateAccount', label: 'Skapa konto' },
          { to: '/Pricing', label: 'Priser' },
          { to: '/TermsOfService', label: 'Användarvillkor' },
          { to: '/PrivacyPolicy', label: 'Integritetspolicy' },
        ].map(({ to, label }) => (
          <MotionLink
            key={to}
            to={to}
            className="hover:text-[var(--color-text-secondary)] no-underline touch-manipulation"
            {...linkTap}
          >
            {label}
          </MotionLink>
        ))}
      </footer>
    </motion.div>
  );
}
