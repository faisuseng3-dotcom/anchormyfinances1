// @ts-nocheck
/**
 * Lokal fallback + migrering för Memory V2.
 * Primär persistens sker via Base44-entiteter när profileId finns.
 */

const LOCAL_PREFIX = 'anchor_memory_v2_';
const LEGACY_MEMORY_KEY = 'anchor_ai_memory';
const MAX_LOCAL_CHATS = 500;
const MAX_LOCAL_MEMORIES = 200;

export function resolveProfileKey(profile) {
  if (!profile) return 'anonymous';
  if (profile.id) return String(profile.id);
  if (profile._guestKey) return `guest_${profile._guestKey}`;
  return 'local';
}

function localKey(profileKey) {
  return `${LOCAL_PREFIX}${profileKey}`;
}

export function readLocalStore(profileKey) {
  try {
    const raw = localStorage.getItem(localKey(profileKey));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { chats: [], memories: [] };
}

export function writeLocalStore(profileKey, store) {
  try {
    localStorage.setItem(
      localKey(profileKey),
      JSON.stringify({
        chats: (store.chats || []).slice(0, MAX_LOCAL_CHATS),
        memories: (store.memories || []).slice(0, MAX_LOCAL_MEMORIES),
      }),
    );
  } catch {
    /* quota */
  }
}

export function clearLocalStore(profileKey) {
  localStorage.removeItem(localKey(profileKey));
}

/** Migrera gamla anchor_ai_memory till V2-format. */
export function migrateLegacyLocalMemory(profileKey) {
  try {
    const raw = localStorage.getItem(LEGACY_MEMORY_KEY);
    if (!raw) return 0;
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy) || !legacy.length) return 0;

    const store = readLocalStore(profileKey);
    const existing = new Set((store.memories || []).map((m) => m.value));
    let added = 0;

    legacy.forEach((item) => {
      const value = item.text?.trim();
      if (!value || existing.has(value)) return;
      store.memories.unshift({
        id: item.id || `legacy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: item.type === 'question' ? 'insight' : (item.type || 'insight'),
        value,
        sourceFeature: 'coach',
        keywords: item.tags || [],
        metadata: {},
        active: true,
        createdAt: item.createdAt || Date.now(),
        updatedAt: Date.now(),
        _local: true,
      });
      existing.add(value);
      added += 1;
    });

    if (added) writeLocalStore(profileKey, store);
    return added;
  } catch {
    return 0;
  }
}

export function clearAllLocalMemoryKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(LOCAL_PREFIX) || key === LEGACY_MEMORY_KEY) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem('anchor_travel_cache');
  localStorage.removeItem('anchor_impulse_wishlist');
}
