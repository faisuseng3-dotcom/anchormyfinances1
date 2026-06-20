import React from 'react';
import { Input } from "@/components/ui/input";
import { Wallet, Home, PiggyBank } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { anchorInputAmountClass, anchorInputSuffixClass } from '@/lib/anchorTheme';
import { onboardingFieldLabel } from './onboardingUi';

export default function IncomeStep({ data, onChange, onNext }) {
  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, ''), 10) || 0;
  };

  const isValid = data.income > 0 && data.housingCost >= 0;

  return (
    <OnboardingStep
      step={0}
      totalSteps={5}
      title="Din ekonomiska grund"
      subtitle="Låt oss börja med det viktigaste - din inkomst och dina boendekostnader."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <Wallet className="w-4 h-4 text-[#9FB5FF]" />
            Månatlig nettoinkomst
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="25 000"
              value={formatNumber(data.income)}
              onChange={(e) => onChange({ ...data, income: parseNumber(e.target.value) })}
              className={`${anchorInputAmountClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <Home className="w-4 h-4 text-[#9FB5FF]" />
            Boendekostnad per månad
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="8 000"
              value={formatNumber(data.housingCost)}
              onChange={(e) => onChange({ ...data, housingCost: parseNumber(e.target.value) })}
              className={`${anchorInputAmountClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <PiggyBank className="w-4 h-4 text-[#9FB5FF]" />
            Nuvarande buffert / sparande
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="15 000"
              value={formatNumber(data.buffer)}
              onChange={(e) => onChange({ ...data, buffer: parseNumber(e.target.value) })}
              className={`${anchorInputAmountClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isValid}
        className="anchor-btn anchor-btn--default anchor-btn--pill w-full mt-8 bg-[#22d97a] hover:bg-[#1fc46e] text-[#0a1628] disabled:opacity-50"
      >
        Fortsätt
      </button>
    </OnboardingStep>
  );
}
