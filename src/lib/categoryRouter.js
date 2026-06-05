/**
 * categoryRouter — lagerad kategorisering för precision:
 * 1) användar-overrides  2) regler  3) liknande handlare  4) LLM (GPT Mini → GPT)
 */

import { getOverrides } from '@/lib/enrichmentEngine';
import { suggestCategory } from '@/lib/smartCategorization';
import { merchantSimilarity, normalizeMerchant } from '@/lib/merchantNormalize';

export const VALID_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'travel',
  'health',
  'home',
  'shopping',
  'income',
  'savings',
  'other',
];

/** Under denna confidence skickas posten till LLM */
export const LLM_CONFIDENCE_THRESHOLD = 0.75;

const SOURCE_CONFIDENCE = {
  override: 0.98,
  rules: 0.88,
  similar: 0.82,
  amount: 0.7,
  llm_claude: 0.86,
  llm_gpt: 0.8,
  unknown: 0.35,
};

function clampCategory(cat) {
  if (!cat) return 'other';
  const c = String(cat).toLowerCase().trim();
  if (c === 'insurance' || c === 'utilities' || c === 'subscriptions') return 'other';
  return VALID_CATEGORIES.includes(c) ? c : 'other';
}

function normalizeKey(str) {
  return normalizeMerchant(str).replace(/\s+/g, '_');
}

function matchOverride(vendorOrLabel) {
  const overrides = getOverrides();
  const key = normalizeKey(vendorOrLabel);
  if (overrides[key]) {
    return { category: clampCategory(overrides[key]), confidence: SOURCE_CONFIDENCE.override, source: 'override' };
  }

  // Delmatch mot sparade overrides (t.ex. "ica" i "ica maxi")
  for (const [savedKey, category] of Object.entries(overrides)) {
    const savedNorm = savedKey.replace(/_/g, ' ');
    if (key.includes(savedKey) || savedNorm && normalizeMerchant(vendorOrLabel).includes(savedNorm)) {
      return { category: clampCategory(category), confidence: SOURCE_CONFIDENCE.override - 0.04, source: 'override' };
    }
  }

  return null;
}

function matchSimilar(vendorOrLabel) {
  const overrides = getOverrides();
  const entries = Object.entries(overrides);
  if (!entries.length) return null;

  let best = null;
  for (const [savedKey, category] of entries) {
    const score = merchantSimilarity(vendorOrLabel, savedKey.replace(/_/g, ' '));
    if (score >= 0.55 && (!best || score > best.score)) {
      best = { score, category: clampCategory(category) };
    }
  }

  if (!best) return null;
  return {
    category: best.category,
    confidence: SOURCE_CONFIDENCE.similar * best.score + 0.15,
    source: 'similar',
  };
}

function matchRules(vendorOrLabel) {
  const suggested = suggestCategory(vendorOrLabel);
  if (suggested && suggested !== 'other') {
    return { category: clampCategory(suggested), confidence: SOURCE_CONFIDENCE.rules, source: 'rules' };
  }
  return null;
}

function matchAmount(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
  if (amount > 0) {
    return { category: 'income', confidence: SOURCE_CONFIDENCE.amount, source: 'amount' };
  }
  return null;
}

/**
 * Lokal kategorisering utan LLM.
 * @returns {{ category, confidence, source, needsReview, normalizedVendor }}
 */
export function categorizeLocal(vendorOrLabel, { amount } = {}) {
  const text = (vendorOrLabel || '').trim();
  const normalizedVendor = normalizeMerchant(text);

  if (!text) {
    return {
      category: 'other',
      confidence: SOURCE_CONFIDENCE.unknown,
      source: 'unknown',
      needsReview: true,
      normalizedVendor: '',
    };
  }

  const layers = [
    matchOverride(text),
    matchRules(text),
    matchSimilar(text),
    matchAmount(amount),
  ].filter(Boolean);

  if (!layers.length) {
    return {
      category: 'other',
      confidence: SOURCE_CONFIDENCE.unknown,
      source: 'unknown',
      needsReview: true,
      normalizedVendor,
    };
  }

  const best = layers.sort((a, b) => b.confidence - a.confidence)[0];
  const needsReview = best.confidence < LLM_CONFIDENCE_THRESHOLD || best.category === 'other';

  return {
    category: best.category,
    confidence: Math.min(0.99, best.confidence),
    source: best.source,
    needsReview,
    normalizedVendor,
  };
}

/** confidence som UI-etikett */
export function confidenceLabel(confidence) {
  if (confidence >= 0.9) return 'high';
  if (confidence >= LLM_CONFIDENCE_THRESHOLD) return 'medium';
  return 'low';
}

/**
 * Kör lokal routing på batch; delar upp i klara vs behöver LLM.
 */
export function categorizeBatchLocal(items) {
  const resolved = [];
  const needsLLM = [];

  items.forEach((item, index) => {
    const text = item.vendor || item.description || item.label || '';
    const local = categorizeLocal(text, { amount: item.amount });

    const row = {
      index,
      id: item.id ?? index,
      ...local,
      description: text,
      amount: item.amount,
    };

    if (local.needsReview) {
      needsLLM.push(row);
    } else {
      resolved.push(row);
    }
  });

  return { resolved, needsLLM };
}

/**
 * LLM-lager via Base44-funktion (GPT Mini → GPT fallback på servern).
 */
export async function categorizeWithLLM(base44, items, { recentTransactions = [] } = {}) {
  if (!items?.length) return [];

  const payload = items.map((item) => ({
    id: item.id ?? item.index,
    description: item.description || item.vendor || item.label || '',
    amount: item.amount ?? null,
    normalizedVendor: item.normalizedVendor || normalizeMerchant(item.description || ''),
  }));

  const res = await base44.functions.invoke('categorizeTransactions', {
    items: payload,
    recentTransactions: (recentTransactions || []).slice(0, 15).map((t) => ({
      vendor: t.vendor || t.label,
      category: t.category,
      amount: t.amount,
    })),
  });

  return res.data?.results || [];
}

/**
 * Full pipeline: lokal → LLM för osäkra → merged resultat i originalordning.
 */
export async function categorizePipeline(base44, items, options = {}) {
  const { resolved, needsLLM } = categorizeBatchLocal(items);

  let llmResults = [];
  if (needsLLM.length) {
    try {
      llmResults = await categorizeWithLLM(base44, needsLLM, options);
    } catch {
      llmResults = [];
    }
  }

  const llmById = new Map(llmResults.map((r) => [r.id, r]));
  const merged = items.map((item, index) => {
    const local = categorizeLocal(item.vendor || item.description || item.label || '', {
      amount: item.amount,
    });
    const llm = llmById.get(item.id ?? index);

    if (llm?.category && llm.confidence >= local.confidence) {
      return {
        category: clampCategory(llm.category),
        confidence: llm.confidence,
        source: llm.model?.includes('claude') ? 'llm_claude' : llm.model?.includes('mini') ? 'llm_gpt_mini' : 'llm_gpt',
        needsReview: llm.needs_review ?? llm.confidence < LLM_CONFIDENCE_THRESHOLD,
        normalizedVendor: local.normalizedVendor,
        model: llm.model,
      };
    }

    if (!local.needsReview) return local;

    return {
      ...local,
      needsReview: true,
    };
  });

  return {
    categories: merged,
    stats: {
      total: items.length,
      localOnly: resolved.length,
      llmUsed: llmResults.length,
    },
  };
}

/** Enkel post — sync lokalt, valfri async LLM */
export async function categorizeTransaction(base44, vendorOrLabel, { amount, useLLM = true, recentTransactions = [] } = {}) {
  const local = categorizeLocal(vendorOrLabel, { amount });

  if (!useLLM || !local.needsReview || !base44) {
    return { ...local, confidenceLabel: confidenceLabel(local.confidence) };
  }

  try {
    const [llm] = await categorizeWithLLM(
      base44,
      [{ id: 0, description: vendorOrLabel, amount, normalizedVendor: local.normalizedVendor }],
      { recentTransactions },
    );

    if (llm?.category && llm.confidence >= local.confidence) {
      return {
        category: clampCategory(llm.category),
        confidence: llm.confidence,
        source: llm.model?.includes('claude') ? 'llm_claude' : llm.model?.includes('mini') ? 'llm_gpt_mini' : 'llm_gpt',
        needsReview: llm.needs_review ?? llm.confidence < LLM_CONFIDENCE_THRESHOLD,
        normalizedVendor: local.normalizedVendor,
        confidenceLabel: confidenceLabel(llm.confidence),
        model: llm.model,
      };
    }
  } catch {
    // fall through to local
  }

  return { ...local, confidenceLabel: confidenceLabel(local.confidence) };
}
