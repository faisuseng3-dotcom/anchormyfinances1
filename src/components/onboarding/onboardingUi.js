import { cn } from '@/lib/utils';
import { copilotPrimaryBtnClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';
import { anchorInputLabelClass } from '@/lib/anchorTheme';

export function onboardingChoiceCard(selected) {
  return cn(
    'w-full p-4 rounded-2xl text-left transition-all border',
    selected
      ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/12'
      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/30',
  );
}

export function onboardingChoiceCheck(selected) {
  return cn(
    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
    selected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]',
  );
}

export const onboardingPrimaryBtn = `${copilotPrimaryBtnClass} !h-14 !rounded-2xl`;

export const onboardingSecondaryBtn = `${copilotSecondaryBtnClass} !h-14 !rounded-2xl`;

export const onboardingBackBtn = `${copilotSecondaryBtnClass} flex-1 !h-14 !rounded-2xl`;

export const onboardingFieldLabel = `${anchorInputLabelClass} flex items-center gap-2`;
