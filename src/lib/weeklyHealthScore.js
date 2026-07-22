/**
 * Ekonomisk hälsoscore 0–100 (den här veckan) — ett tal att följa dagligen.
 */
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';
import { calculatePengometer } from '@/lib/anchorBrain';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';

export function calculateWeeklyHealthScore(profile, transactions = []) {
  if (!profile?.income) return { score: 0, label: '—', hint: 'Fyll i profilen först.', color: '#9AA5B4' };

  let score = 35;

  const fixed = getTotalFixedCosts(profile);
  const buffer = profile.buffer || 0;
  const months = fixed > 0 ? buffer / fixed : 0;
  score += Math.min(22, months * 7);

  const peng = calculatePengometer(profile, transactions);
  if (peng.weekly_budget_kr > 0) {
    score += (peng.fill_percent / 100) * 22;
    if (peng.spent_week_kr <= peng.weekly_budget_kr) score += 5;
  } else {
    score += 10;
  }

  const goal = profile.savingsGoal || 0;
  const saved = profile.savingsCurrentBalance || 0;
  if (goal > 0) {
    score += Math.min(18, (saved / goal) * 18);
  } else {
    score += 8;
  }

  const margin = getMonthlyMargin(profile);
  if (margin > 0 && profile.income > 0) {
    const marginPct = margin / profile.income;
    score += Math.min(12, marginPct * 40);
  }

  const weekAlert = getNextWeekFixedExpenses(profile, 7);
  if (weekAlert && buffer > 0 && weekAlert.totalKr > buffer * 0.6) {
    score -= 12;
  } else if (weekAlert && weekAlert.count >= 3) {
    score -= 4;
  }

  const rounded = Math.round(Math.max(0, Math.min(100, score)));

  let label = 'Stabil';
  let hint = 'Du har överblick — fortsätt i samma takt.';
  let color = '#6B9FFF';

  if (rounded >= 75) {
    label = 'Bra koll';
    hint = 'Buffert, vecka och sparande hänger ihop.';
    color = '#34D399';
  } else if (rounded >= 50) {
    label = 'På rätt spår';
    hint = 'Några justeringar kan lyfta dig ytterligare.';
    color = '#6B9FFF';
  } else if (rounded >= 30) {
    label = 'Spänd vecka';
    hint = 'Fokusera på det som dras snart och veckosaldot.';
    color = '#F6AD55';
  } else {
    label = 'Tight läge';
    hint = 'Ta det steg för steg — vi visar vad som hjälper mest.';
    color = '#FF8A9A';
  }

  return { score: rounded, label, hint, color };
}

export function healthShareText(score) {
  return `Min ekonomiska hälsa är ${score} den här veckan — vad är din? (Lago)`;
}
