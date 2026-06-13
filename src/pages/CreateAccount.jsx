import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { loadGuestProfile, setGuestMode } from '@/components/guestStorage';
import SignupValueScreen from '@/components/signup/SignupValueScreen';
import SignupPersonaStep from '@/components/signup/SignupPersonaStep';
import SignupConfirmation from '@/components/signup/SignupConfirmation';
import { pageSeoFor } from '@/lib/pageSeo';
import { getOnboardingPath } from '@/lib/onboardingRouter';

export const pageSeo = pageSeoFor('CreateAccount');

export default function CreateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=value, 1=persona, 2=confirm
  const [persona, setPersona] = useState(null);
  const [savedProfile] = useState(() => loadGuestProfile());

  const handlePersonaSelect = async (selectedPersona) => {
    setPersona(selectedPersona);

    // Migrate guest data to DB
    const mergedData = {
      ...savedProfile,
      persona: selectedPersona,
      mode: savedProfile?.mode || 'basic',
      plan: savedProfile?.plan || 'free',
      onboardingCompleted: true,
    };

    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, mergedData);
    } else {
      await base44.entities.FinancialProfile.create(mergedData);
    }

    setGuestMode(false);
    base44.analytics.track({ eventName: 'account_created', properties: { persona: selectedPersona, had_guest_data: !!savedProfile } });
    setStep(2);
  };

  const handleGuest = () => {
    navigate(getOnboardingPath());
  };

  const handleFinish = () => {
    navigate(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <SignupValueScreen
            key="value"
            onContinue={() => setStep(1)}
            onGuest={handleGuest}
          />
        )}
        {step === 1 && (
          <SignupPersonaStep
            key="persona"
            onSelect={handlePersonaSelect}
          />
        )}
        {step === 2 && (
          <SignupConfirmation
            key="confirm"
            profile={savedProfile}
            persona={persona}
            onContinue={handleFinish}
          />
        )}
      </AnimatePresence>
    </div>
  );
}