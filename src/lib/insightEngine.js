// @ts-nocheck
/**
 * InsightEngine – coaching-insikter med konkreta belopp och vardagsjämförelser.
 */

import { coachInvite, findMoneyComparison, fmtKr, monthLabel } from '@/lib/coachingCopy';

const EXPENSE_TYPES = ['expense', 'savings_deposit', 'transfer_to_savings'];
const MOVABLE_CATEGORIES = ['food', 'entertainment', 'shopping', 'travel', 'health'];

const CAT_LABELS = {
  food: 'mat',
  entertainment: 'nöje',
  shopping: 'shopping',
  travel: 'resor',
  health: 'hälsa',
};

function toMonth(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function sumByCategory(txs) {
  return txs.reduce((acc, t) => {
    if (!EXPENSE_TYPES.includes(t.type)) return acc;
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
    return acc;
  }, {});
}

function groupByMonth(txs) {
  return txs.reduce((acc, t) => {
    const m = toMonth(t.created_date);
    if (!m) return acc;
    if (!acc[m]) acc[m] = [];
    acc[m].push(t);
    return acc;
  }, {});
}

function detectRecurring(txs) {
  const counts = {};
  txs.forEach((t) => {
    const key = (t.vendor || t.label || '').toLowerCase().trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).filter(([, c]) => c >= 2).map(([name]) => name);
}

/**
 * Varje insight: { type, severity, title, description, why, consequence, action, actionLink, data }
 */
export function runInsightEngine(profile, transactions) {
  if (!profile || !transactions) return [];
  const insights = [];

  const byMonth = groupByMonth(transactions);
  const sortedMonths = Object.keys(byMonth).sort().reverse();
  const currentMonth = sortedMonths[0];
  const prevMonths = sortedMonths.slice(1, 4);
  const monthName = monthLabel(currentMonth);

  const currentTxs = currentMonth ? byMonth[currentMonth] : [];
  const prevTxs = prevMonths.flatMap((m) => byMonth[m] || []);

  const currentSums = sumByCategory(currentTxs);
  const prevSumsTotal = sumByCategory(prevTxs);
  const numPrevMonths = prevMonths.length || 1;

  // ── Lifestyle creep ───────────────────────────────────────────────────────
  if (prevMonths.length >= 1) {
    let totalCurrentMovable = 0;
    let totalPrevMovableAvg = 0;
    MOVABLE_CATEGORIES.forEach((cat) => {
      totalCurrentMovable += currentSums[cat] || 0;
      totalPrevMovableAvg += (prevSumsTotal[cat] || 0) / numPrevMonths;
    });
    if (totalPrevMovableAvg > 500 && totalCurrentMovable > totalPrevMovableAvg * 1.15) {
      const diff = Math.round(totalCurrentMovable - totalPrevMovableAvg);
      const compare = findMoneyComparison(diff, profile);
      insights.push({
        id: 'lifestyle_creep',
        type: 'warning',
        severity: 2,
        title: `${fmtKr(diff)} kr mer på rörliga utgifter`,
        description: `I ${monthName} gick ${fmtKr(diff)} kr mer än vanligt till mat, nöje och shopping. Det motsvarar ${compare || 'en del av din marginal'}.`,
        why: `Jag jämför dina rörliga utgifter den här månaden med snittet av de senaste ${numPrevMonths} månaderna. När skillnaden passerar 15% och minst 500 kr flaggar vi det — inte för att moralisera, utan så du hinner se mönstret.`,
        consequence: 'Om det här blir vana äter det sakta upp det du ville spara — utan att det känns som ett stort beslut.',
        action: 'titta på kategorierna',
        actionLink: '/TransactionHistory',
        data: { current: totalCurrentMovable, avg: Math.round(totalPrevMovableAvg), diff },
      });
    }
  }

  // ── Okända återkommande betalningar ─────────────────────────────────────
  const profileSubNames = (profile.subscriptions || []).map((s) => (s.name || '').toLowerCase().trim());
  const recurringFromTxs = detectRecurring(transactions.filter((t) => EXPENSE_TYPES.includes(t.type)));
  const unknownRecurring = recurringFromTxs.filter(
    (name) => name.length > 2 && !profileSubNames.some((s) => name.includes(s) || s.includes(name)),
  );
  if (unknownRecurring.length > 0) {
    const names = unknownRecurring.slice(0, 2).join(' och ');
    const extra = unknownRecurring.length > 2 ? ` — plus ${unknownRecurring.length - 2} till` : '';
    insights.push({
      id: 'unknown_subscriptions',
      type: 'info',
      severity: 1,
      title: 'Något dras varje månad som du inte budgeterat',
      description: `Jag ser återkommande betalningar till ${names}${extra}. De finns inte med i din profil, så de kan ligga utanför det du tror att du har kvar.`,
      why: 'När samma belopp dras till samma ställe minst två gånger räknar vi det som återkommande. Om det saknas i din abonnemangslista kan det vara en dold fast kostnad.',
      consequence: 'Sådana här "små" fasta kostnader är ofta det som gör att marginalen känns tight i slutet av månaden.',
      action: 'granska transaktionerna',
      actionLink: '/TransactionHistory',
      data: { names: unknownRecurring },
    });
  }

  // ── Buffert ───────────────────────────────────────────────────────────────
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
      title: 'Bufferten räcker knappt en månad',
      description: `Du har ${fmtKr(buffer)} kr i buffert mot ${fmtKr(totalFixed)} kr i fasta kostnader. En oväntad räkning kan sätta dig i minus innan lönen kommer.`,
      why: 'Buffert delat med dina fasta kostnader visar hur många månader du klarar utan inkomst. Under en månad är marginalen för tunn för de flesta oväntade utgifter.',
      consequence: 'Det är inte panik — men det är dags att prioritera buffert före nya utgifter.',
      action: 'sätta upp en sparplan',
      actionLink: '/Dashboard',
      data: { buffer, totalFixed, monthsOfBuffer },
    });
  } else if (monthsOfBuffer < 3) {
    insights.push({
      id: 'medium_buffer',
      type: 'warning',
      severity: 2,
      title: `Bufferten täcker ${monthsOfBuffer.toFixed(1)} månader`,
      description: `Med ${fmtKr(buffer)} kr klarar du en kort kris, men inte en längre period utan inkomst. Målet för de flesta är minst tre månaders fasta kostnader.`,
      why: 'Tre månaders fasta kostnader i buffert är en vanlig tumregel i Sverige — den ger tid att hitta ny inkomst utan att behöva ta nya lån direkt.',
      consequence: 'Varje extra tusenlapp i buffert gör vardagen lugnare när något oväntat händer.',
      action: 'bygga bufferten',
      actionLink: '/Dashboard',
      data: { monthsOfBuffer },
    });
  }

  // ── Sparkvot ──────────────────────────────────────────────────────────────
  if (profile.income > 0 && prevMonths.length >= 1) {
    const avgMonthlyExpenses = Object.values(prevSumsTotal).reduce((s, v) => s + v, 0) / numPrevMonths;
    const savingsRate = Math.max(0, (profile.income - avgMonthlyExpenses) / profile.income);
    if (savingsRate < 0.05) {
      const pct = Math.round(savingsRate * 100);
      const spareKr = Math.round(profile.income * 0.1 - (profile.income - avgMonthlyExpenses));
      insights.push({
        id: 'low_savings_rate',
        type: 'warning',
        severity: 2,
        title: 'Lite blir kvar till sparande',
        description: `Utifrån senaste månaderna hamnar bara ${pct}% av lönen kvar efter utgifter. För att nå 10% skulle du behöva frigöra ungefär ${fmtKr(Math.max(0, spareKr))} kr/mån.`,
        why: 'Sparkvot räknas som det som blir kvar av lönen efter snittutgifter. Under 5% brukar sparmål ta mycket längre tid — därför flaggar vi det tidigt.',
        consequence: 'Det betyder att sparmål tar längre tid — inte att du gjort något fel.',
        action: 'se var det finns utrymme',
        actionLink: '/Budget',
        data: { savingsRate },
      });
    }
  }

  // ── Kategori-spike (t.ex. mat) ────────────────────────────────────────────
  MOVABLE_CATEGORIES.forEach((cat) => {
    const curr = currentSums[cat] || 0;
    const prevAvg = prevMonths.length > 0 ? (prevSumsTotal[cat] || 0) / numPrevMonths : 0;
    if (prevAvg > 200 && curr > prevAvg * 1.35 && curr > 500) {
      const diff = Math.round(curr - prevAvg);
      const catLabel = CAT_LABELS[cat] || cat;
      const compare = findMoneyComparison(diff, profile, cat === 'food' ? 'food' : undefined);
      insights.push({
        id: `spike_${cat}`,
        type: 'warning',
        severity: 1,
        title: `${fmtKr(diff)} kr mer på ${catLabel}`,
        description: `Du la ${fmtKr(diff)} kr mer på ${catLabel} i ${monthName} än du brukar (${fmtKr(Math.round(prevAvg))} kr i snitt). Det är ${compare || 'en märkbar skillnad'} — ${coachInvite(`titta på ${catLabel}utgifterna`)}`,
        why: `Jag jämför ${catLabel} den här månaden med ditt snitt. När utgifterna ökar mer än 35% och över 500 kr totalt syns det ofta först i marginalen — inte i en enskild swish.`,
        consequence: 'Små ökningar i vardagskategorier är ofta det som äter marginalen först.',
        action: `granska ${catLabel}`,
        actionLink: `/TransactionHistory?category=${cat}`,
        data: { cat, curr, prevAvg, diff },
      });
    }
  });

  return insights.sort((a, b) => b.severity - a.severity);
}

/** Beräknar likviditetsprognos för kommande 30 dagar */
export function calcLiquidityForecast(profile, transactions) {
  if (!profile) return null;
  const today = new Date();
  const dayOfMonth = today.getDate();

  const last30 = transactions.filter((t) => {
    if (!EXPENSE_TYPES.includes(t.type)) return false;
    const d = new Date(t.created_date);
    const diffMs = today - d;
    return diffMs >= 0 && diffMs < 30 * 24 * 3600 * 1000;
  });
  const totalSpent30 = last30.reduce((s, t) => s + Math.abs(t.amount), 0);
  const avgDailySpend = totalSpent30 / 30;

  let remainingFixed = 0;
  const housingDay = profile.housingDueDay || 27;
  if (housingDay > dayOfMonth) remainingFixed += profile.housingCost || 0;
  (profile.loans || []).forEach((l, i) => {
    const day = 5 + i;
    if (day > dayOfMonth) remainingFixed += l.monthlyPayment || 0;
  });
  (profile.subscriptions || []).forEach((s, i) => {
    const day = s.billingDay || 10 + i;
    if (day > dayOfMonth) remainingFixed += s.amount || 0;
  });

  const projectedVariableSpend = avgDailySpend * (30 - dayOfMonth);
  const currentBuffer = profile.buffer || 0;
  const projectedBalance = currentBuffer - remainingFixed - projectedVariableSpend;

  return {
    currentBuffer,
    remainingFixed,
    projectedVariableSpend: Math.round(projectedVariableSpend),
    projectedBalance: Math.round(projectedBalance),
    avgDailySpend: Math.round(avgDailySpend),
    daysLeft: 30 - dayOfMonth,
    daysToZero: projectedBalance <= 0 ? 0 : Math.floor(projectedBalance / avgDailySpend),
    isNegative: projectedBalance < 0,
  };
}
