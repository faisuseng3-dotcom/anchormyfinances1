import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, PiggyBank } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import GoalVisualPicker from '@/components/goals/GoalVisualPicker';
import { validateSavingsGoal } from '@/lib/savingsGoalValidation';
import { anchorInputAmountClass, anchorInputClass, anchorInputSuffixClass } from '@/lib/anchorTheme';
import { onboardingFieldLabel } from './onboardingUi';
import { useCountUp } from '@/hooks/useCountUp';

const MONTH_LABELS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function estimateMonthsToGoal(data) {
  const margin = Math.max(
    0,
    (data.income || 0) - (data.housingCost || 0) -
      (data.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0),
  );
  const suggestedMonthly = Math.max(500, Math.round(margin * 0.3));
  const goal = data.savingsGoal || 0;
  if (!goal || suggestedMonthly <= 0) return null;
  return { months: Math.ceil(goal / suggestedMonthly), suggestedMonthly };
}

const suggestions = [
  { name: 'Semester i Thailand', amount: 25000, iconId: 'travel' },
  { name: 'Kontantinsats bostad', amount: 150000, iconId: 'home' },
  { name: 'Min första bil', amount: 50000, iconId: 'transport' },
  { name: 'Buffert (3 månader)', amount: 45000, iconId: 'buffer' },
];

export default function SavingsGoalStep({ data, onChange, onNext, onBack }) {
  const [error, setError] = useState(null);
  const estimate = estimateMonthsToGoal(data);
  const displayedMonths = useCountUp(estimate?.months ?? 0, 700);

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
          <label className="text-[var(--color-text-secondary)] text-sm flex items-center gap-2 mb-3">
            <PiggyBank className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            Populära sparmål
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => selectSuggestion(s)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  data.savingsGoalName === s.name
                    ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/30 dark-card'
                }`}
              >
                <p className="font-medium text-sm text-[var(--color-text-primary)]">{s.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{formatNumber(s.amount)} kr</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--color-background-primary)] px-2 text-[var(--color-text-muted)]">eller eget mål</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className={onboardingFieldLabel}>
              <Target className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              Namn på sparmål
            </label>
            <Input
              placeholder="t.ex. Thailand-resa, Min första bil"
              value={data.savingsGoalName || ''}
              onChange={(e) => { onChange({ ...data, savingsGoalName: e.target.value }); setError(null); }}
              className={anchorInputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={onboardingFieldLabel}>Målbelopp</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="50 000"
                value={formatNumber(data.savingsGoal)}
                onChange={(e) => { onChange({ ...data, savingsGoal: parseNumber(e.target.value) }); setError(null); }}
                className={`${anchorInputAmountClass} pr-12`}
              />
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
            </div>
          </div>

          {estimate && (
            <div className="text-center py-2 relative">
              <div
                className="absolute inset-0 m-auto w-40 h-20 rounded-full opacity-70 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, var(--color-accent-soft), transparent 70%)', filter: 'blur(8px)' }}
                aria-hidden="true"
              />
              <p className="relative text-[32px] font-black text-[var(--color-text-primary)] tabular-nums leading-none">
                {displayedMonths} <span className="text-[18px] font-bold text-[var(--color-text-secondary)]">mån</span>
              </p>
              <p className="relative text-[12px] text-[var(--color-text-muted)] mt-2">
                Ungefär {(() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + (estimate.months || 0));
                  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
                })()} — räknat på {formatNumber(estimate.suggestedMonthly)} kr/mån
              </p>
            </div>
          )}

          {data.savingsGoal > 0 && (
            <div>
              <label className={`${onboardingFieldLabel} mb-2 block`}>Bild eller symbol (obligatoriskt)</label>
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
          className="flex-1 h-14 rounded-xl"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          {!data.savingsGoal ? 'Hoppa över' : 'Fortsätt'}
        </Button>
      </div>
    </OnboardingStep>
  );
}
