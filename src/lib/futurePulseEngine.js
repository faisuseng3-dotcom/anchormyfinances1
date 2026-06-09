// @ts-nocheck
/**
 * futurePulseEngine — Deterministic 60-day forecast for Framtidspuls.
 * Powers the scroll timeline locally; AI layer enriches narrative on top.
 */

import {
  buildUpcomingExpenses,
  getUpcomingDates,
  calculateRunningBalance,
} from '@/components/pulse/pulseEngine';
import { calcLiquidityForecast } from '@/lib/insightEngine';

const EXPENSE_TYPES = ['expense', 'savings_deposit', 'transfer_to_savings'];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtWindow(dayOffset) {
  if (dayOffset <= 0) return 'Idag';
  if (dayOffset === 1) return 'Imorgon';
  if (dayOffset <= 7) return `Om ${dayOffset} dagar`;
  if (dayOffset <= 14) return 'Om ca 1–2 veckor';
  if (dayOffset <= 21) return 'Om ca 2–3 veckor';
  if (dayOffset <= 35) return 'Om ca en månad';
  return 'Om ca 1–2 månader';
}

function statusFromBalance(balance, profile) {
  const fixed =
    (profile?.housingCost || 0) +
    (profile?.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0) +
    (profile?.loans || []).reduce((s, x) => s + (x.monthlyPayment || 0), 0);
  const warnThreshold = Math.max(2000, fixed * 0.25);

  if (balance < 0) return 'röd';
  if (balance < warnThreshold) return 'gul';
  return 'grön';
}

function statusLabel(statusKey) {
  if (statusKey === 'röd') return 'Rött (Kritisk)';
  if (statusKey === 'gul') return 'Gult (Varning)';
  return 'Grönt (Stabil)';
}

/** Build fixed + income events for the next N days */
function buildEvents(profile, horizonDays = 60) {
  const expenses = buildUpcomingExpenses(profile);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const incomeDay = profile?.incomeDay || 25;
  const incomeAmount = profile?.income || 0;
  const events = [];

  for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
    const d = addDays(today, dayOffset);
    const dayOfMonth = d.getDate();

    expenses.forEach((exp) => {
      if (dayOfMonth === exp.dueDay) {
        events.push({
          ...exp,
          date: d,
          dayOffset,
        });
      }
    });

    if (dayOffset > 0 && dayOfMonth === incomeDay && incomeAmount > 0) {
      events.push({
        id: 'income',
        name: 'Lön / Inkomst',
        amount: incomeAmount,
        date: d,
        dayOffset,
        priority: 'income',
        icon: 'income',
      });
    }
  }

  events.sort((a, b) => a.date - b.date);
  return events;
}

/** Average daily variable spend from last 14 days of expenses */
function avgDailyVariableSpend(transactions) {
  const today = new Date();
  const cutoff = addDays(today, -14);
  const recent = (transactions || []).filter((t) => {
    if (!EXPENSE_TYPES.includes(t.type) && t.amount >= 0) return false;
    const d = new Date(t.created_date);
    return d >= cutoff && d <= today;
  });
  if (recent.length === 0) return 0;
  const total = recent.reduce((s, t) => s + Math.abs(t.amount), 0);
  return total / 14;
}

/** Detect spending trend: compare last 14d vs prior 14d */
function spendingTrend(transactions) {
  const today = new Date();
  const d14 = addDays(today, -14);
  const d28 = addDays(today, -28);

  const sumRange = (from, to) =>
    (transactions || [])
      .filter((t) => {
        if (!EXPENSE_TYPES.includes(t.type) && t.amount >= 0) return false;
        const d = new Date(t.created_date);
        return d >= from && d < to;
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);

  const recent = sumRange(d14, today);
  const prior = sumRange(d28, d14);
  if (prior < 500) return null;
  const pct = Math.round(((recent - prior) / prior) * 100);
  if (Math.abs(pct) < 10) return null;
  return { recent, prior, pct, rising: pct > 0 };
}

/**
 * Core local forecast — returns UI-ready JSON matching futureEngine schema.
 */
export function computeLocalFuturePulse(
  profile,
  transactions,
  horizonDays = 60,
  maxEvents = 2,
  scenario = {},
) {
  if (!profile) {
    return emptyForecast('Skapa din profil för att se framtiden.');
  }

  const { spendMult = 1, saveBoostKr = 0 } = scenario;
  const startBalance = profile.buffer ?? 0;
  const events = buildEvents(profile, horizonDays);
  const withBalance = calculateRunningBalance(events, startBalance);
  const dailySpend = Math.max(
    0,
    avgDailyVariableSpend(transactions) * spendMult - saveBoostKr / 30,
  );

  // Daily timeline with variable spend bleed + event jumps
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventByDay = {};
  withBalance.forEach((e) => {
    eventByDay[e.dayOffset] = e;
  });

  const tidslinje = [];
  let balance = startBalance;
  let minBalance = startBalance;
  let minDay = 0;

  for (let day = 0; day <= horizonDays; day++) {
    if (day > 0) balance -= dailySpend;

    const ev = eventByDay[day];
    if (ev) {
      if (ev.priority === 'income') balance += ev.amount;
      else balance -= ev.amount;
    }

    balance = Math.round(balance);
    if (balance < minBalance) {
      minBalance = balance;
      minDay = day;
    }

    tidslinje.push({
      dag: day,
      saldo: balance,
      status: statusFromBalance(balance, profile),
      datum: addDays(today, day).toISOString().split('T')[0],
      händelse: ev ? ev.name : null,
      ikon: ev?.icon || null,
    });
  }

  const overallStatus = statusFromBalance(minBalance, profile);
  const day30 = tidslinje[Math.min(30, tidslinje.length - 1)];

  const liquidity = calcLiquidityForecast(profile, transactions || []);
  const trend = spendingTrend(transactions);

  const framtida_handelser = [];

  // Critical dips
  withBalance
    .filter((e) => e.balanceAfter < 0 && e.priority !== 'income')
    .slice(0, 2)
    .forEach((e) => {
    framtida_handelser.push({
      tidsfönster: fmtWindow(e.dayOffset),
      dag_offset: e.dayOffset,
      händelse: `Efter ${e.name} riskerar saldot bli minus`,
      ai_losning: `Buffra ${Math.abs(e.balanceAfter + 500).toLocaleString('sv-SE')} kr nu`,
      saldo_efter: e.balanceAfter,
      typ: 'kritisk',
    });
    });

  // Clustered subscriptions same week
  const subEvents = withBalance.filter((e) => e.id?.startsWith('sub-'));
  const subClusters = subEvents.reduce((acc, e) => {
    const week = Math.floor(e.dayOffset / 7);
    if (!acc[week]) acc[week] = [];
    acc[week].push(e);
    return acc;
  }, {});
  Object.entries(subClusters).forEach(([, cluster]) => {
    if (cluster.length >= 2 && framtida_handelser.length < 4) {
      const total = cluster.reduce((s, e) => s + e.amount, 0);
      const first = cluster[0];
      framtida_handelser.push({
        tidsfönster: fmtWindow(first.dayOffset),
        dag_offset: first.dayOffset,
        händelse: `${cluster.length} abonnemang · ${total.toLocaleString('sv-SE')} kr`,
        ai_losning: 'Buffra kontot före dragningen',
        typ: 'varning',
      });
    }
  });

  // Spending trend projection
  if (trend?.rising && framtida_handelser.length < 4) {
    const projectedExtra = Math.round((trend.recent - trend.prior) * 2);
    framtida_handelser.push({
      tidsfönster: 'Nästa månad',
      dag_offset: 30,
      händelse: `Småköp +${trend.pct}% senaste 2 v`,
      ai_losning: `Spara ~${projectedExtra.toLocaleString('sv-SE')} kr/mån`,
      typ: 'trend',
    });
  }

  // Positive: income incoming
  const nextIncome = withBalance.find((e) => e.priority === 'income');
  if (nextIncome && minBalance >= 0 && framtida_handelser.length < 4) {
    framtida_handelser.push({
      tidsfönster: fmtWindow(nextIncome.dayOffset),
      dag_offset: nextIncome.dayOffset,
      händelse: `Lön ${nextIncome.amount.toLocaleString('sv-SE')} kr`,
      ai_losning: 'Fyll buffert direkt efter lön',
      typ: 'möjlighet',
    });
  }

  const coach_meddelande = buildCoachMessage({
    overallStatus,
    minBalance,
    minDay,
    day30Balance: day30?.saldo,
    liquidity,
    profile,
  });

  return compactFuturePulse({
    framtids_status: statusLabel(overallStatus),
    status_key: overallStatus,
    prognos_30_dagar: `${(day30?.saldo ?? startBalance).toLocaleString('sv-SE')} kr om 30 dagar`,
    coach_meddelande,
    framtida_handelser: framtida_handelser.slice(0, maxEvents),
    tidslinje,
    _meta: { source: 'local', minBalance, minDay, dailySpend: Math.round(dailySpend), startBalance },
  });
}

function buildCoachMessage({ overallStatus, minBalance, minDay, day30Balance, liquidity, profile }) {
  const name = profile?.displayName?.split(' ')[0];
  const greeting = name ? `${name}, ` : '';

  if (overallStatus === 'grön') {
    return `${greeting}det ser lugnt ut framåt — du har buffert att falla tillbaka på.`;
  }

  if (overallStatus === 'gul') {
    return `${greeting}det blir lite tajt snart, men inget du inte kan styra — håll koll på vardagsköpen.`;
  }

  return `${greeting}en tight period väntar — jag visar stegen nedan så du slipper gissa.`;
}

const STATUS_SHORT = { grön: 'Stabil', gul: 'Tight', röd: 'Kritisk' };

function truncate(str, max) {
  if (!str) return '';
  const s = String(str).trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trim()}…`;
}

function firstSentence(str, max = 90) {
  if (!str) return '';
  const s = String(str).trim();
  const cut = s.split(/[.!?\n]/)[0].trim();
  return truncate(cut, max);
}

/** Plockar ut saldo-siffra för UI */
export function extractSaldo30(forecast) {
  const day30 = forecast?.tidslinje?.[Math.min(30, (forecast.tidslinje?.length || 1) - 1)];
  if (day30 != null) return `${Math.round(day30.saldo).toLocaleString('sv-SE')} kr`;
  const m = String(forecast?.prognos_30_dagar || '').match(/([\d\s]+)\s*kr/i);
  return m ? `${m[1].trim()} kr` : '—';
}

function compactEvent(ev) {
  return {
    ...ev,
    tidsfönster: truncate(ev.tidsfönster, 18),
    händelse: truncate(ev.händelse, 48),
    ai_losning: truncate(ev.ai_losning, 52),
  };
}

/** Gör prognos läsbar på en överblick */
export function compactFuturePulse(forecast, options = {}) {
  if (!forecast) return forecast;
  const { full = false } = options;
  const key = forecast.status_key || 'grön';
  const base = {
    ...forecast,
    status_label: STATUS_SHORT[key] || 'Okänd',
    status_key: key,
    prognos_saldo_30: extractSaldo30(forecast),
    idag_saldo: forecast.tidslinje?.[0]?.saldo ?? forecast._meta?.startBalance,
    min_saldo: forecast._meta?.minBalance,
    min_dag: forecast._meta?.minDay,
  };
  if (full) {
    return {
      ...base,
      coach_meddelande: forecast.coach_meddelande,
      framtida_handelser: forecast.framtida_handelser || [],
    };
  }
  return {
    ...base,
    coach_meddelande: firstSentence(forecast.coach_meddelande, 90),
    framtida_handelser: (forecast.framtida_handelser || []).slice(0, 2).map(compactEvent),
  };
}

function emptyForecast(message) {
  return compactFuturePulse({
    framtids_status: 'Grönt (Stabil)',
    status_key: 'grön',
    prognos_30_dagar: '—',
    coach_meddelande: message,
    framtida_handelser: [],
    tidslinje: [],
    _meta: { source: 'empty' },
  });
}

/** Slim payload for AI — avoid token bloat */
export function summarizeForFutureEngine(profile, transactions) {
  const cutoff = addDays(new Date(), -90);
  const recent = (transactions || [])
    .filter((t) => t.context !== 'BUSINESS' && new Date(t.created_date) >= cutoff)
    .slice(0, 200)
    .map((t) => ({
      amount: t.amount,
      date: t.created_date,
      category: t.category,
      vendor: t.vendor || t.label,
      type: t.type,
    }));

  return {
    profile: {
      income: profile?.income,
      buffer: profile?.buffer,
      housingCost: profile?.housingCost,
      housingDueDay: profile?.housingDueDay,
      incomeDay: profile?.incomeDay || 25,
      subscriptions: profile?.subscriptions || [],
      loans: profile?.loans || [],
      budgetLimits: profile?.budgetLimits,
    },
    transactions: recent,
  };
}

/** Merge AI narrative onto local math — lokala siffror vinner, kort text only */
export function mergeFuturePulse(local, ai) {
  if (!ai || ai.error) return compactFuturePulse(local);

  const statusKey = parseStatusKey(ai.framtids_status) || local.status_key;
  const aiCoachOk = ai.coach_meddelande && ai.coach_meddelande.length <= 100;
  const aiEventsOk =
    ai.framtida_handelser?.length > 0 &&
    ai.framtida_handelser.every(
      (e) => (e.händelse?.length || 0) <= 55 && (e.ai_losning?.length || 0) <= 55,
    );

  const merged = {
    ...local,
    status_key: statusKey,
    framtids_status: statusLabel(statusKey),
    prognos_30_dagar: local.prognos_30_dagar,
    coach_meddelande: aiCoachOk ? ai.coach_meddelande : local.coach_meddelande,
    framtida_handelser: aiEventsOk ? ai.framtida_handelser.slice(0, 2) : local.framtida_handelser,
    _meta: { ...local._meta, source: 'ai+local' },
  };

  return compactFuturePulse(merged);
}

function parseStatusKey(label) {
  if (!label) return null;
  const l = label.toLowerCase();
  if (l.includes('röd') || l.includes('kritisk')) return 'röd';
  if (l.includes('gul') || l.includes('varning')) return 'gul';
  if (l.includes('grön') || l.includes('stabil')) return 'grön';
  return null;
}

/** Export pattern summary for backend prompt enrichment */
export function extractPatterns(profile, transactions) {
  const trend = spendingTrend(transactions);
  const recurring = {};
  (transactions || []).forEach((t) => {
    const key = (t.vendor || t.label || '').toLowerCase().trim();
    if (key) recurring[key] = (recurring[key] || 0) + 1;
  });
  const topRecurring = Object.entries(recurring)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return { spendingTrend: trend, recurring: topRecurring, subscriptions: profile?.subscriptions || [] };
}

/** Utökad coach och kommande utgifter för detaljsidan */
export function enrichFuturePulseDetail(forecast, profile) {
  const buffer = profile?.buffer ?? 0;
  const incomeDay = profile?.incomeDay || 25;
  const income = profile?.income || 0;
  const expenses = buildUpcomingExpenses(profile);
  const upcoming = calculateRunningBalance(
    getUpcomingDates(expenses, buffer, incomeDay, income),
    buffer,
  );

  const statusKey = forecast.status_key || 'grön';
  const minDay = forecast._meta?.minDay ?? 0;
  const minBal = forecast._meta?.minBalance ?? 0;
  const dailySpend = forecast._meta?.dailySpend ?? 0;

  let coach_detaljer = forecast.coach_meddelande || '';
  if (statusKey === 'grön') {
    coach_detaljer =
      `${coach_detaljer} Din buffert och inkomst täcker planerade utgifter de närmaste veckorna. ` +
      `Fortsätt som vanligt — jag flaggar om något ändras.`;
  } else if (statusKey === 'gul') {
    coach_detaljer =
      `${coach_detaljer} Lägsta punkt runt dag ${minDay} (${Math.round(minBal).toLocaleString('sv-SE')} kr). ` +
      `Planera mindre frivilliga köp tills nästa inkomst.`;
  } else {
    coach_detaljer =
      `${coach_detaljer} Du kan behöva buffra eller skjuta på utgifter före dag ${minDay}. ` +
      `Stegen nedan är sorterade efter vad som ger mest effekt.`;
  }

  const kommande_utgifter = upcoming
    .filter((e) => e.dayOffset >= 0 && e.dayOffset <= 45)
    .slice(0, 14)
    .map((e) => ({
      dag: e.dayOffset,
      datum: e.date instanceof Date ? e.date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : '',
      namn: e.name,
      belopp: e.priority === 'income' ? e.amount : -e.amount,
      saldo_efter: e.balanceAfter,
      typ: e.priority,
      ikon: e.icon,
    }));

  const dagar_med_händelse = (forecast.tidslinje || []).filter((d) => d.händelse).slice(0, 20);

  return {
    ...forecast,
    ...compactFuturePulse(forecast, { full: true }),
    coach_detaljer,
    kommande_utgifter,
    dagar_med_händelse,
    daglig_spend: dailySpend,
    inkomst_dag: incomeDay,
    buffert: buffer,
    manadsinkomst: income,
    framtida_handelser: forecast.framtida_handelser || [],
  };
}