/**
 * leakageEngine — Läckagedetektorn för Anchor Personal.
 * Hittar dolda abonnemang, dubbletter och vanemönster i transaktionsdata.
 */

import { normalizeMerchant } from '@/lib/merchantNormalize';

const EXPENSE_TYPES = ['expense', 'shopping', 'savings_deposit', 'transfer_to_savings'];

const STREAMING_KEYWORDS = [
  'netflix', 'spotify', 'hbo', 'viaplay', 'disney', 'apple tv', 'youtube',
  'tidal', 'storytel', 'bookbeat', 'prime video', 'discovery', 'tv4 play',
];

const COFFEE_KEYWORDS = [
  'espresso', 'starbucks', 'wayne', 'pressbyr', 'café', 'cafe', 'coffee',
  'espresso house', 'waynes', 'java', 'barista', 'kaffe',
];

const GYM_KEYWORDS = ['gym', 'sats', 'friskis', 'nordic wellness', 'actic', 'fitness'];

function fmt(n) {
  return Math.round(n || 0).toLocaleString('sv-SE');
}

function isExpense(tx) {
  return EXPENSE_TYPES.includes(tx.type) || (tx.amount < 0 && tx.type !== 'income');
}

function normalizeVendor(str) {
  return normalizeMerchant(str) || (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function matchesKeywords(text, keywords) {
  const t = normalizeVendor(text);
  return keywords.some((k) => t.includes(k));
}

function daysBetween(a, b) {
  return Math.abs(a - b) / 86400000;
}

function toMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Återkommande betalningar som inte finns i profilens abonnemangslista */
function detectUnknownRecurring(transactions, profile) {
  const profileSubs = (profile?.subscriptions || []).map((s) => ({
    name: normalizeVendor(s.name),
    amount: s.amount || 0,
  }));

  const byKey = {};
  (transactions || []).filter(isExpense).forEach((tx) => {
    const vendor = normalizeVendor(tx.vendor || tx.label);
    if (!vendor || vendor.length < 2) return;
    const amount = Math.abs(tx.amount);
    const key = `${vendor}::${Math.round(amount)}`;
    if (!byKey[key]) byKey[key] = { vendor, amount, dates: [] };
    byKey[key].dates.push(new Date(tx.created_date));
  });

  const leaks = [];
  Object.values(byKey).forEach(({ vendor, amount, dates }) => {
    if (dates.length < 2 || amount < 15) return;

    dates.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < dates.length; i++) intervals.push(daysBetween(dates[i], dates[i - 1]));

    const avgInterval = intervals.reduce((s, d) => s + d, 0) / intervals.length;
    const isMonthly = avgInterval >= 20 && avgInterval <= 40;
    if (!isMonthly && dates.length < 3) return;

    const known = profileSubs.some(
      (s) =>
        (s.name && (vendor.includes(s.name) || s.name.includes(vendor))) ||
        Math.abs(s.amount - amount) < 2,
    );
    if (known) return;

    leaks.push({
      id: `recurring_${vendor.slice(0, 20)}`,
      type: 'subscription',
      severity: 2,
      title: `Glömt abonnemang: ${capitalize(vendor)}`,
      description: `${amount.toLocaleString('sv-SE')} kr dras ungefär varje månad — inte registrerat i din budget.`,
      monthlyAmount: amount,
      vendors: [vendor],
      action: 'Granska transaktioner',
      actionLink: '/TransactionHistory',
    });
  });

  return leaks;
}

/** Flera streaming-/nöjestjänster som överlappar */
function detectDuplicateStreaming(transactions) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 90);

  const services = new Map();
  (transactions || []).filter(isExpense).forEach((tx) => {
    const d = new Date(tx.created_date);
    if (d < cutoff) return;
    const text = normalizeVendor(`${tx.vendor || ''} ${tx.label || ''}`);
    STREAMING_KEYWORDS.forEach((kw) => {
      if (text.includes(kw)) {
        const amount = Math.abs(tx.amount);
        if (!services.has(kw)) services.set(kw, { keyword: kw, total: 0, count: 0, lastAmount: amount });
        const s = services.get(kw);
        s.total += amount;
        s.count += 1;
        s.lastAmount = amount;
      }
    });
  });

  if (services.size < 2) return [];

  const entries = [...services.values()];
  const monthlyEst = entries.reduce((s, e) => s + (e.lastAmount || e.total / Math.max(e.count, 1)), 0);
  const names = entries.map((e) => capitalize(e.keyword)).join(', ');

  return [{
    id: 'duplicate_streaming',
    type: 'duplicate',
    severity: 2,
    title: 'Flera streamingtjänster',
    description: `Du betalar för ${services.size} tjänster (${names}) som delvis gör samma sak.`,
    monthlyAmount: Math.round(monthlyEst),
    vendors: entries.map((e) => e.keyword),
    action: 'Se underhållning',
    actionLink: '/TransactionHistory?category=entertainment',
  }];
}

/** Småköp mat/kaffe i farten — trend senaste 30 dagarna */
function detectHabitLeak(transactions, keywords, config) {
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);

  let recent = 0;
  let prior = 0;
  let count = 0;

  (transactions || []).filter(isExpense).forEach((tx) => {
    const text = `${tx.vendor || ''} ${tx.label || ''}`;
    const cat = tx.category || '';
    const amount = Math.abs(tx.amount);
    const d = new Date(tx.created_date);

    const match =
      matchesKeywords(text, keywords) ||
      (config.category && cat === config.category && amount <= (config.maxAmount || 200));

    if (!match) return;

    if (d >= d30) {
      recent += amount;
      count += 1;
    } else if (d >= d60) {
      prior += amount;
    }
  });

  if (recent < (config.minTotal || 400) || count < (config.minCount || 4)) return null;

  const monthlyEst = recent;
  const rising = prior > 0 && recent > prior * 1.1;

  return {
    id: config.id,
    type: 'habit',
    severity: rising ? 2 : 1,
    title: config.title,
    description: config.description(recent, count, rising, prior),
    monthlyAmount: Math.round(monthlyEst),
    action: config.action,
    actionLink: config.actionLink,
  };
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildSavingsStory(totalMonthly, profile) {
  if (totalMonthly <= 0) {
    return 'Bra koll — inga uppenbara läckage just nu.';
  }

  const monthsToNyar = (() => {
    const now = new Date();
    const nyar = new Date(now.getFullYear(), 11, 31);
    if (now > nyar) return 12;
    return Math.max(1, Math.ceil((nyar - now) / (30 * 86400000)));
  })();

  const untilNyar = Math.round(totalMonthly * monthsToNyar);
  const goal = profile?.savingsGoalMonthlyTarget || profile?.savingsGoal || 0;

  if (untilNyar >= 5000) {
    return (
      `Om vi stryper detta sparar du ${fmt(totalMonthly)} kr/mån — ` +
      `till nyår blir det ${fmt(untilNyar)} kr extra i plånboken.` +
      (goal ? ` Det räcker långt mot ditt sparmål.` : '')
    );
  }

  return `Du lämnar cirka ${fmt(totalMonthly)} kr/mån på bordet. Appen betalar sig själv om du stänger det du inte använder.`;
}

function buildHeadline(leaks, totalMonthly) {
  if (leaks.length === 0) return 'Inga läckage hittade';
  if (leaks.length === 1) return `1 dold kostnad — spara ${fmt(totalMonthly)} kr/mån`;
  return `${leaks.length} dolda kostnader — spara ${fmt(totalMonthly)} kr/mån`;
}

/**
 * Huvudfunktion — returnerar läckage-lista + sammanfattning.
 */
export function runLeakageDetector(profile, transactions) {
  if (!transactions?.length) {
    return {
      leaks: [],
      totalMonthlyLeak: 0,
      annualSaving: 0,
      headline: 'Importera transaktioner',
      savingsStory: 'Ladda upp ett kontoutdrag så hittar vi dolda abonnemang och onödiga utgifter åt dig.',
      hasLeaks: false,
    };
  }

  const personalTxs = (transactions || []).filter((t) => t.context !== 'BUSINESS');

  const rawLeaks = [
    ...detectUnknownRecurring(personalTxs, profile),
    ...detectDuplicateStreaming(personalTxs),
    detectHabitLeak(personalTxs, COFFEE_KEYWORDS, {
      id: 'coffee_habit',
      category: 'food',
      maxAmount: 180,
      minTotal: 350,
      minCount: 5,
      title: 'Kaffe & småköp i farten',
      description: (recent, count, rising) =>
        `Du lagt ${fmt(recent)} kr på kaffe och snabbmat senaste månaden (${count} köp)` +
        (rising ? ' — trenden ökar.' : '.'),
      action: 'Visa matutgifter',
      actionLink: '/TransactionHistory?category=food',
    }),
    detectHabitLeak(personalTxs, GYM_KEYWORDS, {
      id: 'gym_overlap',
      category: 'health',
      maxAmount: 800,
      minTotal: 500,
      minCount: 2,
      title: 'Gym & hälsa — dubbelkoll',
      description: (recent) =>
        `${fmt(recent)} kr på gym/hälsa senaste månaden. Har du flera medlemskap du glömde?`,
      action: 'Visa hälsa',
      actionLink: '/TransactionHistory?category=health',
    }),
  ].filter(Boolean);

  // Deduplicate overlapping monthly amounts (keep higher severity)
  const seen = new Set();
  const leaks = rawLeaks
    .sort((a, b) => b.severity - a.severity || b.monthlyAmount - a.monthlyAmount)
    .filter((l) => {
      const key = l.type === 'subscription' ? l.vendors?.[0] : l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const totalMonthlyLeak = leaks.reduce((s, l) => s + (l.monthlyAmount || 0), 0);

  return {
    leaks,
    totalMonthlyLeak,
    annualSaving: totalMonthlyLeak * 12,
    headline: buildHeadline(leaks, totalMonthlyLeak),
    savingsStory: buildSavingsStory(totalMonthlyLeak, profile),
    hasLeaks: leaks.length > 0,
  };
}

export { fmt as fmtLeakageSek };
