import React from 'react';
import { Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { TOP_CONCERNS } from '@/lib/onboardingFocus';
import {
  onboardingChoiceCard,
  onboardingChoiceCheck,
  onboardingPrimaryBtn,
} from './onboardingUi';

export default function QuickProblemStep({ data, onChange, onNext }) {
  const selected = data.topConcern || '';

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
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...data, topConcern: item.id })}
              className={onboardingChoiceCard(isSelected)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#9FB5FF]" />
                </div>
                <p className="text-[15px] font-medium text-white leading-snug flex-1 text-left">
                  {item.label}
                </p>
                <div className={onboardingChoiceCheck(isSelected)}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onNext} disabled={!selected} className={`${onboardingPrimaryBtn} mt-6`}>
        Fortsätt
      </button>
    </OnboardingStep>
  );
}
