import { cn } from '@/lib/utils';
import { copilotPrimaryBtnClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';
import { anchorInputLabelClass } from '@/lib/anchorTheme';

export function onboardingChoiceCard(selected) {
  return cn(
    'w-full p-4 rounded-2xl text-left transition-all border',
    selected
      ? 'border-[#6B9FFF]/50 bg-[#6B9FFF]/12'
      : 'border-white/[0.12] bg-white/[0.04] hover:border-white/25',
  );
}

export function onboardingChoiceCheck(selected) {
  return cn(
    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
    selected ? 'border-white bg-white' : 'border-white/25',
  );
}

export const onboardingPrimaryBtn = `${copilotPrimaryBtnClass} !h-14 !rounded-2xl`;

export const onboardingSecondaryBtn = `${copilotSecondaryBtnClass} !h-14 !rounded-2xl`;

export const onboardingBackBtn = `${copilotSecondaryBtnClass} flex-1 !h-14 !rounded-2xl`;

export const onboardingFieldLabel = `${anchorInputLabelClass} flex items-center gap-2`;
