import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, Sparkles } from 'lucide-react';
import OnboardingStep from './OnboardingStep';

const suggestions = [
  { name: 'Semesterfond', amount: 15000 },
  { name: 'Buffert (3 månader)', amount: 45000 },
  { name: 'Kontantinsats bostad', amount: 150000 },
  { name: 'Ny bil', amount: 50000 },
];

export default function SavingsGoalStep({ data, onChange, onNext, onBack }) {
  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const selectSuggestion = (suggestion) => {
    onChange({
      ...data,
      savingsGoalName: suggestion.name,
      savingsGoal: suggestion.amount
    });
  };

  return (
    <OnboardingStep
      step={3}
      totalSteps={5}
      title="Ditt sparmål"
      subtitle="Vad sparar du till? Ett tydligt mål hjälper dig hålla fokus."
    >
      <div className="space-y-6">
        {/* Suggestions */}
        <div>
          <Label className="text-slate-600 text-sm flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Populära sparmål
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  data.savingsGoalName === s.name
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <p className="font-medium text-sm text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{formatNumber(s.amount)} kr</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom goal */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-b from-slate-50 to-white px-2 text-slate-500">eller eget mål</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Namn på sparmål
            </Label>
            <Input
              placeholder="t.ex. Buffert, Semester, Renovering"
              value={data.savingsGoalName || ''}
              onChange={(e) => onChange({ ...data, savingsGoalName: e.target.value })}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Målbelopp</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="50 000"
                value={formatNumber(data.savingsGoal)}
                onChange={(e) => onChange({ ...data, savingsGoal: parseNumber(e.target.value) })}
                className="h-14 text-lg pr-12 rounded-xl border-slate-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
            </div>
          </div>
        </div>

        {/* Progress preview */}
        {data.savingsGoal > 0 && data.buffer > 0 && (
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-emerald-700">Du har redan sparat</span>
              <span className="font-semibold text-emerald-700">
                {Math.round((data.buffer / data.savingsGoal) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.buffer / data.savingsGoal) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              {formatNumber(data.buffer)} kr av {formatNumber(data.savingsGoal)} kr
            </p>
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
          className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          {!data.savingsGoal ? 'Hoppa över' : 'Fortsätt'}
        </Button>
      </div>
    </OnboardingStep>
  );
}