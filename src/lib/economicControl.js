/**
 * "Ekonomisk kontroll" — veckor i rad med minst ett besök på Hem.
 */
const STORAGE_KEY = 'anchor_economic_control_weeks';

function isoWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function prevWeekKey(weekKey) {
  const [year, w] = weekKey.split('-W');
  const n = parseInt(w, 10);
  if (n > 1) return `${year}-W${String(n - 1).padStart(2, '0')}`;
  return `${parseInt(year, 10) - 1}-W52`;
}

export function recordEconomicControlVisit() {
  const week = isoWeekKey();
  const weeks = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  weeks.add(week);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...weeks]));
  return getConsecutiveControlWeeks();
}

export function getConsecutiveControlWeeks() {
  const weeks = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let count = 0;
  let cursor = isoWeekKey();
  while (weeks.has(cursor)) {
    count += 1;
    cursor = prevWeekKey(cursor);
  }
  return count;
}
