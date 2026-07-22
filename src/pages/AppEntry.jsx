import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, Check, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { useModeContext } from '@/components/modes/ModeContext';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { cn } from '@/lib/utils';

export const pageSeo = pageSeoFor('App');

const MODES = [
  {
    id: 'personal',
    title: 'Lago Personal',
    description: 'Privatbudget, AI-coach, resor och köpcheck',
    icon: User,
    accent: 'var(--color-accent)',
  },
  {
    id: 'business',
    title: 'Lago Business',
    description: 'Likviditet, moms, kvitton och kassaflöde',
    icon: Building2,
    accent: '#D4AF37',
  },
];

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
        className="w-12 h-12 rounded-[var(--anchor-radius-lg)] flex items-center justify-center shrink-0"
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
          className="font-semibold text-base"
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

/** Separat ingång till appen — inte marknadsföringshemsidan. */
export default function AppEntry() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const { setPersonal, setBusiness } = useModeContext();

  const applyMode = () => {
    if (selectedMode === 'business') setBusiness();
    else setPersonal();
  };

  const goLogin = () => {
    if (!selectedMode) return;
    applyMode();
    navigate(createPageUrl('Login'));
  };

  const goSignup = () => {
    if (!selectedMode) return;
    applyMode();
    navigate(createPageUrl('CreateAccount'));
  };

  const isBusiness = selectedMode === 'business';
  const accentColor = isBusiness ? '#D4AF37' : 'var(--color-accent)';

  return (
    <div
      className="h-full anchor-scroll-panel flex flex-col relative overflow-x-hidden anchor-page"
      style={{ background: 'var(--color-background-primary)' }}
    >
      <div className="relative z-10 flex flex-col items-center px-6 pt-10 pb-6 text-center max-w-sm mx-auto w-full flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
          Lago-appen
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">Välj din instans</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Personal och Business är separata miljöer. Välj här innan du loggar in.
        </p>

        <div className="w-full space-y-3 mt-8 mb-6 text-left">
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              selected={selectedMode}
              onSelect={setSelectedMode}
            />
          ))}
        </div>

        <div className="w-full space-y-3">
          {selectedMode ? (
            <>
              <AnchorPressable
                type="button"
                onClick={goLogin}
                className="w-full min-h-14 rounded-[var(--anchor-radius-xl)] font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: isBusiness
                    ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)'
                    : 'var(--color-accent)',
                  color: isBusiness ? '#0D1B2A' : 'white',
                }}
              >
                Logga in
                <ArrowRight className="w-4 h-4" />
              </AnchorPressable>
              <AnchorPressable
                type="button"
                onClick={goSignup}
                className="w-full min-h-12 rounded-[var(--anchor-radius-xl)] font-medium text-sm flex items-center justify-center gap-2 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Skapa konto
              </AnchorPressable>
            </>
          ) : (
            <p className="text-xs text-center text-[var(--color-text-tertiary)]">
              Välj Personal eller Business för att fortsätta
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-4">
            <Shield className="w-3 h-3 text-[var(--color-text-tertiary)]" />
            <p className="text-xs text-[var(--color-text-tertiary)]">
              GDPR · Data inom EU · Ingen bankkoppling
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 pb-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-tertiary)]">
        <Link to={createPageUrl('Landing')} className="hover:text-[var(--color-text-secondary)] no-underline">
          Till hemsidan
        </Link>
        <Link to="/TermsOfService" className="hover:text-[var(--color-text-secondary)] no-underline">
          Villkor
        </Link>
        <Link to="/PrivacyPolicy" className="hover:text-[var(--color-text-secondary)] no-underline">
          Integritet
        </Link>
      </footer>
    </div>
  );
}
