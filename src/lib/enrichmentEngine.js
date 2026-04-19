/**
 * EnrichmentEngine – Självlärande kategorisering.
 * Sparar user-specifika overrides i localStorage och matchar dem före generell AI-logik.
 */

const STORAGE_KEY = 'anchor_category_overrides';

/** Läser alla overrides från localStorage: { vendorKey: category } */
export function getOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Sparar en override */
export function saveOverride(vendorOrLabel, category) {
  const key = normalizeKey(vendorOrLabel);
  if (!key) return;
  const overrides = getOverrides();
  overrides[key] = category;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/** Tar bort en override */
export function removeOverride(vendorOrLabel) {
  const key = normalizeKey(vendorOrLabel);
  const overrides = getOverrides();
  delete overrides[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/** Slår upp kategori med override-prioritet */
export function enrichCategory(vendorOrLabel, fallbackCategory, suggestFn) {
  const key = normalizeKey(vendorOrLabel);
  const overrides = getOverrides();

  if (overrides[key]) {
    return { category: overrides[key], confidence: 'high', isOverride: true };
  }

  const suggested = suggestFn ? suggestFn(vendorOrLabel) : fallbackCategory;
  if (suggested && suggested !== 'other') {
    return { category: suggested, confidence: 'medium', isOverride: false };
  }

  return { category: fallbackCategory || 'other', confidence: 'low', isOverride: false };
}

/** Räknar antal overrides */
export function getOverrideCount() {
  return Object.keys(getOverrides()).length;
}

/** Alla lagrade overrides som array [{ vendor, category }] */
export function listOverrides() {
  return Object.entries(getOverrides()).map(([vendor, category]) => ({ vendor, category }));
}

function normalizeKey(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, '_');
}