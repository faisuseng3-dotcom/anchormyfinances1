import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import QuickGoalStep from '@/components/onboarding/QuickGoalStep';
import QuickDataStep from '@/components/onboarding/QuickDataStep';
import PersonaStep from '@/components/onboarding/PersonaStep';
import { setGuestMode, saveGuestProfile, loadGuestProfile, isGuestMode } from '@/components/guestStorage';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    userGoal: '',
    userGoals: [],
    primaryGoal: '',
    income: 0,
    housingCost: 0,
    buffer: 0,
    totalLoans: 0,
    subscriptions: [],
    loans: [],
    savingsGoal: 0,
    savingsGoalName: '',
    financialGoal: '',
    plannedPurchases: [],
    monthlyExpenses: []
  });

  const handleComplete = async () => {
    setLoading(true);

    // Merge any guest data that was saved locally
    const guestData = loadGuestProfile();
    const mergedData = { ...guestData, ...data, mode: data.mode || 'basic', onboardingCompleted: true };

    // Convert totalLoans number → loans array entry if user entered a total but no detailed loans
    if (mergedData.totalLoans > 0 && (!mergedData.loans || mergedData.loans.length === 0)) {
      mergedData.loans = [{
        name: 'Mitt lån',
        totalAmount: mergedData.totalLoans,
        interestRate: 10,
        monthlyPayment: Math.round(mergedData.totalLoans / 48)
      }];
    }

    // Check if profile exists in DB
    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, mergedData);
    } else {
      await base44.entities.FinancialProfile.create(mergedData);
    }

    // Clear guest mode now that data is in DB
    setGuestMode(false);

    base44.analytics.track({ eventName: 'onboarding_completed', properties: { mode: mergedData.mode, was_guest: !!guestData } });

    navigate(createPageUrl('Pulse'));
  };

  const handleGuest = () => {
    // Save initial empty profile to localStorage and go straight to dashboard
    saveGuestProfile({ ...data, mode: 'basic', onboardingCompleted: true });
    navigate(createPageUrl('Dashboard'));
  };

  const steps = [
    <WelcomeStep
      key="welcome"
      onNext={() => setStep(1)}
      onGuest={handleGuest}
    />,
    <QuickGoalStep
      key="goal"
      data={data}
      onChange={setData}
      onNext={() => setStep(2)}
    />,
    <QuickDataStep
      key="data"
      data={data}
      onChange={setData}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    <PersonaStep
      key="persona"
      data={data}
      onChange={setData}
      onNext={handleComplete}
      onBack={() => setStep(2)}
    />
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }} />
          </div>
          <p className="text-slate-300 text-lg">Skapar din profil...</p>
        </div>
      </div>
    );
  }

  // Progress bar only shown during steps 1-3 (not welcome, not loading)
  const totalSteps = 3;
  const currentProgress = step > 0 ? step : 0;
  const progressPercent = Math.round((currentProgress / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #07090f 0%, #0d1321 50%, #0b1120 100%)' }}>
      {/* Progress bar */}
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-white/10 w-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex justify-between px-6 pt-2 pb-1">
            <span className="text-xs text-slate-500">Steg {currentProgress} av {totalSteps}</span>
            <span className="text-xs text-slate-500">{progressPercent}%</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  );
}