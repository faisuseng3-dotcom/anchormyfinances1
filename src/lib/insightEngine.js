/**
 * InsightEngine – Analyserar transaktioner och profil för att hitta mönster och generera råd.
 */

const EXPENSE_TYPES = ['expense', 'savings_deposit', 'transfer_to_savings'];
const MOVABLE_CATEGORIES = ['food', 'entertainment', 'shopping', 'travel', 'health'];

/** Returnerar YYYY-MM för ett datum */
function toMonth(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Summerar utgifter per kategori för en given lista transaktioner */
function sumByCategory(txs) {
  return txs.reduce((acc, t) => {
    if (!EXPENSE_TYPES.includes(t.type)) return acc;
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
    return acc;
  }, {});
}

/** Delar in transaktioner per månad → { 'YYYY-MM': [tx,...] } */
function groupByMonth(txs) {
  return txs.reduce((acc, t) => {
    const m = toMonth(t.created_date);
    if (!m) return acc;
    if (!acc[m]) acc[m] = [];
    acc[m].push(t);
    return acc;
  }, {});
}

/** Identifierar återkommande betalningar (vendor/label som dyker upp 2+ gånger) */
function detectRecurring(txs) {
  const counts = {};
  txs.forEach(t => {
    const key = (t.vendor || t.label || '').toLowerCase().trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).filter(([, c]) => c >= 2).map(([name]) => name);
}

/**
 * Huvudfunktion: kör alla analysregler och returnerar en lista Insight-objekt.
 * Varje insight: { type, severity, title, description, consequence, action, actionLink, data }
 */
export function runInsightEngine(profile, transactions) {
  if (!profile || !transactions) return [];
  const insights = [];

  const byMonth = groupByMonth(transactions);
  const sortedMonths = Object.keys(byMonth).sort().reverse(); // nyaste först
  const currentMonth = sortedMonths[0];
  const prevMonths = sortedMonths.slice(1, 4); // upp till 3 månader bakåt

  const currentTxs = currentMonth ? byMonth[currentMonth] : [];
  const prevTxs = prevMonths.flatMap(m => byMonth[m] || []);

  const currentSums = sumByCategory(currentTxs);
  const prevSumsTotal = sumByCategory(prevTxs);
  const numPrevMonths = prevMonths.length || 1;

  // ── RULE 1: Lifestyle Creep ─────────────────────────────────────────────
  if (prevMonths.length >= 1) {
    let totalCurrentMovable = 0;
    let totalPrevMovableAvg = 0;
    MOVABLE_CATEGORIES.forEach(cat => {
      totalCurrentMovable += currentSums[cat] || 0;
      totalPrevMovableAvg += (prevSumsTotal[cat] || 0) / numPrevMonths;
    });
    if (totalPrevMovableAvg > 500 && totalCurrentMovable > totalPrevMovableAvg * 1.15) {
      const diff = Math.round(totalCurrentMovable - totalPrevMovableAvg);
      const pct = Math.round((totalCurrentMovable / totalPrevMovableAvg - 1) * 100);
      insights.push({
        id: 'lifestyle_creep',
        type: 'warning',
        severity: 2,
        title: 'Dina rörliga utgifter ökar',
        description: `Du spenderar ${diff.toLocaleString('sv-SE')} kr (${pct}%) mer denna månad än ditt 3-månaders snitt på rörliga kostnader.`,
        consequence: 'Om trenden fortsätter urholkas din sparmarginal utan att du märker det.',
        action: 'Visa kategorier',
        actionLink: '/TransactionHistory',
        data: { current: totalCurrentMovable, avg: Math.round(totalPrevMovableAvg), diff, pct }
      });
    }
  }

  // ── RULE 2: Prenumerationsvarning ────────────────────────────────────────
  const profileSubNames = (profile.subscriptions || []).map(s => (s.name || '').toLowerCase().trim());
  const recurringFromTxs = detectRecurring(transactions.filter(t => EXPENSE_TYPES.includes(t.type)));
  const unknownRecurring = recurringFromTxs.filter(name =>
    name.length > 2 && !profileSubNames.some(s => name.includes(s) || s.includes(name))
  );
  if (unknownRecurring.length > 0) {
    insights.push({
      id: 'unknown_subscriptions',
      type: 'info',
      severity: 1,
      title: 'Okända återkommande betalningar',
      description: `Vi hittade ${unknownRecurring.length} återkommande betalningar som inte är registrerade i din profil: ${unknownRecurring.slice(0, 3).join(', ')}.`,
      consequence: 'Dessa kan vara prenumerationer du glömt och inte räknat in i din budget.',
      action: 'Granska transaktioner',
      actionLink: '/TransactionHistory',
      data: { names: unknownRecurring }
    });
  }

  // ── RULE 3: Låg buffert / likviditetsrisk ─────────────────────────────────
  const totalFixed = (profile.housingCost || 0)
    + (profile.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0)
    + (profile.loans || []).reduce((s, x) => s + (x.monthlyPayment || 0), 0);
  const buffer = profile.buffer || 0;
  const monthsOfBuffer = totalFixed > 0 ? buffer / totalFixed : 99;
  if (monthsOfBuffer < 1) {
    insights.push({
      id: 'low_buffer',
      type: 'danger',
      severity: 3,
      title: 'Kritiskt låg buffert',
      description: `Din buffert på ${buffer.toLocaleString('sv-SE')} kr täcker mindre än en månads fasta kostnader (${totalFixed.toLocaleString('sv-SE')} kr).`,
      consequence: 'En oväntad utgift, som en bilreparation, kan sätta dig i minus.',
      action: 'Sätt upp sparplan',
      actionLink: '/SavingsGoals',
      data: { buffer, totalFixed, monthsOfBuffer }
    });
  } else if (monthsOfBuffer < 3) {
    insights.push({
      id: 'medium_buffer',
      type: 'warning',
      severity: 2,
      title: 'Bufferten kan stärkas',
      description: `Din buffert täcker ${monthsOfBuffer.toFixed(1)} månader. Rekommenderat är 3+ månader.`,
      consequence: 'Du klarar en kris men inte en längre period utan inkomst.',
      action: 'Spara till buffert',
      actionLink: '/SavingsGoals',
      data: { monthsOfBuffer }
    });
  }

  // ── RULE 4: Sparkvot ──────────────────────────────────────────────────────
  if (profile.income > 0 && prevMonths.length >= 1) {
    const avgMonthlyExpenses = Object.values(prevSumsTotal).reduce((s, v) => s + v, 0) / numPrevMonths;
    const savingsRate = Math.max(0, (profile.income - avgMonthlyExpenses) / profile.income);
    if (savingsRate < 0.05) {
      insights.push({
        id: 'low_savings_rate',
        type: 'warning',
        severity: 2,
        title: 'Sparkvoten är låg',
        description: `Du sparar uppskattningsvis ${Math.round(savingsRate * 100)}% av din inkomst baserat på de senaste månadernas data.`,
        consequence: 'Med denna takt kommer sparmålet ta mycket längre tid att nå.',
        action: 'Optimera budget',
        actionLink: '/Budget',
        data: { savingsRate }
      });
    }
  }

  // ── RULE 5: Hög konsumtion enstaka kategori ────────────────────────────────
  MOVABLE_CATEGORIES.forEach(cat => {
    const curr = currentSums[cat] || 0;
    const prevAvg = prevMonths.length > 0 ? (prevSumsTotal[cat] || 0) / numPrevMonths : 0;
    if (prevAvg > 200 && curr > prevAvg * 1.5 && curr > 500) {
      const catLabel = { food: 'Mat', entertainment: 'Nöje', shopping: 'Shopping', travel: 'Resor', health: 'Hälsa' }[cat] || cat;
      insights.push({
        id: `spike_${cat}`,
        type: 'warning',
        severity: 1,
        title: `${catLabel}: ovanligt hög konsumtion`,
        description: `Du har spenderat ${curr.toLocaleString('sv-SE')} kr på ${catLabel.toLowerCase()} denna månad vs snitt ${Math.round(prevAvg).toLocaleString('sv-SE')} kr.`,
        consequence: `Det kan påverka hur mycket du har kvar att spara i slutet av månaden.`,
        action: 'Visa transaktioner',
        actionLink: '/TransactionHistory',
        data: { cat, curr, prevAvg }
      });
    }
  });

  // Sortera efter allvarlighetsgrad
  return insights.sort((a, b) => b.severity - a.severity);
}

/** Beräknar likviditetsprognos för kommande 30 dagar */
export function calcLiquidityForecast(profile, transactions) {
  if (!profile) return null;
  const today = new Date();
  const dayOfMonth = today.getDate();
  const income = profile.income || 0;

  // Beräkna genomsnittlig daglig konsumtion
  const last30 = transactions.filter(t => {
    if (!EXPENSE_TYPES.includes(t.type)) return false;
    const d = new Date(t.created_date);
    const diffMs = today - d;
    return diffMs >= 0 && diffMs < 30 * 24 * 3600 * 1000;
  });
  const totalSpent30 = last30.reduce((s, t) => s + Math.abs(t.amount), 0);
  const avgDailySpend = totalSpent30 / 30;

  // Beräkna kvarvarande fasta kostnader denna månad
  const daysLeft = 30 - dayOfMonth;
  const housingDay = profile.housingDueDay || 27;
  let remainingFixed = 0;
  if (housingDay > dayOfMonth) remainingFixed += (profile.housingCost || 0);
  (profile.loans || []).forEach((l, i) => {
    const day = 5 + i;
    if (day > dayOfMonth) remainingFixed += (l.monthlyPayment || 0);
  });
  (profile.subscriptions || []).forEach((s, i) => {
    const day = s.billingDay || (10 + i);
    if (day > dayOfMonth) remainingFixed += (s.amount || 0);
  });

  const projectedVariableSpend = avgDailySpend * daysLeft;
  const currentBuffer = profile.buffer || 0;
  const projectedBalance = currentBuffer - remainingFixed - projectedVariableSpend;
  const daysToZero = projectedBalance <= 0 ? 0 : Math.floor(projectedBalance / avgDailySpend);

  return {
    currentBuffer,
    remainingFixed,
    projectedVariableSpend: Math.round(projectedVariableSpend),
    projectedBalance: Math.round(projectedBalance),
    avgDailySpend: Math.round(avgDailySpend),
    daysLeft,
    daysToZero,
    isNegative: projectedBalance < 0
  };
}