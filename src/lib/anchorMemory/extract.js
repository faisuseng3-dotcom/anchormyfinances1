// @ts-nocheck
/**
 * Extraherar semantiska minnen från användarmeddelanden och AI-svar.
 * Regelbaserat — snabbt och utan extra LLM-anrop.
 */

import { MEMORY_TYPES } from './types';

const STOP_WORDS = new Set([
  'och', 'att', 'det', 'som', 'för', 'med', 'jag', 'min', 'mitt', 'mina', 'den', 'de', 'en', 'är', 'på', 'av', 'till', 'har', 'kan', 'hur', 'vad', 'när', 'var', 'inte', 'om', 'vi', 'du', 'din', 'dina', 'ska', 'vill', 'mer', 'lite', 'mycket',
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function uniqueKeywords(...parts) {
  const set = new Set();
  parts.flat().forEach((p) => tokenize(p).forEach((t) => set.add(t)));
  return [...set].slice(0, 12);
}

function pushCandidate(list, seen, candidate) {
  const key = `${candidate.type}::${candidate.value.toLowerCase()}`;
  if (!candidate.value?.trim() || seen.has(key)) return;
  seen.add(key);
  list.push({
    type: candidate.type,
    value: candidate.value.trim().slice(0, 280),
    keywords: candidate.keywords || uniqueKeywords(candidate.value),
    metadata: candidate.metadata || {},
  });
}

/** @returns {Array<{ type, value, keywords, metadata }>} */
export function extractSemanticMemories({ message = '', response = '', feature = 'coach' }) {
  const text = `${message} ${response}`.trim();
  if (!text) return [];

  const candidates = [];
  const seen = new Set();
  const msg = message.trim();

  // Större köp
  const purchasePatterns = [
    /(?:köpa|köper|funderar på att köpa|tänker köpa|överväger)\s+(?:en\s+)?(.{3,80}?)(?:\.|,|$|\?)/i,
    /(?:bilen|bilmodellen)\s+(.{3,60})/i,
  ];
  purchasePatterns.forEach((re) => {
    const m = msg.match(re);
    if (m?.[1]) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.MAJOR_PURCHASE,
        value: `Funderar på att köpa ${m[1].trim()}`,
        keywords: uniqueKeywords(m[1], 'köp'),
      });
    }
  });

  // Sparmål / kontantinsats
  const savingsPatterns = [
    /sparar?\s+till\s+(.{3,80}?)(?:\.|,|$|\?)/i,
    /(?:sparmål|målet)\s+(?:är\s+)?(.{3,80}?)(?:\.|,|$|\?)/i,
    /kontantinsats(?:en)?\s+(?:till\s+)?(.{3,80}?)(?:\.|,|$|\?)/i,
  ];
  savingsPatterns.forEach((re) => {
    const m = msg.match(re);
    if (m?.[1]) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.SAVINGS_GOAL,
        value: `Sparar till ${m[1].trim()}`,
        keywords: uniqueKeywords(m[1], 'sparande'),
      });
    }
  });

  // Finansiella mål
  const goalPatterns = [
    /(?:mitt mål|målet är|vill)\s+(.{5,90}?)(?:\.|,|$|\?)/i,
    /bli\s+(skuldfri|ekonomiskt oberoende|debt.?free)/i,
  ];
  goalPatterns.forEach((re) => {
    const m = msg.match(re);
    if (m?.[1]) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.GOAL,
        value: m[1].trim(),
        keywords: uniqueKeywords(m[1]),
      });
    }
  });

  // Resor
  const travelPatterns = [
    /(?:resa|semester|flyga|åka)\s+(?:till\s+)?(.{3,60}?)(?:\.|,|i\s+\w+|nästa|$|\?)/i,
    /planerar?\s+(?:en\s+)?(?:resa|semester)\s+(?:till\s+)?(.{3,60}?)(?:\.|,|$|\?)/i,
  ];
  travelPatterns.forEach((re) => {
    const m = msg.match(re);
    if (m?.[1]) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.TRAVEL_PLAN,
        value: `Reseplan: ${m[1].trim()}`,
        keywords: uniqueKeywords(m[1], 'resa'),
      });
    }
  });

  // Lån
  const loanPatterns = [
    /(?:lån|bolån|billån|studielån|skuld)\s*(?:på\s+)?(\d[\d\s]*\s*kr)?/i,
    /(?:betalar|amorterar)\s+(\d[\d\s]*\s*kr)\s*(?:i\s+månaden|per månad|\/mån)/i,
  ];
  loanPatterns.forEach((re) => {
    const m = msg.match(re);
    if (m) {
      const amount = m[1]?.replace(/\s/g, '') || '';
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.LOAN,
        value: amount ? `Lån/skuld: ${amount}` : 'Diskuterat lån eller skuld',
        keywords: uniqueKeywords(msg, 'lån'),
        metadata: amount ? { amount } : {},
      });
    }
  });

  // Familj
  if (/\b(barn|familj|partner|maka|make|föräldra|dagis|skola)\b/i.test(msg)) {
    const m = msg.match(/(.{10,120})/);
    if (m) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.FAMILY,
        value: m[1].trim().slice(0, 120),
        keywords: uniqueKeywords(msg, 'familj'),
      });
    }
  }

  // Företag
  if (/\b(företag|egenföretag|moms|faktura|enskild firma|aktiebolag|ab)\b/i.test(msg)) {
    pushCandidate(candidates, seen, {
      type: MEMORY_TYPES.BUSINESS,
      value: msg.slice(0, 120),
      keywords: uniqueKeywords(msg, 'företag'),
    });
  }

  // Prenumerationer
  const subMatch = msg.match(/(?:prenumeration|abonnemang|abbo)\s+(?:på\s+)?(.{2,50}?)(?:\.|,|$|\?)/i);
  if (subMatch?.[1]) {
    pushCandidate(candidates, seen, {
      type: MEMORY_TYPES.SUBSCRIPTION,
      value: `Prenumeration: ${subMatch[1].trim()}`,
      keywords: uniqueKeywords(subMatch[1]),
    });
  }

  // Budgetpreferenser
  const budgetMatch = msg.match(/(?:sätt|sänk|höj|ändra)\s+(.{3,40}?budget(?:en)?)\s+till\s+(\d[\d\s]*)\s*kr/i);
  if (budgetMatch) {
    pushCandidate(candidates, seen, {
      type: MEMORY_TYPES.BUDGET_PREFERENCE,
      value: `${budgetMatch[1]}: ${budgetMatch[2].replace(/\s/g, '')} kr`,
      keywords: uniqueKeywords(budgetMatch[1], 'budget'),
      metadata: { amount: Number(budgetMatch[2].replace(/\s/g, '')) },
    });
  }

  // AI-beslut från svar (köp/vänta/ja till råd)
  if (response && feature === 'purchase_analysis') {
    const verdictMatch = response.match(/(?:rekommendation|dom|bedömning)[:\s]+(\w+)/i);
    if (verdictMatch) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.AI_DECISION,
        value: `Köpanalys: ${verdictMatch[1]}`,
        keywords: uniqueKeywords(message, verdictMatch[1]),
      });
    }
  }

  if (response && /(?:rekommenderar|föreslår|mitt råd)/i.test(response)) {
    const snippet = response.slice(0, 160).replace(/\s+/g, ' ').trim();
    if (snippet.length > 30) {
      pushCandidate(candidates, seen, {
        type: MEMORY_TYPES.AI_DECISION,
        value: snippet,
        keywords: uniqueKeywords(message, snippet),
      });
    }
  }

  return candidates.slice(0, 4);
}

export function toVector(tokens) {
  const freq = {};
  tokens.forEach((t) => { freq[t] = (freq[t] || 0) + 1; });
  return freq;
}

export function cosineSimilarity(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  keys.forEach((k) => {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  });
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { tokenize };
