/** Kartlägger onboarding-svar till produktfokus. */
import { Wallet, Landmark, PiggyBank, CalendarDays } from 'lucide-react';

export const TOP_CONCERNS = [
  {
    id: 'spending',
    icon: Wallet,
    label: 'Jag vet inte vart pengarna tar vägen',
    mapsToGoal: 'control',
    hint: 'Börja med att registrera utgifter och se kvar att spendera på Hem.',
    cta: 'Registrera en utgift',
    action: 'register',
  },
  {
    id: 'debt',
    icon: Landmark,
    label: 'Jag är stressad över lån och skulder',
    mapsToGoal: 'improve',
    hint: 'Kolla skuld och marginal under Mer insikter, eller i Kalkylatorn.',
    cta: 'Se skuldöversikt',
    action: 'debt',
  },
  {
    id: 'save',
    icon: PiggyBank,
    label: 'Jag vill spara men får det inte att hända',
    mapsToGoal: 'save',
    hint: 'Sätt ett sparmål och följ marginalen varje månad.',
    cta: 'Öppna sparmål',
    action: 'savings',
  },
  {
    id: 'plan',
    icon: CalendarDays,
    label: 'Jag vill veta vad som händer framåt',
    mapsToGoal: 'plan',
    hint: 'Lägg in kommande utgifter i Planera så inget överraskar.',
    cta: 'Öppna kalendern',
    action: 'plan',
  },
];

export function getConcernById(id) {
  return TOP_CONCERNS.find((c) => c.id === id) || null;
}

/** Första åtgärd efter onboarding (Dashboard anchorAction). */
export function getPostOnboardingAction(concernId) {
  const concern = getConcernById(concernId);
  return concern?.action || 'register';
}

/** @deprecated Use sortTools from toolCatalog.js */
export { sortTools as sortCalcItems } from '@/lib/toolCatalog';

export function applyConcernToProfile(data, concernId) {
  const concern = getConcernById(concernId);
  if (!concern) return data;
  const goals = data.userGoals?.length ? data.userGoals : [];
  if (!goals.includes(concern.mapsToGoal)) {
    goals.push(concern.mapsToGoal);
  }
  return {
    ...data,
    topConcern: concernId,
    userGoals: goals,
    primaryGoal: data.primaryGoal || concern.mapsToGoal,
    userGoal: data.userGoal || concern.mapsToGoal,
  };
}
