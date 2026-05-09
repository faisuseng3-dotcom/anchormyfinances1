import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import QuickGoalStep from '@/components/onboarding/QuickGoalStep';
import QuickDataStep from '@/components/onboarding/QuickDataStep';
import PersonaStep from '@/components/onboarding/PersonaStep';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Kolla om användaren redan har en färdig profil — hoppa direkt till Dashboard
  useEffect(() => {
    base44.entities.FinancialProfile.list().then(profiles => {
      if (profiles.length > 0 && profiles[0].onboardingCompleted) {
        navigate(createPageUrl('Dashboard'), { replace: true });
      }
    });
  }, [navigate]);
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

    const mergedData = { ...data, mode: data.mode || 'basic', onboardingCompleted: true };

    if (mergedData.totalLoans > 0 && (!mergedData.loans || mergedData.loans.length === 0)) {
      mergedData.loans = [{
        name: 'Mitt lån',
        totalAmount: mergedData.totalLoans,
        interestRate: 10,
        monthlyPayment: Math.round(mergedData.totalLoans / 48)
      }];
    }

    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, mergedData);
    } else {
      await base44.entities.FinancialProfile.create(mergedData);
    }

    base44.analytics.track({ eventName: 'onboarding_completed', properties: { mode: mergedData.mode } });
    // Award onboarding points
    base44.functions.invoke('awardPoints', { event_type: 'onboarding_complete' })
      .then(res => {
        if (res?.data?.points > 0) {
          import('sonner').then(({ toast }) => {
            toast.success(`+${res.data.points} poäng! Välkommen till Anchor Challenge!`, { duration: 5000 });
          });
        }
      })
      .catch(() => {});
    navigate(createPageUrl('Dashboard'));
  };

  const steps = [
    <QuickGoalStep
      key="goal"
      data={data}
      onChange={setData}
      onNext={() => setStep(1)}
    />,
    <QuickDataStep
      key="data"
      data={data}
      onChange={setData}
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
    />,
    <PersonaStep
      key="persona"
      data={data}
      onChange={setData}
      onNext={handleComplete}
      onBack={() => setStep(1)}
    />
  ];

  const revolutBlue = 'linear-gradient(180deg, #2f5cff 0%, #1846e7 22%, #0a239e 52%, #060f4a 78%, #040814 100%)';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: revolutBlue }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-white/15" />
            <div className="absolute inset-0 rounded-full border-2 border-[#8EA5FF] border-t-transparent animate-spin" style={{ filter: 'drop-shadow(0 0 10px rgba(142, 165, 255, 0.45))' }} />
          </div>
          <p className="text-[#DDE7FF] text-lg">Skapar din profil...</p>
        </div>
      </div>
    );
  }

  const totalSteps = 3;
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: revolutBlue }}>
      {/* Progress bar */}
      {(
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-white/15 w-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #b6c7ff, #7ca0ff)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex justify-between px-5 sm:px-6 pt-2 pb-1">
            <span className="text-xs text-white/70">Steg {step + 1} av {totalSteps}</span>
            <span className="text-xs text-white/70">{progressPercent}%</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  );
}