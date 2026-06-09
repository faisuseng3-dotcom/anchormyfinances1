/**
 * Ekonomikalender — automatiska (abonnemang, lön) + användarens planerade händelser.
 */

const WEEKDAYS_SV = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

const SUB_ICONS = {
  streaming: 'subscription',
  entertainment: 'entertainment',
  transport: 'transport',
  health: 'health',
  food: 'food',
  insurance: 'other',
  other: 'other',
};

const PLAN_ICONS = {
  social: 'food',
  food: 'food',
  travel: 'travel',
  gift: 'shopping',
  health: 'health',
  other: 'other',
};

const DUE_DAYS = [8, 12, 15, 18, 22, 27];

export const EVENT_COLORS = {
  bill: '#E8856B',
  income: '#34D399',
  planned: '#6B9FFF',
};

export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getMonthLabel(year, month) {
  const name = MONTHS_SV[month];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

export function getWeekdayLabels() {
  return WEEKDAYS_SV;
}

/** Måndag som första veckodag */
export function getCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells = [];

  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--) {
    const day = prevMonthLast - i;
    cells.push({
      date: new Date(year, month - 1, day),
      inMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(year, month, d),
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - startPad - daysInMonth + 1;
    cells.push({
      date: new Date(year, month + 1, nextDay),
      inMonth: false,
    });
  }

  return cells;
}

function buildAutoEventsForDate(profile, date) {
  const events = [];
  const day = date.getDate();
  const incomeDay = profile?.incomeDay || 25;
  const income = profile?.income || 0;

  if (day === incomeDay && income > 0) {
    events.push({
      id: `income-${formatDateKey(date)}`,
      source: 'auto',
      type: 'income',
      title: 'Lön',
      amount: income,
      color: EVENT_COLORS.income,
    });
  }

  const housingDay = profile?.housingDueDay || 27;
  const housingCost = profile?.housingCost || 0;
  if (day === housingDay && housingCost > 0) {
    events.push({
      id: `housing-${formatDateKey(date)}`,
      source: 'auto',
      type: 'bill',
      title: 'Boende',
      amount: -housingCost,
      color: EVENT_COLORS.bill,
    });
  }

  (profile?.loans || []).forEach((loan, i) => {
    const dueDay = loan.billingDay || 25;
    if (day === dueDay && loan.monthlyPayment > 0) {
      events.push({
        id: `loan-${i}-${formatDateKey(date)}`,
        source: 'auto',
        type: 'bill',
        title: loan.name || 'Lån',
        amount: -(loan.monthlyPayment || 0),
        color: EVENT_COLORS.bill,
      });
    }
  });

  (profile?.subscriptions || []).forEach((sub, i) => {
    const dueDay = sub.billingDay || DUE_DAYS[i % DUE_DAYS.length];
    if (day === dueDay && sub.amount > 0) {
      events.push({
        id: `sub-${i}-${formatDateKey(date)}`,
        source: 'auto',
        type: 'bill',
        title: sub.name || 'Abonnemang',
        amount: -(sub.amount || 0),
        icon: SUB_ICONS[sub.category] || 'other',
        color: EVENT_COLORS.bill,
      });
    }
  });

  return events;
}

export function getEventsForDate(profile, date) {
  const key = formatDateKey(date);
  const auto = buildAutoEventsForDate(profile, date);
  const planned = (profile?.plannedEvents || [])
    .filter((e) => e.date === key)
    .map((e) => ({
      id: e.id,
      source: 'planned',
      type: 'planned',
      title: e.title,
      amount: -(e.amount || 0),
      category: e.category || 'other',
      note: e.note,
      icon: PLAN_ICONS[e.category] || PLAN_ICONS.other,
      color: EVENT_COLORS.planned,
    }));

  return [...auto, ...planned].sort((a, b) => {
    if (a.type === 'income') return -1;
    if (b.type === 'income') return 1;
    return 0;
  });
}

export function getMonthEventMap(profile, year, month) {
  const map = {};
  const grid = getCalendarGrid(year, month);
  grid.forEach(({ date }) => {
    const key = formatDateKey(date);
    const events = getEventsForDate(profile, date);
    if (events.length) map[key] = events;
  });
  return map;
}

export function getMonthSummary(profile, year, month) {
  const map = getMonthEventMap(profile, year, month);
  let plannedCount = 0;
  let autoCount = 0;
  let plannedTotal = 0;
  let outflow = 0;
  let inflow = 0;

  Object.values(map).forEach((events) => {
    events.forEach((ev) => {
      if (ev.source === 'planned') {
        plannedCount++;
        plannedTotal += Math.abs(ev.amount);
      } else {
        autoCount++;
      }
      if (ev.amount > 0) inflow += ev.amount;
      else outflow += Math.abs(ev.amount);
    });
  });

  return { plannedCount, autoCount, plannedTotal, outflow, inflow, net: inflow - outflow };
}

export function formatDayHeading(date) {
  const weekday = date.toLocaleDateString('sv-SE', { weekday: 'long' });
  const day = date.getDate();
  const month = MONTHS_SV[date.getMonth()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month}`;
}

export function formatKr(n) {
  return `${Math.round(Math.abs(n || 0)).toLocaleString('sv-SE')} kr`;
}

export function getUpcomingPreview(profile, limit = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const items = [];

  for (let i = 0; i < 45 && items.length < limit; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const events = getEventsForDate(profile, d);
    events.forEach((ev) => {
      if (items.length < limit) {
        items.push({
          ...ev,
          date: formatDateKey(d),
          dayLabel: i === 0 ? 'Idag' : i === 1 ? 'Imorgon' : d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
        });
      }
    });
  }

  return items.slice(0, limit);
}

export function createPlannedEvent({ date, title, amount, category, note }) {
  return {
    id: `pe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date,
    title: title.trim(),
    amount: Math.round(Number(amount) || 0),
    category: category || 'other',
    note: note?.trim() || '',
  };
}
