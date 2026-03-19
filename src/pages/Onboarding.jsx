import React, { useState } from 'react';
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
    navigate(createPageUrl('Pulse'));
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

  const totalSteps = 3;
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #07090f 0%, #0d1321 50%, #0b1120 100%)' }}>
      {/* Progress bar */}
      {(
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
            <span className="text-xs text-slate-500">Steg {step + 1} av {totalSteps}</span>
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