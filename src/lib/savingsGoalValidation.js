/** Milestones på sparmålsringen (Hershfield: synligt framsteg mot framtida jaget). */
export const GOAL_MILESTONE_PCTS = [25, 50, 75, 100];

const GENERIC_NAME_PATTERNS = [
  /^sparande\s*$/i,
  /^sparmål\s*$/i,
  /^sparkonto\s*$/i,
  /^mitt sparmål$/i,
  /^mitt mål\s*$/i,
  /^savings?\s*$/i,
  /^goal\s*$/i,
  /^sparande\s+[\d\s.,]+(\s*kr)?\s*$/i,
  /^sparmål\s+[\d\s.,]+(\s*kr)?\s*$/i,
  /^[\d\s.,]+(\s*kr)?\s*$/i,
];

function normalizeName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatAmountForCompare(amount) {
  if (!amount) return '';
  return `${Math.round(amount).toLocaleString('sv-SE')} kr`.toLowerCase();
}

/** Blockar generiska namn som "Sparande 10 000 kr". */
export function isGenericSavingsGoalName(name, amount = 0) {
  const trimmed = (name || '').trim();
  if (trimmed.length < 3) return true;

  const norm = normalizeName(trimmed);
  if (GENERIC_NAME_PATTERNS.some((re) => re.test(norm))) return true;

  const amountStr = formatAmountForCompare(amount);
  if (amountStr && (norm === amountStr || norm === amountStr.replace(' kr', ''))) return true;

  const digitsOnly = norm.replace(/[^\d]/g, '');
  const nameDigits = trimmed.replace(/[^\d]/g, '');
  const amountDigits = String(Math.round(amount || 0));
  if (nameDigits && amountDigits && nameDigits === amountDigits) return true;

  return false;
}

/**
 * @param {{ imageUrl?: string | null; iconId?: string; visualType?: string | null }} [opts]
 */
export function hasSavingsGoalVisual({ imageUrl, iconId, visualType } = {}) {
  if (imageUrl) return true;
  if (visualType === 'icon' && iconId && iconId !== 'default') return true;
  return false;
}

/**
 * @param {{ name?: string; amount?: number; imageUrl?: string | null; iconId?: string; visualType?: string | null }} fields
 */
export function validateSavingsGoal({ name, amount, imageUrl, iconId, visualType }) {
  const errors = [];

  if (!name?.trim()) {
    errors.push('Ge målet ett namn som beskriver din dröm — t.ex. "Thailand-resa" eller "Min första bil".');
  } else if (isGenericSavingsGoalName(name, amount)) {
    errors.push('Välj ett personligt namn. "Sparande 10 000 kr" räcker inte — beskriv vad du sparar till.');
  }

  if (!amount || amount <= 0) {
    errors.push('Ange ett målbelopp.');
  }

  if (!hasSavingsGoalVisual({ imageUrl, iconId, visualType })) {
    errors.push('Ladda upp en bild av din dröm eller välj en stor symbol — det hjälper dig se ditt framtida jag.');
  }

  return { ok: errors.length === 0, errors };
}

/** Blur → skärpa och glöd när användaren närmar sig målet. */
export function getGoalVisualEffects(pct) {
  const t = Math.min(1, Math.max(0, (pct || 0) / 100));
  return {
    blur: Math.round(14 * (1 - t) ** 1.4),
    opacity: 0.42 + 0.58 * t,
    grayscale: Math.round((1 - t) * 75),
    glow: t >= 0.75,
    glowIntensity: t >= 0.75 ? (t - 0.75) / 0.25 : 0,
  };
}

export function getReachedMilestones(pct) {
  return GOAL_MILESTONE_PCTS.filter((m) => (pct || 0) >= m);
}
