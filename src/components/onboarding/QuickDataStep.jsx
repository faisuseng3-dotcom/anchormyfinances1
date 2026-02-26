import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, Home, PiggyBank, CreditCard, ChevronRight } from 'lucide-react';
import OnboardingStep from './OnboardingStep';

export default function QuickDataStep({ data, onChange, onNext, onBack }) {
  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const isValid = data.income > 0 && data.housingCost >= 0;

  return (
    <OnboardingStep
      step={1}
      totalSteps={2}
      title="Ungefärliga siffror"
      subtitle="Fyll i ungefärliga värden. Du kan justera allt senare."
    >
      <div className="space-y-5">
        {/* Income */}
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-indigo-400" />
            Ungefärlig månadsinkomst (efter skatt)
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="25 000"
              value={formatNumber(data.income)}
              onChange={(e) => onChange({ ...data, income: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
        </div>

        {/* Fixed Costs */}
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-indigo-400" />
            Ungefärliga fasta kostnader per månad
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="12 000"
              value={formatNumber(data.housingCost)}
              onChange={(e) => onChange({ ...data, housingCost: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
          <p className="text-xs text-slate-500">Hyra/boende, el, försäkringar, abonnemang etc.</p>
        </div>

        {/* Optional: Savings */}
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2 text-sm">
            <PiggyBank className="w-4 h-4 text-indigo-400" />
            Nuvarande sparande (valfritt)
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0"
              value={formatNumber(data.buffer)}
              onChange={(e) => onChange({ ...data, buffer: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
        </div>

        {/* Optional: Loans */}
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Eventuella lån (valfritt)
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0"
              value={formatNumber(data.totalLoans || 0)}
              onChange={(e) => onChange({ ...data, totalLoans: parseNumber(e.target.value) })}
              className="h-14 text-lg pr-12 rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>
          <p className="text-xs text-slate-500">Totalt lånebelopp (billån, CSN, privatlån etc.)</p>
        </div>

        {/* Preview */}
        {data.income > 0 && data.housingCost >= 0 && (
          <div className="mt-6 p-4 glass-effect rounded-xl border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ungefär kvar per månad</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(data.income - data.housingCost)} kr
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 rounded-xl"
        >
          Tillbaka
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          Slutför
        </Button>
      </div>
    </OnboardingStep>
  );
}