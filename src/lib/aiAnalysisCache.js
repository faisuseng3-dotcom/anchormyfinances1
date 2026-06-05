/** Cachad AI-analys — 18 timmar (mellan 12–24 h). */
const TTL_MS = 18 * 60 * 60 * 1000;
const PREFIX = 'anchor_ai_cache_';

function cacheKey(profileId, scenario) {
  return `${PREFIX}${profileId || 'local'}_${scenario}`;
}

export function getCachedAnalysis(profileId, scenario) {
  try {
    const raw = localStorage.getItem(cacheKey(profileId, scenario));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.data || !entry.updatedAt) return null;
    if (Date.now() - entry.updatedAt > TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

export function setCachedAnalysis(profileId, scenario, data) {
  try {
    localStorage.setItem(
      cacheKey(profileId, scenario),
      JSON.stringify({ data, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore quota */
  }
}

export function invalidateCachedAnalysis(profileId, scenario) {
  try {
    localStorage.removeItem(cacheKey(profileId, scenario));
  } catch {
    /* ignore */
  }
}

export function formatCacheTime(updatedAt) {
  if (!updatedAt) return null;
  return new Date(updatedAt).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
