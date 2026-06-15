import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, PiggyBank } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import GoalVisualPicker from '@/components/goals/GoalVisualPicker';
import { validateSavingsGoal } from '@/lib/savingsGoalValidation';

const suggestions = [
  { name: 'Semester i Thailand', amount: 25000, iconId: 'travel' },
  { name: 'Kontantinsats bostad', amount: 150000, iconId: 'home' },
  { name: 'Min första bil', amount: 50000, iconId: 'transport' },
  { name: 'Buffert (3 månader)', amount: 45000, iconId: 'buffer' },
];

export default function SavingsGoalStep({ data, onChange, onNext, onBack }) {
  const [error, setError] = useState(null);

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const selectSuggestion = (suggestion) => {
    setError(null);
    onChange({
      ...data,
      savingsGoalName: suggestion.name,
      savingsGoal: suggestion.amount,
      savingsGoalIcon: suggestion.iconId,
      savingsGoalVisualType: 'icon',
      savingsGoalImageUrl: null,
    });
  };

  const handleVisualChange = ({ imageUrl, iconId, visualType }) => {
    setError(null);
    onChange({
      ...data,
      savingsGoalImageUrl: imageUrl,
      savingsGoalIcon: iconId,
      savingsGoalVisualType: visualType,
    });
  };

  const handleNext = () => {
    if (!data.savingsGoal) {
      onNext();
      return;
    }
    const v = validateSavingsGoal({
      name: data.savingsGoalName,
      amount: data.savingsGoal,
      imageUrl: data.savingsGoalVisualType === 'image' ? data.savingsGoalImageUrl : null,
      iconId: data.savingsGoalIcon,
      visualType: data.savingsGoalVisualType,
    });
    if (!v.ok) {
      setError(v.errors[0]);
      return;
    }
    onNext();
  };

  const previewPct = data.savingsGoal > 0 && data.buffer > 0
    ? Math.min(100, (data.buffer / data.savingsGoal) * 100)
    : 10;

  return (
    <OnboardingStep
      step={3}
      totalSteps={5}
      title="Ditt sparmål"
      subtitle="Se din dröm — ett tydligt mål med bild triggar ditt framtida jag."
    >
      <div className="space-y-6">
        <div>
          <Label className="text-slate-300 text-sm flex items-center gap-2 mb-3">
            <PiggyBank className="w-4 h-4 text-amber-500" />
            Populära sparmål
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => selectSuggestion(s)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  data.savingsGoalName === s.name
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 hover:border-emerald-500/30 dark-card'
                }`}
              >
                <p className="font-medium text-sm text-white">{s.name}</p>
                <p className="text-xs text-slate-400">{formatNumber(s.amount)} kr</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0B0F1A] px-2 text-slate-400">eller eget mål</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Namn på sparmål
            </Label>
            <Input
              placeholder="t.ex. Thailand-resa, Min första bil"
              value={data.savingsGoalName || ''}
              onChange={(e) => { onChange({ ...data, savingsGoalName: e.target.value }); setError(null); }}
              className="h-12 rounded-2xl-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Målbelopp</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="50 000"
                value={formatNumber(data.savingsGoal)}
                onChange={(e) => { onChange({ ...data, savingsGoal: parseNumber(e.target.value) }); setError(null); }}
                className="h-14 text-lg pr-12 rounded-2xl-slate-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
            </div>
          </div>

          {data.savingsGoal > 0 && (
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Bild eller symbol (obligatoriskt)</Label>
              <GoalVisualPicker
                imageUrl={data.savingsGoalImageUrl}
                iconId={data.savingsGoalIcon || 'default'}
                visualType={data.savingsGoalVisualType}
                previewPct={previewPct}
                onChange={handleVisualChange}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-rose-400 font-medium">{error}</p>
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
          onClick={handleNext}
          className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          {!data.savingsGoal ? 'Hoppa över' : 'Fortsätt'}
        </Button>
      </div>
    </OnboardingStep>
  );
}
