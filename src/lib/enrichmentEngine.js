/**
 * EnrichmentEngine – Självlärande kategorisering.
 * Sparar user-specifika overrides i localStorage och matchar dem före generell AI-logik.
 */

import { categorizeLocal, confidenceLabel } from '@/lib/categoryRouter';

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

/** Slår upp kategori via categoryRouter (override → regler → liknande handlare) */
export function enrichCategory(vendorOrLabel, fallbackCategory, _suggestFn) {
  const result = categorizeLocal(vendorOrLabel);

  if (result.source === 'unknown' && fallbackCategory) {
    return {
      category: fallbackCategory,
      confidence: confidenceLabel(result.confidence),
      isOverride: false,
    };
  }

  return {
    category: result.category,
    confidence: confidenceLabel(result.confidence),
    isOverride: result.source === 'override',
  };
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