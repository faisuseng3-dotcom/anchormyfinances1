/**
 * North Star Metric för Lago:
 * Användare som öppnar appen ≥3 gånger/vecka för att kolla "Säkert att spendera".
 */
export const NORTH_STAR = {
  id: 'weekly_safe_to_spend_opens',
  label: 'Veckovis koll på Säkert att spendera',
  description: 'Användare som öppnar Lago minst 3 gånger per vecka för att kolla sitt Säkert att spendera.',
  targetPerWeek: 3,
};

const STORAGE_KEY = 'anchor_north_star_views';

function isoWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Registrera att användaren såg Säkert att spendera (Hem). */
export function recordSafeToSpendView() {
  const today = new Date().toISOString().slice(0, 10);
  const week = isoWeekKey();
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!data[week]) data[week] = [];
  if (!data[week].includes(today)) {
    data[week].push(today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data[week].length;
}

export function getWeeklyOpenCount(date = new Date()) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return (data[isoWeekKey(date)] || []).length;
}

export function isNorthStarOnTrack(date = new Date()) {
  return getWeeklyOpenCount(date) >= NORTH_STAR.targetPerWeek;
}
