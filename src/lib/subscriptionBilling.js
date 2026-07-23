/**
 * Kopplar prenumerationer till riktiga transaktioner på förfallodagen —
 * annars räknas de bara i prognosen men syns aldrig i faktisk historik.
 */
import { clampCategory } from '@/lib/categoryRouter';

export function currentPeriodKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

/** Prenumerationer med förfallodag idag som inte redan loggats/skippats denna period. */
export function getSubscriptionsDueToday(profile, today = new Date()) {
  if (!profile?.subscriptions?.length) return [];
  const day = today.getDate();
  const period = currentPeriodKey(today);
  return profile.subscriptions
    .map((sub, index) => ({ sub, index }))
    .filter(({ sub }) => !sub.paused && sub.billingDay === day && sub.lastLoggedPeriod !== period);
}

export function subscriptionToTransaction(sub) {
  return {
    type: 'expense',
    amount: Math.abs(Number(sub.amount) || 0),
    label: sub.name,
    vendor: sub.name,
    category: clampCategory(sub.category),
    note: 'Loggad automatiskt från prenumeration',
    aiAgent: 'SubscriptionBilling',
  };
}
