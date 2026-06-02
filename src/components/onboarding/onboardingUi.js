import { cn } from '@/lib/utils';
import {
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
} from '@/lib/anchorTheme';

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

export const onboardingPrimaryBtn = `${anchorPrimaryButtonClass} w-full h-14 rounded-2xl text-[15px]`;

export const onboardingSecondaryBtn = `${anchorSecondaryButtonClass} w-full h-14 rounded-2xl text-[15px]`;

export const onboardingBackBtn = `${anchorSecondaryButtonClass} flex-1 h-14 rounded-2xl text-[15px]`;

export const onboardingFieldLabel = 'text-[13px] font-medium text-white/50 flex items-center gap-2';
