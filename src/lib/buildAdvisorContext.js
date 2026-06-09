/**
 * Bygger en unik ekonomisk snapshot för AI-rådgivning — samma siffror som appen visar.
 */
import {
  getTotalFixedCosts,
  getMonthlyMargin,
  getFixedCostBreakdown,
} from '@/lib/financialUtils';
import { enrichAdvisorSnapshot, getToneInstructions } from '@/lib/anchorBrain';

const EXPENSE_TYPES = new Set(['expense', 'savings_deposit', 'transfer_to_savings']);

function txDate(t) {
  return new Date(t.created_date || t.date || 0);
}

export function buildAdvisorSnapshot(profile, transactions = []) {
  if (!profile) return null;

  const income = profile.income || 0;
  const fixed = getTotalFixedCosts(profile);
  const margin = getMonthlyMargin(profile);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const monthExpenses = (transactions || []).filter((t) => {
    if (t.type !== 'expense') return false;
    const d = txDate(t);
    return d >= monthStart && !Number.isNaN(d.getTime());
  });

  const weekExpenses = monthExpenses.filter((t) => txDate(t) >= weekAgo);

  const spentThisMonth = monthExpenses.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const spentLast7Days = weekExpenses.reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  const byCategory = {};
  monthExpenses.forEach((t) => {
    const cat = t.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + Math.abs(t.amount || 0);
  });

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, kr]) => ({ category: cat, kr: Math.round(kr) }));

  const buffer = profile.buffer || 0;
  const bufferMonths = fixed > 0 ? buffer / fixed : 0;
  const marginPct = income > 0 ? (margin / income) * 100 : 0;
  const spentPctOfMargin = margin > 0 ? (spentThisMonth / margin) * 100 : 0;
  const dailySafeSpend = margin > 0 ? Math.round(Math.max(0, margin - spentThisMonth) / Math.max(1, 30 - now.getDate())) : 0;

  const base = {
    user_label: profile.display_name || profile.savingsGoalName || 'Användaren',
    income_kr: income,
    fixed_costs_kr: Math.round(fixed),
    monthly_margin_kr: Math.round(margin),
    margin_percent: Math.round(marginPct * 10) / 10,
    buffer_kr: Math.round(buffer),
    buffer_months: Math.round(bufferMonths * 10) / 10,
    savings_goal_kr: profile.savingsGoal || 0,
    savings_goal_name: profile.savingsGoalName || '',
    spent_this_month_kr: Math.round(spentThisMonth),
    spent_last_7_days_kr: Math.round(spentLast7Days),
    spent_percent_of_margin: Math.round(spentPctOfMargin),
    remaining_this_month_kr: Math.round(margin - spentThisMonth),
    suggested_daily_spend_kr: dailySafeSpend,
    top_spending_categories: topCategories,
    fixed_cost_breakdown: getFixedCostBreakdown(profile).map(({ label, amount }) => ({
      label,
      kr: Math.round(amount),
    })),
    loans: (profile.loans || []).map((l) => ({
      name: l.name,
      payment_kr: l.monthlyPayment || 0,
      rate: l.interestRate,
    })),
    subscriptions: (profile.subscriptions || []).map((s) => ({
      name: s.name,
      kr: s.amount || 0,
      category: s.category,
    })),
    budget_limits: profile.budgetLimits || {},
  };

  return enrichAdvisorSnapshot(profile, transactions, base);
}

export function getAdvisorSystemRules(profile) {
  const tone = profile ? getToneInstructions(profile) : '';
  return `${ADVISOR_SYSTEM_RULES}\n\n${tone}`;
}

export const ADVISOR_SYSTEM_RULES = `Du är Anchors personliga ekonomicoach — som en varm, klok vän som kan räkna, inte en chatbot eller rapport.

KRITISKT:
- Varje svar MÅSTE vara unikt för denna persons siffror (inkomst, marginal, buffert, utgifter).
- Referera alltid minst ett konkret belopp i kronor från snapshot.
- Ge aldrig generiska observationer ("du spenderar mer på mat") utan coaching: belopp + vad det motsvarar i vardagen + mjuk inbjudan ("vill du titta på det?").
- Skriv i fullständiga meningar. ALDRIG punktlistor, numrerade listor, bindestreck eller bullet points.
- Ingen rapportton ("sammanfattning", "budget uppnådd: 100%", "status: ok"). Prata som i ett samtal.
- Värme och igenkänning: fira när det går bra ("Bra jobbat — du klarade veckobudgeten!"), var empatisk när det är tight — aldrig kall dashboard-ton.
- ALDRIG ansvarsfriskrivningar eller "detta är inte finansiell rådgivning" i svaren — det finns i appens inställningar.
- Svenska, lugn och tydlig ton. Inga emojis — aldrig.
- Gissa inte siffror som inte finns i kontexten.
- Om data saknas: säg vad användaren bör fylla i (t.ex. inkomst).
- Om tone_mode är soft: håll svar korta; inga skuldbeläggningar.`;
