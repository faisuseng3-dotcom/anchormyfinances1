// @ts-nocheck
/**
 * Semantiskt AI-minne — lättvikts-embeddings i localStorage.
 * Hittar relevant kontext utan att skicka hela historiken till Claude varje gång.
 */

const STORE_KEY = 'anchor_ai_memory';
const MAX_MEMORIES = 120;

const STOP_WORDS = new Set([
  'och', 'att', 'det', 'som', 'för', 'med', 'jag', 'min', 'mitt', 'mina', 'den', 'de', 'en', 'är', 'på', 'av', 'till', 'har', 'kan', 'hur', 'vad', 'när', 'var', 'inte', 'om', 'vi', 'du', 'din', 'dina',
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Enkel bag-of-words-vektor för cosine similarity */
function toVector(tokens) {
  const freq = {};
  tokens.forEach((t) => { freq[t] = (freq[t] || 0) + 1; });
  return freq;
}

function cosineSimilarity(a, b) {
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

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStore(items) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items.slice(0, MAX_MEMORIES)));
  } catch {
    /* quota */
  }
}

/**
 * Spara ett minne (coach-svar, insikt, användarfråga).
 */
export function rememberInsight({ text, type = 'insight', tags = [] }) {
  if (!text?.trim()) return null;
  const tokens = tokenize(text);
  const entry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim().slice(0, 500),
    type,
    tags,
    vector: toVector(tokens),
    createdAt: Date.now(),
  };

  const store = loadStore();
  store.unshift(entry);
  saveStore(store);
  return entry;
}

/**
 * Hitta de mest relevanta minnena för en fråga/scenario.
 */
export function recallRelevantMemories(query, { limit = 4, type } = {}) {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const qVec = toVector(tokens);
  const store = loadStore().filter((m) => !type || m.type === type);

  return store
    .map((m) => ({ ...m, score: cosineSimilarity(qVec, m.vector || {}) }))
    .filter((m) => m.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, text, type: t, tags, score, createdAt }) => ({ id, text, type: t, tags, score, createdAt }));
}

/** Formatera minnen till prompt-block */
export function formatMemoryContext(memories) {
  if (!memories?.length) return '';
  const lines = memories.map((m) => `- [${m.type}] ${m.text}`);
  return `\nRelevanta minnen från tidigare (använd bara om det passar):\n${lines.join('\n')}\n`;
}

/** Indexera transaktionsmönster som minnen */
export function indexFromPatterns(patterns) {
  (patterns || []).forEach((p) => {
    rememberInsight({ text: p.label, type: 'pattern', tags: [p.type] });
  });
}
