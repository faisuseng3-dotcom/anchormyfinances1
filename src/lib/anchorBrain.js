/**
 * Anchor Brain — deterministisk ekonomimotor + ton/triggers för AI-lager.
 * LLM formulerar; denna modul räknar och bestämmer när.
 */
import { getMonthlyMargin } from '@/lib/financialUtils';

const EXPENSE_TYPES = new Set(['expense', 'shopping']);

function txDate(t) {
  return new Date(t.created_date || t.date || 0);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function needsMoodCheckIn(profile) {
  if (!profile?.onboardingCompleted) return false;
  return profile.sessionMoodDate !== todayKey();
}

export function moodToToneMode(mood) {
  if (mood === 'stressed') return 'soft';
  if (mood === 'motivated') return 'coach';
  return 'normal';
}

export function getToneInstructions(profile) {
  const tone = profile?.toneMode || moodToToneMode(profile?.sessionMood) || 'normal';
  const style = profile?.communicationStyle || 'balanced';
  const city = profile?.city?.trim();

  const toneBlock =
    tone === 'soft'
      ? 'TON: Användaren känner sig stressad. Mjuk, kort text. Ingen skuld. Max 2 meningar där möjligt. Undvik tunga tabeller.'
      : tone === 'coach'
        ? 'TON: Användaren är motiverad. Konkreta mål och nästa steg. Energi men inte pushy.'
        : 'TON: Lugn och tydlig vardagston.';

  const styleBlock =
    style === 'reassuring'
      ? 'STIL: Bekräfta först, ge kontroll. Undvik skrämsel. Fokus trygghet och små steg.'
      : style === 'direct'
        ? 'STIL: Tydliga risker och konsekvenser i kronor. Kort och rak kommunikation.'
        : 'STIL: Balanserat — både empati och tydliga siffror.';

  const cityBlock = city
    ? `KONTEXT: Användaren bor i ${city}. Erkänn att boendekostnader kan vara höga — det är strukturellt, inte personligt misslyckande.`
    : 'KONTEXT: Sverige — kontantlöst samhälle gör pengar osynliga; förklara med konkreta kvar-belopp.';

  return `${toneBlock}\n${styleBlock}\n${cityBlock}\nALDRIG: "du spenderar för mycket" eller skuldbeläggning.`;
}

/** Digital sedelbunt — vecko- och dagskvar. */
export function calculatePengometer(profile, transactions = []) {
  const margin = getMonthlyMargin(profile);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const monthExpenses = (transactions || []).filter((t) => {
    if (!EXPENSE_TYPES.has(t.type) && t.amount >= 0) return false;
    const d = txDate(t);
    return d >= monthStart && !Number.isNaN(d.getTime());
  });

  const spentMonth = monthExpenses.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const spentWeek = monthExpenses
    .filter((t) => txDate(t) >= weekAgo)
    .reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const spentToday = monthExpenses
    .filter((t) => txDate(t) >= dayStart)
    .reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  const weeklyBudget = margin > 0 ? Math.round((margin / 30) * 7) : 0;
  const remainingWeek = Math.max(0, weeklyBudget - spentWeek);
  const remainingMonth = Math.max(0, margin - spentMonth);
  const daysLeft = Math.max(1, 30 - now.getDate());
  const dailyAllowance = margin > 0 ? Math.round(remainingMonth / daysLeft) : 0;

  const weekPct = weeklyBudget > 0 ? Math.min(spentWeek / weeklyBudget, 1.2) : 0;
  const fillPct = weeklyBudget > 0 ? Math.max(0, 1 - weekPct) : 1;

  let status = 'ok';
  if (remainingWeek <= 0 && weeklyBudget > 0) status = 'empty';
  else if (fillPct < 0.25) status = 'low';
  else if (fillPct < 0.5) status = 'mid';

  return {
    remaining_week_kr: Math.round(remainingWeek),
    remaining_month_kr: Math.round(remainingMonth),
    remaining_today_kr: Math.max(0, Math.round(dailyAllowance - spentToday)),
    weekly_budget_kr: weeklyBudget,
    spent_week_kr: Math.round(spentWeek),
    spent_today_kr: Math.round(spentToday),
    fill_percent: Math.round(fillPct * 100),
    status,
    headline_kr: Math.round(remainingWeek),
    headline_label: 'kvar denna vecka',
  };
}

export function scanSubscriptions(profile, transactions = []) {
  const subs = profile?.subscriptions || [];
  const profileTotal = subs.reduce((s, x) => s + (x.amount || 0), 0);

  const recurringFromTx = detectRecurringFromTransactions(transactions);
  const hiddenKr = recurringFromTx
    .filter((r) => !subs.some((s) => s.name?.toLowerCase() === r.name.toLowerCase()))
    .reduce((s, r) => s + r.amount, 0);

  const totalKr = profileTotal + hiddenKr;
  const count = subs.length + (hiddenKr > 0 ? recurringFromTx.length - subs.length : 0);

  return {
    total_kr: Math.round(totalKr),
    profile_subs_kr: Math.round(profileTotal),
    hidden_recurring_kr: Math.round(hiddenKr),
    subscription_count: Math.max(subs.length, count),
    items: subs.map((s) => ({ name: s.name, kr: s.amount || 0, source: 'profile' })),
    share_line: `Jag betalar ${Math.round(totalKr).toLocaleString('sv-SE')} kr/mån på abonnemang i Anchor`,
  };
}

function detectRecurringFromTransactions(transactions) {
  const byMerchant = {};
  (transactions || []).forEach((t) => {
    if (t.type !== 'expense') return;
    const name = (t.description || t.name || '').trim().slice(0, 40);
    if (!name) return;
    const key = name.toLowerCase();
    if (!byMerchant[key]) byMerchant[key] = [];
    byMerchant[key].push(Math.abs(t.amount || 0));
  });

  return Object.entries(byMerchant)
    .filter(([, amounts]) => amounts.length >= 2)
    .map(([key, amounts]) => {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stable = amounts.every((a) => Math.abs(a - avg) < avg * 0.15);
      if (!stable) return null;
      return { name: key, amount: Math.round(avg) };
    })
    .filter(Boolean)
    .slice(0, 8);
}

export const ACADEMY_LESSONS = [
  {
    id: 'cashless_blindness',
    title: 'Osynliga pengar',
    trigger: 'always',
    durationSec: 60,
    topic: 'kontantlöst samhälle',
  },
  {
    id: 'compound_interest',
    title: 'Ränta på ränta',
    trigger: 'loan_added',
    durationSec: 60,
    topic: 'ränta och skulder',
  },
  {
    id: 'many_streams',
    title: 'Många bäckar små',
    trigger: 'subscriptions_high',
    durationSec: 60,
    topic: 'småutgifter som växer',
  },
  {
    id: 'inflation_basics',
    title: 'Inflation i praktiken',
    trigger: 'concern_plan',
    durationSec: 60,
    topic: 'inflation och köpkraft',
  },
  {
    id: 'buffer_why',
    title: 'Varför buffert',
    trigger: 'concern_debt',
    durationSec: 60,
    topic: 'buffert och stress',
  },
];

export function getTriggeredAcademyLesson(profile, pengometer, subScan) {
  const completed = profile?.academyCompleted || [];
  const candidates = [];

  if ((profile?.loans || []).length > 0 && !completed.includes('compound_interest')) {
    candidates.push('compound_interest');
  }
  if (subScan.total_kr >= 1500 && !completed.includes('many_streams')) {
    candidates.push('many_streams');
  }
  if (profile?.topConcern === 'plan' && !completed.includes('inflation_basics')) {
    candidates.push('inflation_basics');
  }
  if (profile?.topConcern === 'debt' && !completed.includes('buffer_why')) {
    candidates.push('buffer_why');
  }
  if (pengometer?.status === 'low' && !completed.includes('cashless_blindness')) {
    candidates.push('cashless_blindness');
  }
  if (!completed.includes('cashless_blindness')) candidates.push('cashless_blindness');

  const id = candidates.find((lid) => ACADEMY_LESSONS.some((l) => l.id === lid)) || 'cashless_blindness';
  return ACADEMY_LESSONS.find((l) => l.id === id) || ACADEMY_LESSONS[0];
}

export function enrichAdvisorSnapshot(profile, transactions, baseSnapshot) {
  const pengometer = calculatePengometer(profile, transactions);
  const subScan = scanSubscriptions(profile, transactions);
  return {
    ...baseSnapshot,
    pengometer,
    subscription_scan: subScan,
    session_mood: profile?.sessionMood || null,
    tone_mode: profile?.toneMode || moodToToneMode(profile?.sessionMood),
    communication_style: profile?.communicationStyle || 'balanced',
    city: profile?.city || null,
    top_concern: profile?.topConcern || null,
  };
}

export const MOOD_OPTIONS = [
  { id: 'calm', label: 'Lugnt', sub: 'Jag vill bara ha en snabb koll' },
  { id: 'stressed', label: 'Stressad', sub: 'Ekonomin känns tung just nu' },
  { id: 'motivated', label: 'Motiverad', sub: 'Jag vill ta tag i det' },
];

export const COMMUNICATION_STYLES = [
  { id: 'reassuring', label: 'Trygghet & kontroll', sub: 'Bekräftelse och små steg' },
  { id: 'balanced', label: 'Balanserat', sub: 'Empati och tydliga siffror' },
  { id: 'direct', label: 'Tydliga varningar', sub: 'Raka besked i kronor' },
];

export const CITY_PRESETS = [
  'Stockholm',
  'Göteborg',
  'Malmö',
  'Uppsala',
  'Övrig stad',
];
