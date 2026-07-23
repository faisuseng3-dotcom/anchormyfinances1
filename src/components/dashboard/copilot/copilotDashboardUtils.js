import { getMonthlyMargin, getTotalFixedCosts } from '@/lib/financialUtils';
import { calculatePengometer } from '@/lib/anchorBrain';
import { TRACKED_BUDGET_CATEGORIES, BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import { computeLocalFuturePulse } from '@/lib/futurePulseEngine';

const EXPENSE_TYPES = new Set(['expense', 'shopping']);

export function fmtKr(n, { signed = false, prefix = '' } = {}) {
  const val = Math.round(Math.abs(n || 0)).toLocaleString('sv-SE');
  if (signed && n < 0) return `−${val} kr`;
  if (signed && n > 0) return `+${val} kr`;
  return `${prefix}${val} kr`;
}

export function getMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    label: now.toLocaleDateString('sv-SE', { month: 'long' }),
  };
}

export function getMonthlySpentByCategory(transactions) {
  const { start, end } = getMonthRange();
  const spent = {};
  (transactions || []).forEach((tx) => {
    if (!EXPENSE_TYPES.has(tx.type) && tx.amount >= 0) return;
    const date = new Date(tx.created_date || tx.date);
    if (date < start || date > end) return;
    const cat = tx.category || 'other';
    spent[cat] = (spent[cat] || 0) + Math.abs(tx.amount);
  });
  return spent;
}

export function getHousingCost(profile) {
  if (!profile) return 0;
  const items = profile.fixedCostItems || [];
  const fromItems = items
    .filter((i) => /boende|hyra|bolån|bostad/i.test(i.label || ''))
    .reduce((s, i) => s + (i.amount || 0), 0);
  if (fromItems > 0) return fromItems;
  return profile.housingCost || 0;
}

export function buildBudgetRows(profile, transactions) {
  const monthlySpent = getMonthlySpentByCategory(transactions);
  const limits = profile?.budgetLimits || {};
  const rows = TRACKED_BUDGET_CATEGORIES.filter(
    (cat) => (limits[cat] || 0) > 0 || (monthlySpent[cat] || 0) > 0,
  )
    .slice(0, 4)
    .map((cat) => {
      const spent = monthlySpent[cat] || 0;
      const limit = limits[cat] || 0;
      const pct = limit > 0 ? Math.min(1, spent / limit) : 0;
      return {
        key: cat,
        category: cat,
        name: BUDGET_CATEGORY_META[cat]?.label || cat,
        spent,
        limit,
        pct,
        over: limit > 0 && spent > limit,
        overAmt: limit > 0 ? spent - limit : 0,
      };
    });

  const housing = getHousingCost(profile);
  if (housing > 0) {
    rows.push({
      key: 'housing',
      category: 'home',
      name: 'Boende',
      spent: housing,
      limit: housing,
      pct: 1,
      over: false,
      overAmt: 0,
    });
  }

  return rows.length ? rows : [
    { key: 'food', category: 'food', name: 'Mat', spent: 0, limit: 0, pct: 0, over: false, overAmt: 0 },
  ];
}

export function buildSummaryCards(profile, transactions) {
  const margin = getMonthlyMargin(profile);
  const peng = calculatePengometer(profile, transactions);
  const monthlySpent = getMonthlySpentByCategory(transactions);
  const variableSpent = Object.values(monthlySpent).reduce((s, v) => s + v, 0);
  const remaining = Math.max(0, margin - variableSpent);
  const buffer = profile?.buffer || 0;
  const saved = profile?.savingsCurrentBalance || 0;
  const loans = (profile?.loans || []).reduce((s, l) => s + (l.remaining || l.amount || 0), 0);
  const netWorth = buffer + saved - loans;

  return {
    remaining,
    income: profile?.income || 0,
    saved: buffer + saved,
    netWorth,
    pengHeadline: peng.headline_kr,
  };
}

export function buildAccountItems(profile) {
  if (!profile) return [];
  const buffer = profile.buffer || 0;
  const saved = profile.savingsCurrentBalance || 0;
  const loanDebt = (profile?.loans || []).reduce((s, l) => s + (l.remaining || l.amount || 0), 0);
  const fixed = getTotalFixedCosts(profile);
  const items = [];

  if (buffer > 0) {
    items.push({
      id: 'buffer',
      name: 'Buffert',
      amount: buffer,
      color: '#4fae82',
      goalTarget: fixed * 3,
      interactive: true,
    });
  }
  if (saved > 0 || profile.savingsGoal) {
    items.push({
      id: 'savings',
      name: profile.savingsGoalName || 'Sparkonto',
      amount: saved,
      color: '#4fae82',
      goalTarget: profile.savingsGoal || 0,
      interactive: true,
    });
  }
  if (profile.income) {
    const margin = getMonthlyMargin(profile);
    items.push({
      id: 'margin',
      name: 'Månadsmarginal',
      amount: margin,
      color: '#4fae82',
      goalTarget: null,
      interactive: true,
    });
  }
  if (loanDebt > 0) {
    items.push({
      id: 'debt',
      name: 'Skulder',
      amount: -loanDebt,
      color: '#e2857a',
      goalTarget: null,
      interactive: false,
    });
  }
  return items;
}

/** Transaktioner att granska på dashboard — okategoriserade eller senaste utgifter. */
export function buildReviewQueue(transactions, limit = 6) {
  const list = transactions || [];
  const needsReview = list.filter((tx) => {
    if (tx.amount >= 0) return false;
    const cat = tx.category || 'other';
    return cat === 'other' || !tx.category;
  });
  const source = needsReview.length > 0 ? needsReview : list.filter((tx) => tx.amount < 0);
  return source.slice(0, limit).map((tx, i) => ({
    ...tx,
    _description: tx.vendor || tx.label || tx.description || 'Transaktion',
    _date: tx.created_date || tx.date,
    _amount: tx.amount,
    _category: tx.category || 'other',
    _needsReview: needsReview.length > 0,
    _key: tx.id || `review-${i}`,
  }));
}

export function getRecentTransactions(transactions, limit = 5) {
  return [...(transactions || [])]
    .filter((t) => t.context !== 'BUSINESS')
    .sort(
      (a, b) =>
        new Date(b.created_date || b.date).getTime() - new Date(a.created_date || a.date).getTime(),
    )
    .slice(0, limit)
    .map((tx) => {
      const isCredit = tx.amount > 0 || tx.type === 'income';
      const cat = tx.category || 'other';
      const date = new Date(tx.created_date || tx.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const txDay = new Date(date);
      txDay.setHours(0, 0, 0, 0);
      const diff = Math.round((today.getTime() - txDay.getTime()) / 86400000);
      let dateLabel = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
      if (diff === 0) dateLabel = 'Idag';
      else if (diff === 1) dateLabel = 'Igår';

      return {
        id: tx.id,
        categoryKey: isCredit ? 'income' : cat,
        categoryLabel: BUDGET_CATEGORY_META[cat]?.label || cat,
        name: tx.vendor || tx.label || tx.description || 'Transaktion',
        dateLabel,
        amount: tx.amount,
        isCredit,
      };
    });
}

export function buildSavingsGoals(profile) {
  if (!profile) return [];
  const goals = [];
  if (profile.savingsGoal > 0) {
    const current = profile.savingsCurrentBalance || 0;
    const target = profile.savingsGoal;
    goals.push({
      goalType: profile.savingsGoalIcon || 'default',
      name: profile.savingsGoalName || 'Sparmål',
      current,
      target,
      pct: target > 0 ? Math.min(100, (current / target) * 100) : 0,
      deadline: profile.savingsGoalDeadline || null,
      imageUrl: profile.savingsGoalImageUrl || null,
      visualType: profile.savingsGoalVisualType || (profile.savingsGoalImageUrl ? 'image' : 'icon'),
      isPrimary: true,
    });
  }
  const fixed = getTotalFixedCosts(profile);
  const bufferTarget = fixed * 3;
  if (bufferTarget > 0) {
    const buffer = profile.buffer || 0;
    goals.push({
      goalType: 'buffer',
      name: 'Buffert (3 mån)',
      current: buffer,
      target: bufferTarget,
      pct: Math.min(100, (buffer / bufferTarget) * 100),
      deadline: null,
    });
  }
  return goals.slice(0, 3);
}

export function buildFutureScenarios(profile, transactions) {
  const margin = getMonthlyMargin(profile);
  const pessimistic = Math.max(0, margin * 0.6 * 12);
  const realistic = Math.max(0, margin * 12);
  const optimistic = Math.max(0, margin * 1.35 * 12);
  const forecast = computeLocalFuturePulse(profile, transactions, 60, 2);
  return { pessimistic, realistic, optimistic, forecast };
}

export function formatTopbarDate() {
  const d = new Date();
  const weekday = d.toLocaleDateString('sv-SE', { weekday: 'long' });
  const rest = d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} · ${rest}`;
}

export function getSubscriptionTotal(profile) {
  return (profile?.subscriptions || []).reduce((s, sub) => s + (sub.amount || 0), 0);
}

export function getUpcomingSubscriptions(profile, limit = 4) {
  const today = new Date();
  const day = today.getDate();
  return [...(profile?.subscriptions || [])]
    .map((sub) => {
      const dueDay = sub.dueDay || sub.day || 1;
      let next = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (next < today) next = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
      return { ...sub, nextDate: next };
    })
    .sort((a, b) => a.nextDate - b.nextDate)
    .slice(0, limit);
}
