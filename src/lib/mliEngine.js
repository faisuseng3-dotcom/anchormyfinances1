/**
 * Mental Load Index™ (MLI) Engine
 * Beräknar ett kognitivt belastningsvärde 1–100 baserat på:
 * - U: Uncategorized ratio (30%)
 * - B: Buffer pressure (40%)
 * - A: Dismissed notifications (20%)
 * - C: Conflict frequency (10%)
 */

/**
 * Räknar andelen okategoriserade transaktioner senaste 30 dagarna.
 * @param {Array} transactions - PERSONAL-transaktioner
 * @returns {number} 0–1
 */
function calcUncategorizedRatio(transactions) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = transactions.filter(t => new Date(t.created_date).getTime() > thirtyDaysAgo);
  if (!recent.length) return 0;
  const uncategorized = recent.filter(t => !t.category || t.category === 'other').length;
  return uncategorized / recent.length;
}

/**
 * Mäter trycket mot bufferten baserat på kommande räkningar (fasta kostnader).
 * Hög skuld inom 7 dagar relativt buffert = högt tryck.
 * @param {object} profile - FinancialProfile
 * @returns {number} 0–1
 */
function calcBufferPressure(profile) {
  const buffer = profile?.buffer || 0;
  const fixedCosts = profile?.fixedCostItems
    ? profile.fixedCostItems.reduce((s, c) => s + (c.amount || 0), 0)
    : (profile?.housingCost || 0);
  // Approximera 7-dagars exponering som fixedCosts/4 (vecka av månaden)
  const weeklyExposure = fixedCosts / 4;
  if (!buffer && !weeklyExposure) return 0;
  if (buffer <= 0) return 1;
  const pressure = weeklyExposure / buffer;
  return Math.min(pressure, 1);
}

/**
 * Läser antal avvisade notiser från localStorage (Action Density).
 * @returns {number} 0–1
 */
function calcActionDensity() {
  const dismissed = parseInt(localStorage.getItem('anchor_dismissed_notifications') || '0', 10);
  // Normalisera: 5+ avvisade = maximal belastning
  return Math.min(dismissed / 5, 1);
}

/**
 * Kollar antal aktiva Budget vs Sparmål-konflikter.
 * @param {object} profile
 * @returns {number} 0–1
 */
function calcConflictFrequency(profile) {
  if (!profile?.income) return 0;
  const income = profile.income;
  const budget = Object.values(profile?.budgetLimits || {}).reduce((s, v) => s + v, 0);
  const fixedCosts = profile?.fixedCostItems
    ? profile.fixedCostItems.reduce((s, c) => s + (c.amount || 0), 0)
    : (profile?.housingCost || 0);
  const savingsTarget = profile?.savingsGoalMonthlyTarget || 0;
  const total = budget + fixedCosts + savingsTarget;
  return total > income ? 1 : 0;
}

/**
 * Beräknar MLI-värdet 0–100.
 * @param {Array} transactions - PERSONAL-transaktioner
 * @param {object} profile - FinancialProfile
 * @returns {number} 0–100 (100 = maximal belastning)
 */
export function calculateMLI(transactions = [], profile = null) {
  const U = calcUncategorizedRatio(transactions);
  const B = calcBufferPressure(profile);
  const A = calcActionDensity();
  const C = calcConflictFrequency(profile);

  const raw = (U * 0.30) + (B * 0.40) + (A * 0.20) + (C * 0.10);
  return Math.round(Math.min(raw * 100, 100));
}

/**
 * Returnerar en "supportive tone"-konfiguration baserat på MLI-värdet.
 * @param {number} mli - 0–100
 * @returns {{ tone: string, greeting: string|null, hideComplexUI: boolean, showGalaxyChallenge: boolean }}
 */
export function getMLIToneConfig(mli) {
  if (mli > 70) {
    return {
      tone: 'supportive',
      greeting: 'Du har hanterat mycket idag – jag håller koll på detaljerna åt dig. Inget brådskande kräver din uppmärksamhet just nu.',
      hideComplexUI: true,
      showGalaxyChallenge: false,
    };
  }
  if (mli < 30) {
    return {
      tone: 'detailed',
      greeting: null,
      hideComplexUI: false,
      showGalaxyChallenge: true,
    };
  }
  return {
    tone: 'balanced',
    greeting: null,
    hideComplexUI: false,
    showGalaxyChallenge: false,
  };
}

/**
 * Registrerar en avvisad notis i localStorage för Action Density-beräkningen.
 */
export function trackDismissedNotification() {
  const current = parseInt(localStorage.getItem('anchor_dismissed_notifications') || '0', 10);
  localStorage.setItem('anchor_dismissed_notifications', String(current + 1));
}

/**
 * Nollställer Action Density-räknaren (t.ex. vid ny session varje dag).
 */
export function resetActionDensity() {
  const lastReset = localStorage.getItem('anchor_mli_reset_date');
  const today = new Date().toISOString().slice(0, 10);
  if (lastReset !== today) {
    localStorage.setItem('anchor_dismissed_notifications', '0');
    localStorage.setItem('anchor_mli_reset_date', today);
  }
}