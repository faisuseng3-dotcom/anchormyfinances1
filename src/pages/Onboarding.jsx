import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import IncomeStep from '@/components/onboarding/IncomeStep';
import SubscriptionsStep from '@/components/onboarding/SubscriptionsStep';
import LoansStep from '@/components/onboarding/LoansStep';
import SavingsGoalStep from '@/components/onboarding/SavingsGoalStep';
import GoalStep from '@/components/onboarding/GoalStep';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    income: 0,
    housingCost: 0,
    buffer: 0,
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
    
    // Check if profile exists
    const profiles = await base44.entities.FinancialProfile.list();
    
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, {
        ...data,
        onboardingCompleted: true
      });
    } else {
      await base44.entities.FinancialProfile.create({
        ...data,
        onboardingCompleted: true
      });
    }
    
    navigate(createPageUrl('Dashboard'));
  };

  const steps = [
    <IncomeStep
      key="income"
      data={data}
      onChange={setData}
      onNext={() => setStep(1)}
    />,
    <SubscriptionsStep
      key="subscriptions"
      data={data}
      onChange={setData}
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
    />,
    <LoansStep
      key="loans"
      data={data}
      onChange={setData}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    <SavingsGoalStep
      key="savings"
      data={data}
      onChange={setData}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />,
    <GoalStep
      key="goal"
      data={data}
      onChange={setData}
      onNext={handleComplete}
      onBack={() => setStep(3)}
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

  return (
    <AnimatePresence mode="wait">
      {steps[step]}
    </AnimatePresence>
  );
}