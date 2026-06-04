import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import QuickProblemStep from '@/components/onboarding/QuickProblemStep';
import QuickGoalStep from '@/components/onboarding/QuickGoalStep';
import QuickDataStep from '@/components/onboarding/QuickDataStep';
import PersonaStep from '@/components/onboarding/PersonaStep';
import SwedishBasicsFoundationStep from '@/components/onboarding/SwedishBasicsFoundationStep';
import { applyConcernToProfile, getPostOnboardingAction } from '@/lib/onboardingFocus';
import { rowsToTransactions } from '@/lib/bankImportHelpers';
import { isFoundationTestMode } from '@/lib/foundationTestMode';
import { toast } from 'sonner';

const FOUNDATIONS_STEP = 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testFoundations = isFoundationTestMode(searchParams);
  const [step, setStep] = useState(testFoundations ? FOUNDATIONS_STEP : 0);

  useEffect(() => {
    if (testFoundations) return;
    base44.entities.FinancialProfile.list().then((profiles) => {
      if (profiles.length > 0 && profiles[0].onboardingCompleted) {
        navigate(createPageUrl('Dashboard'), { replace: true });
      }
    });
  }, [navigate, testFoundations]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    userGoal: '',
    userGoals: [],
    primaryGoal: '',
    topConcern: '',
    city: '',
    communicationStyle: 'balanced',
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
    monthlyExpenses: [],
    pendingImportRows: [],
    foundationsCompleted: [],
  });

  const handleComplete = async () => {
    setLoading(true);

    const mergedData = applyConcernToProfile(
      { ...data, mode: data.mode || 'smart', onboardingCompleted: true },
      data.topConcern,
    );
    const { pendingImportRows = [], totalLoans, ...profilePayload } = mergedData;

    if (profilePayload.foundationsCompleted?.includes('school_gap')) {
      profilePayload.academyCompleted = [
        ...new Set([...(profilePayload.academyCompleted || []), 'swedish_economy_basics']),
      ];
    }

    if (totalLoans > 0 && (!profilePayload.loans || profilePayload.loans.length === 0)) {
      profilePayload.loans = [{
        name: 'Mitt lån',
        totalAmount: totalLoans,
        interestRate: 10,
        monthlyPayment: Math.round(totalLoans / 48),
      }];
    }

    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, profilePayload);
    } else {
      await base44.entities.FinancialProfile.create(profilePayload);
    }

    if (pendingImportRows.length) {
      await base44.entities.Transaction.bulkCreate(rowsToTransactions(pendingImportRows));
    }

    base44.analytics.track({ eventName: 'onboarding_completed', properties: { mode: profilePayload.mode } });
    base44.functions.invoke('awardPoints', { event_type: 'onboarding_complete' })
      .then((res) => {
        if (res?.data?.points > 0) {
          import('sonner').then(({ toast }) => {
            toast.success(`+${res.data.points} poäng! Välkommen till Anchor.`, { duration: 5000 });
          });
        }
      })
      .catch(() => {});

    navigate(createPageUrl('Dashboard'), {
      state: { anchorAction: getPostOnboardingAction(data.topConcern) },
    });
  };

  const handleFoundationsTestExit = async () => {
    if (!data.foundationsCompleted?.includes('school_gap')) {
      toast.message('Avbrutet — inget sparat (kräv godkänt quiz först).');
      navigate(createPageUrl('Dashboard'));
      return;
    }
    setLoading(true);
    try {
      const profiles = await base44.entities.FinancialProfile.list();
      if (profiles.length > 0) {
        const p = profiles[0];
        await base44.entities.FinancialProfile.update(p.id, {
          foundationsCompleted: [...new Set([...(p.foundationsCompleted || []), 'school_gap'])],
          academyCompleted: [
            ...new Set([...(p.academyCompleted || []), 'swedish_economy_basics']),
          ],
        });
      }
      toast.success('Grundkurs sparad på profilen (testläge).');
    } catch {
      toast.error('Kunde inte spara — försök igen.');
    } finally {
      setLoading(false);
      navigate(createPageUrl('Dashboard'));
    }
  };

  const steps = [
    <QuickProblemStep key="problem" data={data} onChange={setData} onNext={() => setStep(1)} />,
    <QuickGoalStep key="goal" data={data} onChange={setData} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <QuickDataStep key="data" data={data} onChange={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    <SwedishBasicsFoundationStep
      key="swedish-basics"
      data={data}
      onChange={setData}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />,
    <PersonaStep key="persona" data={data} onChange={setData} onNext={handleComplete} onBack={() => setStep(3)} />,
  ];

  const totalSteps = testFoundations ? 1 : 5;
  const progressPercent = testFoundations
    ? 100
    : Math.round(((step + 1) / totalSteps) * 100);

  if (loading) {
    return (
      <div className="anchor-page min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/15" />
            <div className="absolute inset-0 rounded-full border-2 border-[#9FB5FF] border-t-transparent animate-spin" />
          </div>
          <p className="text-[17px] font-medium text-white">Skapar din profil…</p>
          <p className="text-[14px] text-white/45 mt-2">Ett ögonblick</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anchor-page min-h-screen flex flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-white/90"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between px-5 sm:px-6 py-2.5 bg-[#040814]/80 backdrop-blur-md border-b border-white/[0.06]">
          <span className="text-[13px] text-white/50">
            {testFoundations ? 'Test — grundkurs' : `Steg ${step + 1} av ${totalSteps}`}
          </span>
          <span className="text-[13px] text-white/50 tabular-nums">{progressPercent}%</span>
        </div>
      </div>

      {testFoundations && (
        <div className="mt-[calc(env(safe-area-inset-top)+3.25rem)] px-5 sm:px-6 pt-3">
          <div className="max-w-md mx-auto rounded-xl px-4 py-3 bg-amber-500/15 ring-1 ring-amber-400/30 text-[13px] text-amber-100/90 leading-relaxed">
            <strong className="font-semibold text-amber-50">Testläge.</strong> Du hoppar direkt till
            quizet. Efter godkänt sparas bara grundkursen — övrig onboarding ändras inte.{' '}
            <Link to={createPageUrl('Dashboard')} className="underline text-amber-50/90">
              Avbryt
            </Link>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
    </div>
  );
}
