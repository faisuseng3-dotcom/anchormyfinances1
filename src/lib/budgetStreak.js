import { getMonthlyMargin, getTotalFixedCosts } from '@/lib/financialUtils';

const EXPENSE_TYPES = new Set(['expense', 'shopping']);

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

function sumDaySpend(transactions, key) {
  return (transactions || []).reduce((sum, tx) => {
    if (!EXPENSE_TYPES.has(tx.type) && tx.amount >= 0) return sum;
    const txKey = dayKey(new Date(tx.created_date || tx.date));
    if (txKey !== key) return sum;
    return sum + Math.abs(tx.amount);
  }, 0);
}

/** Consecutive days ending today where daily spend stayed under ~110% of daily budget. */
export function calcUnderBudgetStreak(profile, transactions) {
  if (!profile?.income) return 0;
  const margin = getMonthlyMargin(profile);
  const dailyBudget = margin > 0 ? margin / 30 : 0;
  if (dailyBudget < 50) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    const spent = sumDaySpend(transactions, key);
    if (spent <= dailyBudget * 1.1) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}
