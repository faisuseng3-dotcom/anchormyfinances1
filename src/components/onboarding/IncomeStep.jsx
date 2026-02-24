import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, Home, PiggyBank } from 'lucide-react';
import OnboardingStep from './OnboardingStep';

export default function IncomeStep({ data, onChange, onNext }) {
  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
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
          <Label className="text-slate-300 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Månatlig nettoinkomst
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="25 000"
              value={formatNumber(data.income)}
              onChange={(e) => onChange({ ...data, income: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-500" />
            Boendekostnad per månad
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="8 000"
              value={formatNumber(data.housingCost)}
              onChange={(e) => onChange({ ...data, housingCost: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-500" />
            Nuvarande buffert / sparande
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="15 000"
              value={formatNumber(data.buffer)}
              onChange={(e) => onChange({ ...data, buffer: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="w-full h-14 mt-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base transition-all"
      >
        Fortsätt
      </Button>
    </OnboardingStep>
  );
}