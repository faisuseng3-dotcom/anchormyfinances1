/**
 * Normaliserar rå banktext till ett jämförbart handelsnamn.
 * Ex: "ICA KVANTUM STHLM 123" → "ica", "KLARNA*SPOTIFY" → "spotify"
 */

const STRIP_PREFIXES = [
  /^klarna\*?\s*/i,
  /^swish\s*(till|från)?\s*/i,
  /^card\s*payment\s*/i,
  /^köp\s*/i,
  /^autogiro\s*/i,
  /^bg\s*\d+\s*/i,
  /^pg\s*\d+\s*/i,
];

const STRIP_SUFFIXES = [
  /\s+\d{4,}$/,
  /\s+st(h|ockholm|hlm|lm)\b.*/i,
  /\s+g[öo]teborg\b.*/i,
  /\s+malm[öo]\b.*/i,
  /\s+uppsala\b.*/i,
  /\s+ab\b$/i,
  /\s+se\b$/i,
];

export function normalizeMerchant(raw) {
  if (!raw) return '';

  let s = raw.toLowerCase().trim();

  for (const re of STRIP_PREFIXES) {
    s = s.replace(re, '');
  }

  s = s.replace(/[*_/|]+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  for (const re of STRIP_SUFFIXES) {
    s = s.replace(re, '').trim();
  }

  // Behåll första meningsfulla token om resten är mest plats/id
  const tokens = s.split(' ').filter(Boolean);
  if (tokens.length > 1 && tokens[0].length >= 3) {
    const first = tokens[0];
    if (['ica', 'coop', 'willys', 'hemköp', 'lidl', 'max', 'sj', 'sl'].includes(first)) {
      return first.replace('hemköp', 'hemkop');
    }
  }

  return s.slice(0, 48);
}

/** Token-set för likhetsmatchning (utan embeddings-API) */
export function merchantTokens(raw) {
  const n = normalizeMerchant(raw);
  return new Set(
    n
      .split(/[\s.*_-]+/)
      .filter((t) => t.length >= 2),
  );
}

export function merchantSimilarity(a, b) {
  const ta = merchantTokens(a);
  const tb = merchantTokens(b);
  if (!ta.size || !tb.size) return 0;

  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap += 1;
  }

  const union = new Set([...ta, ...tb]).size;
  return union ? overlap / union : 0;
}
