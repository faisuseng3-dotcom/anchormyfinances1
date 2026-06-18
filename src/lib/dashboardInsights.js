const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/** Insikter för dashboard — cardless lista under heron. */
export function generateDashboardInsights(profile, transactions) {
  const insights = [];
  if (!profile?.income) return insights;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const isExpense = (tx) => (tx.type === 'expense' || tx.type === 'shopping') || tx.amount < 0;

  const thisMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= monthStart && isExpense(t);
  });

  const prevMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= prevMonthStart && d <= prevMonthEnd && isExpense(t);
  });

  const catThis = {};
  const catPrev = {};
  thisMo.forEach((t) => { const c = t.category || 'other'; catThis[c] = (catThis[c] || 0) + Math.abs(t.amount || 0); });
  prevMo.forEach((t) => { const c = t.category || 'other'; catPrev[c] = (catPrev[c] || 0) + Math.abs(t.amount || 0); });

  const CAT_LABELS = {
    food: 'restaurangutgifter',
    entertainment: 'nöje',
    transport: 'transport',
    shopping: 'shopping',
    health: 'hälsa',
    travel: 'resor',
    other: 'övrigt',
  };

  let biggestIncrease = null;
  let biggestIncreasePct = 0;
  Object.keys(catThis).forEach((c) => {
    if ((catPrev[c] || 0) > 100) {
      const pct = ((catThis[c] - catPrev[c]) / catPrev[c]) * 100;
      if (pct > 15 && pct > biggestIncreasePct) {
        biggestIncrease = c;
        biggestIncreasePct = pct;
      }
    }
  });
  if (biggestIncrease) {
    insights.push(`${CAT_LABELS[biggestIncrease] || biggestIncrease} +${Math.round(biggestIncreasePct)} %`);
  }

  const subs = profile?.subscriptions || [];
  const day = now.getDate();
  const upcoming = subs.find((s) => {
    const due = s.billingDay || s.dueDay || s.day;
    if (!due) return false;
    let diff = due - day;
    if (diff < 0) diff += 30;
    return diff >= 0 && diff <= 5;
  });
  if (upcoming) {
    const due = upcoming.billingDay || upcoming.dueDay || upcoming.day;
    let diff = due - day;
    if (diff < 0) diff += 30;
    insights.push(`${upcoming.name} förnyas om ${diff} dag${diff === 1 ? '' : 'ar'}`);
  }

  if (profile?.savingsGoal > 0 && profile?.savingsCurrentBalance > 0) {
    const monthlyTarget = profile.savingsGoal / 12;
    const aheadPct = monthlyTarget > 0
      ? Math.round(((profile.savingsCurrentBalance - monthlyTarget) / monthlyTarget) * 100)
      : 0;
    if (aheadPct >= 10) {
      insights.push('Du ligger före sparmålet');
    }
  }

  return insights.slice(0, 3);
}

export { fmt };
