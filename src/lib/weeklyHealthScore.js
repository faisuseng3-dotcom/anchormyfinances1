/**
 * Ekonomisk hälsoscore 0–100 (den här veckan) — ett tal att följa dagligen.
 */
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';
import { calculatePengometer } from '@/lib/anchorBrain';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';

export function calculateWeeklyHealthScore(profile, transactions = []) {
  if (!profile?.income) {
    return { score: 0, label: '—', hint: 'Fyll i profilen först.', color: '#9AA5B4', factors: [] };
  }

  let score = 35;
  const factors = [];

  const fixed = getTotalFixedCosts(profile);
  const buffer = profile.buffer || 0;
  const months = fixed > 0 ? buffer / fixed : 0;
  score += Math.min(22, months * 7);
  factors.push({
    id: 'buffer',
    label: 'Buffert',
    ok: months >= 3,
    detail: fixed > 0
      ? `${months.toFixed(1)} månaders fasta kostnader sparade`
      : 'Lägg in fasta kostnader för att räkna ut detta',
  });

  const peng = calculatePengometer(profile, transactions);
  if (peng.weekly_budget_kr > 0) {
    score += (peng.fill_percent / 100) * 22;
    if (peng.spent_week_kr <= peng.weekly_budget_kr) score += 5;
    factors.push({
      id: 'week',
      label: 'Veckobudget',
      ok: peng.spent_week_kr <= peng.weekly_budget_kr,
      detail: `${Math.round(peng.spent_week_kr).toLocaleString('sv-SE')} av ${Math.round(peng.weekly_budget_kr).toLocaleString('sv-SE')} kr spenderat denna vecka`,
    });
  } else {
    score += 10;
  }

  const goal = profile.savingsGoal || 0;
  const saved = profile.savingsCurrentBalance || 0;
  if (goal > 0) {
    const pct = (saved / goal) * 100;
    score += Math.min(18, pct * 0.18);
    factors.push({
      id: 'savings',
      label: 'Sparmål',
      ok: pct >= 20,
      detail: `${Math.round(pct)}% av ${Math.round(goal).toLocaleString('sv-SE')} kr uppnått`,
    });
  } else {
    score += 8;
  }

  const margin = getMonthlyMargin(profile);
  if (margin > 0 && profile.income > 0) {
    const marginPct = margin / profile.income;
    score += Math.min(12, marginPct * 40);
    factors.push({
      id: 'margin',
      label: 'Marginal',
      ok: marginPct >= 0.1,
      detail: `${Math.round(marginPct * 100)}% av inkomsten blir kvar per månad`,
    });
  }

  const weekAlert = getNextWeekFixedExpenses(profile, 7);
  const billRisk = weekAlert && buffer > 0 && weekAlert.totalKr > buffer * 0.6;
  if (billRisk) {
    score -= 12;
  } else if (weekAlert && weekAlert.count >= 3) {
    score -= 4;
  }
  if (weekAlert && weekAlert.count > 0) {
    factors.push({
      id: 'upcoming',
      label: 'Kommande räkningar',
      ok: !billRisk,
      detail: `${weekAlert.count} st, totalt ${Math.round(weekAlert.totalKr).toLocaleString('sv-SE')} kr de närmaste 7 dagarna`,
    });
  }

  const rounded = Math.round(Math.max(0, Math.min(100, score)));

  let label = 'Stabil';
  let hint = 'Du har överblick — fortsätt i samma takt.';
  let color = '#7fc4a3';

  if (rounded >= 75) {
    label = 'Bra koll';
    hint = 'Buffert, vecka och sparande hänger ihop.';
    color = '#4fae82';
  } else if (rounded >= 50) {
    label = 'På rätt spår';
    hint = 'Några justeringar kan lyfta dig ytterligare.';
    color = '#7fc4a3';
  } else if (rounded >= 30) {
    label = 'Spänd vecka';
    hint = 'Fokusera på det som dras snart och veckosaldot.';
    color = '#d9b25c';
  } else {
    label = 'Tight läge';
    hint = 'Ta det steg för steg — vi visar vad som hjälper mest.';
    color = '#e2857a';
  }

  return { score: rounded, label, hint, color, factors };
}

export function healthShareText(score) {
  return `Min ekonomiska hälsa är ${score} den här veckan — vad är din? (Lago)`;
}
