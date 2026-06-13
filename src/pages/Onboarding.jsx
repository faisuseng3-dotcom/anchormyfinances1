// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import {
  onboardingChoiceCard,
  onboardingChoiceCheck,
  onboardingPrimaryBtn,
  onboardingBackBtn,
} from '@/components/onboarding/onboardingUi';
import {
  USER_TYPES,
  ECONOMIC_GOALS,
  ECONOMY_MOODS,
  buildProfileFromWizard,
  isBusinessUserType,
} from '@/lib/onboardingWizard';
import { ensureOnboardingMode, isBusinessMode } from '@/lib/onboardingRouter';
import { fetchOnboardingProfile } from '@/lib/authFlow';
import { getPostOnboardingAction } from '@/lib/onboardingFocus';
import { isGuestMode, loadGuestProfile, setGuestMode } from '@/components/guestStorage';
import { toast } from 'sonner';

const TOTAL_STEPS = 3;

function ChoiceStep({ title, subtitle, options, selected, onSelect, onNext, onBack, step }) {
  return (
    <OnboardingStep title={title} subtitle={subtitle} step={step} totalSteps={TOTAL_STEPS}>
      <div className="space-y-2.5">
        {options.map((item) => {
          const isSelected = selected === item.id;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={onboardingChoiceCard(isSelected)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#9FB5FF]" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[15px] font-medium text-white leading-snug">{item.label}</p>
                  {item.description && (
                    <p className="text-[13px] text-white/45 mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className={onboardingChoiceCheck(isSelected)}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`flex gap-3 ${step > 0 ? 'mt-6' : 'mt-6'}`}>
        {step > 0 && (
          <button type="button" onClick={onBack} className={onboardingBackBtn}>
            Tillbaka
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={`${onboardingPrimaryBtn} ${step > 0 ? 'flex-[2]' : 'w-full'}`}
        >
          Fortsätt
        </button>
      </div>
    </OnboardingStep>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState(() => ({
    userType: isBusinessMode() ? 'foretagare' : '',
    economicGoal: '',
    economyMood: '',
  }));

  const progressPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  const persistAndFinish = async () => {
    setLoading(true);
    const wizardPatch = buildProfileFromWizard(answers);
    const guestData = isGuestMode() ? loadGuestProfile() : null;

    const payload = {
      ...(guestData || {}),
      ...wizardPatch,
      mode: 'basic',
      plan: 'free',
      income: guestData?.income ?? 0,
      onboardingCompleted: !isBusinessUserType(answers.userType),
    };

    try {
      const existing = await fetchOnboardingProfile();
      if (existing?.id) {
        await base44.entities.FinancialProfile.update(existing.id, payload);
      } else if (!isGuestMode()) {
        await base44.entities.FinancialProfile.create(payload);
      }

      setGuestMode(false);
      base44.analytics.track({
        eventName: 'onboarding_completed',
        properties: {
          userType: answers.userType,
          economicGoal: answers.economicGoal,
          economyMood: answers.economyMood,
        },
      });

      if (isBusinessUserType(answers.userType)) {
        ensureOnboardingMode('business');
        navigate('/BusinessOnboarding', { replace: true });
        return;
      }

      ensureOnboardingMode('personal');
      navigate(createPageUrl('Dashboard'), {
        replace: true,
        state: { anchorAction: getPostOnboardingAction(payload.topConcern) },
      });
    } catch (err) {
      console.error(err);
      toast.error('Kunde inte spara profilen. Försök igen.');
      setLoading(false);
    }
  };

  const steps = [
    <ChoiceStep
      key="who"
      step={0}
      title="Vem är du?"
      subtitle="Vi anpassar Anchor efter din situation — du kan ändra senare."
      options={USER_TYPES}
      selected={answers.userType}
      onSelect={(id) => setAnswers((a) => ({ ...a, userType: id }))}
      onNext={() => setStep(1)}
      onBack={() => setStep(0)}
    />,
    <ChoiceStep
      key="goal"
      step={1}
      title="Vad är ditt största ekonomiska mål?"
      subtitle="AI-coachen och dashboarden prioriterar det du väljer här."
      options={ECONOMIC_GOALS}
      selected={answers.economicGoal}
      onSelect={(id) => setAnswers((a) => ({ ...a, economicGoal: id }))}
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
    />,
    <ChoiceStep
      key="mood"
      step={2}
      title="Hur känns ekonomin just nu?"
      subtitle="Vi matchar tonen i råd och påminnelser efter ditt humör."
      options={ECONOMY_MOODS}
      selected={answers.economyMood}
      onSelect={(id) => setAnswers((a) => ({ ...a, economyMood: id }))}
      onNext={persistAndFinish}
      onBack={() => setStep(1)}
    />,
  ];

  if (loading) {
    return (
      <div className="anchor-page min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs space-y-4">
          <div className="h-3 rounded-full skeleton" />
          <div className="h-24 rounded-[var(--anchor-radius-lg)] skeleton" />
          <p className="text-center anchor-type-body-sm mt-6">Sparar din profil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anchor-page min-h-screen flex flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] anchor-onboarding-progress">
        <div className="anchor-onboarding-bar">
          <motion.div
            className="anchor-onboarding-bar-fill"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="flex justify-between px-5 sm:px-6 py-3">
          <span className="anchor-type-body-sm text-white/45">
            Kom igång · steg {step + 1} av {TOTAL_STEPS}
          </span>
          <span className="anchor-type-body-sm text-white/45 tabular-nums">{progressPercent}%</span>
        </div>
      </div>

      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
    </div>
  );
}

export const pageSeo = pageSeoFor('Onboarding');
