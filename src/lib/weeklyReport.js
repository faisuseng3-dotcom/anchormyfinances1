import { getMonthlyMargin } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function weekRange() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function prevWeekRange() {
  const end = new Date();
  end.setDate(end.getDate() - 7);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function sumInRange(transactions, range, predicate) {
  return (transactions || [])
    .filter((t) => {
      const d = new Date(t.created_date || t.date || 0);
      return d >= range.start && d <= range.end && predicate(t);
    })
    .reduce((s, t) => s + Math.abs(t.amount || 0), 0);
}

/** Veckosammanfattning för dashboard. */
export function buildWeeklyReport(profile, transactions) {
  if (!profile?.income) return null;

  const thisWeek = weekRange();
  const lastWeek = prevWeekRange();

  const spent = sumInRange(transactions, thisWeek, (t) => t.amount < 0 && t.type !== 'transfer_to_savings');
  const saved = sumInRange(transactions, thisWeek, (t) =>
    t.type === 'transfer_to_savings' || t.type === 'savings_deposit' || (t.amount > 0 && t.category === 'savings'),
  );
  const prevSpent = sumInRange(transactions, lastWeek, (t) => t.amount < 0);

  const margin = getMonthlyMargin(profile);
  const weeklyBudget = margin / 4.33;
  const goalPct = weeklyBudget > 0
    ? Math.round(((weeklyBudget - spent) / weeklyBudget) * 100)
    : 0;

  const isSunday = new Date().getDay() === 0;
  const showProminent = isSunday || spent > 0 || saved > 0;

  if (!showProminent) return null;

  return {
    spent,
    saved,
    goalPct,
    vsLastWeek: prevSpent > 0 ? Math.round(((prevSpent - spent) / prevSpent) * 100) : null,
    label: isSunday ? 'Din vecka i Lago' : 'Senaste 7 dagarna',
    fmt,
  };
}
