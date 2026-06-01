import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { TOP_CONCERNS } from '@/lib/onboardingFocus';

export default function QuickProblemStep({ data, onChange, onNext }) {
  const selected = data.topConcern || '';

  const select = (id) => {
    onChange({ ...data, topConcern: id });
  };

  return (
    <OnboardingStep
      step={0}
      totalSteps={4}
      title="Vad stressar dig mest just nu?"
      subtitle="Vi anpassar Anchor efter ditt största problem — du kan ändra senare."
    >
      <div className="space-y-2.5">
        {TOP_CONCERNS.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              className={`w-full p-4 rounded-2xl text-left transition-all border ${
                isSelected ? 'border-[#7FA0FF] bg-[#7FA0FF]/10' : 'border-white/15 hover:border-white/30'
              }`}
              style={{
                background: isSelected
                  ? undefined
                  : 'linear-gradient(180deg, rgba(17,24,39,0.72), rgba(15,23,42,0.58))',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-medium text-white leading-snug">{item.label}</p>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[#7FA0FF] bg-[#7FA0FF]' : 'border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!selected}
        className="w-full h-14 mt-6 rounded-2xl font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #7FA0FF 0%, #5B7CFA 100%)' }}
      >
        Fortsätt
      </Button>
    </OnboardingStep>
  );
}
