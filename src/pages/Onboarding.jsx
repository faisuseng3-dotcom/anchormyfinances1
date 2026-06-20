// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Home } from 'lucide-react';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import LoansStep from '@/components/onboarding/LoansStep';
import SavingsGoalStep from '@/components/onboarding/SavingsGoalStep';
import SubscriptionsStep from '@/components/onboarding/SubscriptionsStep';
import {
  onboardingPrimaryBtn,
  onboardingBackBtn,
  onboardingFieldLabel,
} from '@/components/onboarding/onboardingUi';
import { anchorInputAmountClass, anchorInputSuffixClass } from '@/lib/anchorTheme';
import { ensureOnboardingMode } from '@/lib/onboardingRouter';
import { fetchOnboardingProfile } from '@/lib/authFlow';
import { computeFreeMoney } from '@/lib/copilotTheme';
import { getMonthlyMargin } from '@/lib/financialUtils';
import { isGuestMode, loadGuestProfile, setGuestMode } from '@/components/guestStorage';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;

function formatNumber(value) {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
}

function parseNumber(value) {
  return parseInt(String(value).replace(/\s/g, ''), 10) || 0;
}

function AmountField({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className={onboardingFieldLabel}>
        <Icon className="w-4 h-4 text-[#6B9FFF]" />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={formatNumber(value)}
          onChange={(e) => onChange(parseNumber(e.target.value))}
          className={`${anchorInputAmountClass} pr-14`}
        />
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
      </div>
    </div>
  );
}

function IncomeStep({ data, onChange, onNext }) {
  return (
    <OnboardingStep
      step={0}
      totalSteps={TOTAL_STEPS}
      title="Inkomst efter skatt"
      subtitle="Vi börjar med det viktigaste — hur mycket landar på kontot varje månad?"
    >
      <AmountField
        icon={Wallet}
        label="Månatlig nettoinkomst"
        placeholder="32 000"
        value={data.income}
        onChange={(v) => onChange({ ...data, income: v })}
      />
      <button
        type="button"
        onClick={onNext}
        disabled={!data.income}
        className={`${onboardingPrimaryBtn} mt-8`}
      >
        Fortsätt
      </button>
    </OnboardingStep>
  );
}

function HousingStep({ data, onChange, onNext, onBack }) {
  return (
    <OnboardingStep
      step={1}
      totalSteps={TOTAL_STEPS}
      title="Boendekostnad"
      subtitle="Hyra, bolån, avgifter — allt som går till boendet varje månad."
    >
      <AmountField
        icon={Home}
        label="Boendekostnad per månad"
        placeholder="9 500"
        value={data.housingCost}
        onChange={(v) => onChange({ ...data, housingCost: v })}
      />
      <div className="flex gap-3 mt-8">
        <button type="button" onClick={onBack} className={onboardingBackBtn}>Tillbaka</button>
        <button type="button" onClick={onNext} className={`${onboardingPrimaryBtn} flex-[2]`}>
          Fortsätt
        </button>
      </div>
    </OnboardingStep>
  );
}

function WowMoment({ amount, onContinue }) {
  const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+4rem)] pb-12 min-h-screen"
    >
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-4">
            Din personliga slutsats
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight">
            Du kan tryggt spendera
          </h1>
        </div>

        <div
          className="w-full rounded-[28px] px-6 py-12"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[68px] sm:text-[80px] font-bold text-white tabular-nums leading-none tracking-tight">
            {fmt(amount)}
            <span className="text-[26px] sm:text-[30px] font-medium text-white/40 ml-2">kr</span>
          </p>
          <p className="text-[14px] text-white/45 mt-4">denna månad</p>
        </div>

        <p className="text-[15px] text-white/50 leading-relaxed">
          Baserat på din inkomst, boende och fasta kostnader — uppdateras automatiskt när du spenderar.
        </p>

        <button type="button" onClick={onContinue} className={onboardingPrimaryBtn}>
          Kom igång
        </button>
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showWow, setShowWow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wowAmount, setWowAmount] = useState(0);
  const [data, setData] = useState(() => ({
    income: 0,
    housingCost: 0,
    buffer: 0,
    loans: [],
    subscriptions: [],
    savingsGoal: 0,
    savingsGoalName: '',
    savingsGoalIcon: 'default',
    savingsGoalVisualType: 'icon',
    savingsGoalImageUrl: null,
    userType: 'privatperson',
    incomeDay: 25,
  }));

  const progressPercent = showWow ? 100 : Math.round(((step + 1) / TOTAL_STEPS) * 100);

  const persistAndShowWow = async () => {
    setLoading(true);
    const guestData = isGuestMode() ? loadGuestProfile() : null;

    const payload = {
      ...(guestData || {}),
      ...data,
      mode: 'basic',
      plan: 'free',
      userType: 'privatperson',
      onboardingCompleted: false,
      economicGoal: 'control',
      economyMood: 'calm',
      primaryGoal: 'control_spending',
      topConcern: 'spending',
      communicationStyle: 'direct',
    };

    try {
      const existing = await fetchOnboardingProfile();
      if (existing?.id) {
        await base44.entities.FinancialProfile.update(existing.id, payload);
      } else if (!isGuestMode()) {
        await base44.entities.FinancialProfile.create(payload);
      }

      const margin = getMonthlyMargin(payload);
      const free = computeFreeMoney(payload, []);
      setWowAmount(free > 0 ? free : Math.max(0, margin * 0.4));
      setGuestMode(false);
      setShowWow(true);
      setLoading(false);

      base44.analytics.track({
        eventName: 'onboarding_data_completed',
        properties: { income: data.income, hasLoans: (data.loans || []).length > 0 },
      });
    } catch (err) {
      console.error(err);
      toast.error('Kunde inte spara profilen. Försök igen.');
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const existing = await fetchOnboardingProfile();
      if (existing?.id) {
        await base44.entities.FinancialProfile.update(existing.id, { onboardingCompleted: true });
      }
      ensureOnboardingMode('personal');
      base44.analytics.track({ eventName: 'onboarding_completed' });
      navigate(createPageUrl('Dashboard'), { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Kunde inte slutföra onboarding. Försök igen.');
      setLoading(false);
    }
  };

  const steps = [
    <IncomeStep
      key="income"
      data={data}
      onChange={setData}
      onNext={() => setStep(1)}
    />,
    <HousingStep
      key="housing"
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
    <SubscriptionsStep
      key="subs"
      data={data}
      onChange={setData}
      onNext={persistAndShowWow}
      onBack={() => setStep(3)}
    />,
  ];

  if (loading && !showWow) {
    return (
      <div className="anchor-page min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs space-y-4">
          <div className="h-3 rounded-full skeleton" />
          <p className="text-center anchor-type-body-sm mt-6">Sparar din profil…</p>
        </div>
      </div>
    );
  }

  if (showWow) {
    return <WowMoment amount={wowAmount} onContinue={finishOnboarding} />;
  }

  return (
    <div className="anchor-page h-full flex flex-col overflow-hidden">
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

      <div className="flex-1 min-h-0 anchor-scroll-panel overflow-x-hidden">
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
}

export const pageSeo = pageSeoFor('Onboarding');
