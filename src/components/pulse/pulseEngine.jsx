// @ts-nocheck
// pulseEngine.js – Core logic for The Pulse forecasting

export function buildUpcomingExpenses(profile) {
  const items = [];

  if (profile?.housingCost > 0) {
    items.push({
      id: 'housing',
      name: 'Hyra/Boende',
      amount: profile.housingCost,
      dueDay: profile.housingDueDay || 27,
      priority: 'critical',
      icon: '🏠',
      category: 'home',
      recurring: true,
    });
  }

  (profile?.loans || []).forEach((loan, i) => {
    items.push({
      id: `loan-${i}`,
      name: loan.name || 'Lån',
      amount: loan.monthlyPayment,
      dueDay: 5 + i,
      priority: 'critical',
      icon: '🏦',
      category: 'loans',
      recurring: true,
    });
  });

  const CATEGORY_ICONS = {
    streaming: '🎬',
    entertainment: '🎮',
    transport: '🚌',
    health: '💪',
    food: '🛒',
    insurance: '🛡️',
    other: '📱',
  };

  const DUE_DAYS = [8, 12, 15, 18, 22, 27];
  (profile?.subscriptions || []).forEach((sub, i) => {
    items.push({
      id: `sub-${i}`,
      name: sub.name,
      amount: sub.amount,
      dueDay: sub.billingDay || DUE_DAYS[i % DUE_DAYS.length],
      priority: 'lifestyle',
      icon: CATEGORY_ICONS[sub.category] || '📱',
      category: sub.category,
      recurring: true,
    });
  });

  return items;
}

export function getUpcomingDates(expenses, currentBalance, incomeDay = 25, incomeAmount = 0) {
  const today = new Date();
  const todayDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Next 35 days of events
  const events = [];

  for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dayOfMonth = d.getDate();
    const isNextMonth = d.getMonth() !== currentMonth;

    expenses.forEach(exp => {
      if (dayOfMonth === exp.dueDay) {
        events.push({
          ...exp,
          date: new Date(d),
          dayOffset,
          isNextMonth,
        });
      }
    });

    // Income event
    if (dayOfMonth === incomeDay && dayOffset > 0) {
      events.push({
        id: 'income',
        name: 'Lön',
        amount: incomeAmount,
        date: new Date(d),
        dayOffset,
        priority: 'income',
        icon: '💰',
        recurring: true,
      });
    }
  }

  events.sort((a, b) => a.date - b.date);
  return events;
}

export function calculateRunningBalance(events, currentBalance) {
  let balance = currentBalance;
  return events.map(ev => {
    if (ev.priority === 'income') {
      balance += ev.amount;
    } else {
      balance -= ev.amount;
    }
    return { ...ev, balanceAfter: balance };
  });
}

export function getGuiltFreeAmount(events, currentBalance, incomeDay = 25, safetyBuffer = 500) {
  const today = new Date();
  const nextIncomeEvent = events.find(e => e.priority === 'income');
  const eventsBeforeIncome = nextIncomeEvent
    ? events.filter(e => e.priority !== 'income' && e.date <= nextIncomeEvent.date)
    : events.filter(e => e.priority !== 'income');

  const criticalSum = eventsBeforeIncome
    .filter(e => e.priority === 'critical')
    .reduce((s, e) => s + e.amount, 0);

  const disposable = currentBalance - criticalSum - safetyBuffer;
  return Math.max(0, Math.round(disposable));
}

export function getDangerEvents(eventsWithBalance) {
  return eventsWithBalance.filter(e => e.priority !== 'income' && e.balanceAfter < 0);
}

export function getNextDangerEvent(eventsWithBalance) {
  return eventsWithBalance.find(e => e.priority === 'critical' && e.dayOffset > 0);
}

export function formatNumber(v) {
  return (v || 0).toLocaleString('sv-SE');
}

// Safe-to-Spend: saldo minus återstående fasta kostnader denna månad
export function getSafeToSpend(profile, currentBalance) {
  if (!profile || currentBalance == null) return 0;
  const todayDay = new Date().getDate();
  const DUE_DAYS = [8, 12, 15, 18, 22, 27];
  let remainingFixed = 0;

  const housingDay = profile.housingDueDay || 27;
  if (housingDay > todayDay) remainingFixed += (profile.housingCost || 0);

  (profile.loans || []).forEach((loan, i) => {
    if ((5 + i) > todayDay) remainingFixed += (loan.monthlyPayment || 0);
  });

  (profile.subscriptions || []).forEach((sub, i) => {
    const dueDay = sub.billingDay || DUE_DAYS[i % DUE_DAYS.length];
    if (dueDay > todayDay) remainingFixed += (sub.amount || 0);
  });

  return Math.max(0, Math.round(currentBalance - remainingFixed - 500));
}