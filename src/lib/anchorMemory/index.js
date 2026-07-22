// @ts-nocheck
/**
 * Lago Memory V2 — gemensamt minne för alla AI-funktioner.
 */

import { base44 } from '@/api/base44Client';
import { MEMORY_UX_NOTICE, scenarioToFeature } from './types';
import { extractSemanticMemories, tokenize, toVector, cosineSimilarity } from './extract';
import {
  resolveProfileKey,
  readLocalStore,
  writeLocalStore,
  clearLocalStore,
  migrateLegacyLocalMemory,
  clearAllLocalMemoryKeys,
} from './localStore';

const CHAT_FETCH_LIMIT = 30;
const MEMORY_FETCH_LIMIT = 120;
const RECALL_LIMIT = 8;
const ENTITY_FETCH_TIMEOUT_MS = 8000;

let entitiesAvailable = null;

function withFetchTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label}_timeout`)), ENTITY_FETCH_TIMEOUT_MS);
    }),
  ]);
}

async function checkEntities() {
  if (entitiesAvailable !== null) return entitiesAvailable;
  try {
    entitiesAvailable = Boolean(
      base44.entities?.AIChatMessage?.filter
      && base44.entities?.AIMemory?.filter,
    );
  } catch {
    entitiesAvailable = false;
  }
  return entitiesAvailable;
}

export function isMemoryEnabled(profile) {
  if (!profile) return false;
  return profile.aiMemoryEnabled !== false;
}

function normalizeChat(row) {
  return {
    id: row.id,
    profileId: row.profileId,
    chatId: row.chatId || 'default',
    feature: row.feature,
    message: row.message || '',
    response: row.response || '',
    createdAt: row.created_date || row.createdAt || Date.now(),
  };
}

function normalizeMemory(row) {
  const keywords = row.keywords || [];
  return {
    id: row.id,
    profileId: row.profileId,
    type: row.type,
    value: row.value,
    sourceFeature: row.sourceFeature || 'coach',
    keywords,
    metadata: row.metadata || {},
    active: row.active !== false,
    vector: toVector(keywords.length ? keywords : tokenize(row.value)),
    createdAt: row.created_date || row.createdAt || Date.now(),
    updatedAt: row.updated_date || row.updatedAt || Date.now(),
  };
}

async function fetchChats(profileId, { limit = CHAT_FETCH_LIMIT, feature } = {}) {
  const profileKey = profileId;
  const hasEntities = await checkEntities();

  if (hasEntities && profileId && !String(profileId).startsWith('guest_') && profileId !== 'local') {
    try {
      const filter = feature
        ? { profileId, feature }
        : { profileId };
      const rows = await withFetchTimeout(
        base44.entities.AIChatMessage.filter(filter, '-created_date', limit),
        'AIChatMessage_filter',
      );
      return (rows || []).map(normalizeChat);
    } catch (err) {
      console.warn('AIChatMessage fetch failed, using local:', err?.message);
    }
  }

  const store = readLocalStore(profileKey);
  let chats = store.chats || [];
  if (feature) chats = chats.filter((c) => c.feature === feature);
  return chats
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limit)
    .map(normalizeChat);
}

async function fetchMemories(profileId, { activeOnly = true } = {}) {
  const profileKey = profileId;
  const hasEntities = await checkEntities();

  if (hasEntities && profileId && !String(profileId).startsWith('guest_') && profileId !== 'local') {
    try {
      const rows = await withFetchTimeout(
        base44.entities.AIMemory.filter(
          { profileId },
          '-updated_date',
          MEMORY_FETCH_LIMIT,
        ),
        'AIMemory_filter',
      );
      return (rows || [])
        .map(normalizeMemory)
        .filter((m) => !activeOnly || m.active);
    } catch (err) {
      console.warn('AIMemory fetch failed, using local:', err?.message);
    }
  }

  migrateLegacyLocalMemory(profileKey);
  const store = readLocalStore(profileKey);
  return (store.memories || [])
    .map(normalizeMemory)
    .filter((m) => !activeOnly || m.active);
}

/**
 * Spara ett AI-utbyte (chatt + semantisk extraktion).
 */
export async function recordAIExchange({
  profile,
  feature,
  message,
  response = '',
  chatId = 'default',
  scenario,
}) {
  if (!isMemoryEnabled(profile)) return null;
  const profileId = resolveProfileKey(profile);
  const resolvedFeature = feature || scenarioToFeature(scenario);

  if (!message?.trim()) return null;

  const entry = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    profileId,
    chatId,
    feature: resolvedFeature,
    message: message.trim().slice(0, 2000),
    response: String(response || '').trim().slice(0, 4000),
    createdAt: Date.now(),
  };

  const hasEntities = await checkEntities();
  if (hasEntities && profile?.id) {
    try {
      const created = await base44.entities.AIChatMessage.create({
        profileId: profile.id,
        chatId,
        feature: resolvedFeature,
        message: entry.message,
        response: entry.response,
      });
      entry.id = created?.id || entry.id;
    } catch (err) {
      console.warn('AIChatMessage create failed:', err?.message);
    }
  } else {
    const store = readLocalStore(profileId);
    store.chats = [entry, ...(store.chats || [])].slice(0, 500);
    writeLocalStore(profileId, store);
  }

  const extracted = extractSemanticMemories({
    message: entry.message,
    response: entry.response,
    feature: resolvedFeature,
  });

  await Promise.all(
    extracted.map((mem) => saveSemanticMemory({
      profile,
      type: mem.type,
      value: mem.value,
      sourceFeature: resolvedFeature,
      keywords: mem.keywords,
      metadata: mem.metadata,
    })),
  );

  return entry;
}

export async function saveSemanticMemory({
  profile,
  type,
  value,
  sourceFeature = 'coach',
  keywords = [],
  metadata = {},
}) {
  if (!isMemoryEnabled(profile) || !value?.trim()) return null;

  const profileId = resolveProfileKey(profile);
  const mem = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    profileId: profile?.id || profileId,
    type,
    value: value.trim().slice(0, 500),
    sourceFeature,
    keywords,
    metadata,
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const hasEntities = await checkEntities();
  if (hasEntities && profile?.id) {
    try {
      const created = await base44.entities.AIMemory.create({
        profileId: profile.id,
        type: mem.type,
        value: mem.value,
        sourceFeature: mem.sourceFeature,
        keywords: mem.keywords,
        metadata: mem.metadata,
        active: true,
      });
      return normalizeMemory(created || mem);
    } catch (err) {
      console.warn('AIMemory create failed:', err?.message);
    }
  }

  const store = readLocalStore(profileId);
  store.memories = [mem, ...(store.memories || [])].slice(0, 200);
  writeLocalStore(profileId, store);
  return normalizeMemory(mem);
}

export async function recallRelevantMemories(query, profile, { limit = RECALL_LIMIT } = {}) {
  if (!isMemoryEnabled(profile)) return [];
  const profileId = resolveProfileKey(profile);
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const store = await fetchMemories(profileId);
  const qVec = toVector(tokens);

  return store
    .map((m) => ({
      ...m,
      score: cosineSimilarity(qVec, m.vector || toVector(tokenize(m.value))),
    }))
    .filter((m) => m.score > 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, type, value, sourceFeature, score, createdAt }) => ({
      id, type, value, sourceFeature, score, createdAt,
    }));
}

export async function getRecentConversations(profile, { limit = 12, feature } = {}) {
  if (!isMemoryEnabled(profile)) return [];
  const profileId = resolveProfileKey(profile);
  const chats = await fetchChats(profile?.id || profileId, { limit, feature });
  return chats.reverse();
}

/** Bygg prompt-block för alla AI-anrop. */
export async function buildMemoryPromptContext({
  profile,
  query = '',
  feature,
}) {
  if (!isMemoryEnabled(profile)) return '';

  const profileId = resolveProfileKey(profile);
  const parts = [];

  const memories = await recallRelevantMemories(query, profile, { limit: 6 });
  if (memories.length) {
    const lines = memories.map((m) => `  • [${m.type}] ${m.value}`);
    parts.push(`VIKTIGA MINNEN OM ANVÄNDAREN:\n${lines.join('\n')}`);
  }

  const recent = await getRecentConversations(profile, { limit: 8, feature });
  if (recent.length) {
    const lines = recent
      .filter((c) => c.message)
      .slice(-6)
      .map((c) => {
        const date = new Date(c.createdAt).toLocaleDateString('sv-SE');
        const snippet = c.message.slice(0, 120);
        const reply = c.response ? ` → ${c.response.slice(0, 80)}` : '';
        return `  • ${date} (${c.feature}): ${snippet}${reply}`;
      });
    if (lines.length) {
      parts.push(`TIDIGARE DISKUSSIONER:\n${lines.join('\n')}`);
    }
  }

  // App-aktivitet från localStorage (köp, resor, kalender)
  const activity = readAppActivity(profile);
  if (activity) parts.push(activity);

  if (!parts.length) return '';
  return `\nLAGO-MINNE (använd för kontinuitet — referera naturligt, nämn inte "minne" eller teknik):\n${parts.join('\n\n')}\n`;
}

function readAppActivity(profile) {
  const parts = [];

  try {
    const wishlist = JSON.parse(localStorage.getItem('anchor_impulse_wishlist') || '[]');
    if (wishlist.length) {
      const items = wishlist.slice(0, 4).map((w) => {
        const name = w.name || w.product || 'Produkt';
        const verdict = w.verdict || w.result?.verdict || '';
        return `  • ${name}${verdict ? ` — ${verdict}` : ''}`;
      });
      parts.push(`KÖPANALYSER:\n${items.join('\n')}`);
    }
  } catch { /* ignore */ }

  try {
    const travel = JSON.parse(localStorage.getItem('anchor_travel_cache') || 'null');
    if (travel?.data?.analysis?.destination) {
      parts.push(`RESEPLANERING: ${travel.data.analysis.destination}`);
    }
  } catch { /* ignore */ }

  const profileId = profile?.id;
  if (profileId) {
    try {
      const events = JSON.parse(localStorage.getItem(`anchor_planned_events_${profileId}`) || '[]');
      if (events.length) {
        const upcoming = events.slice(0, 4).map((e) => `  • ${e.label || e.event}`);
        parts.push(`PLANERADE HÄNDELSER:\n${upcoming.join('\n')}`);
      }
    } catch { /* ignore */ }
  }

  return parts.join('\n\n');
}

export async function listSemanticMemories(profile) {
  const profileId = resolveProfileKey(profile);
  return fetchMemories(profile?.id || profileId, { activeOnly: false });
}

export async function updateSemanticMemory(profile, memoryId, patch) {
  const profileId = resolveProfileKey(profile);
  const hasEntities = await checkEntities();

  if (hasEntities && profile?.id && !memoryId.startsWith('mem_') && !memoryId.startsWith('legacy_')) {
    try {
      return await base44.entities.AIMemory.update(memoryId, {
        ...patch,
        updated_date: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('AIMemory update failed:', err?.message);
    }
  }

  const store = readLocalStore(profileId);
  store.memories = (store.memories || []).map((m) =>
    m.id === memoryId ? { ...m, ...patch, updatedAt: Date.now() } : m,
  );
  writeLocalStore(profileId, store);
  return patch;
}

export async function deleteSemanticMemory(profile, memoryId) {
  const profileId = resolveProfileKey(profile);
  const hasEntities = await checkEntities();

  if (hasEntities && profile?.id && !memoryId.startsWith('mem_') && !memoryId.startsWith('legacy_')) {
    try {
      await base44.entities.AIMemory.delete(memoryId);
      return true;
    } catch (err) {
      console.warn('AIMemory delete failed:', err?.message);
    }
  }

  const store = readLocalStore(profileId);
  store.memories = (store.memories || []).filter((m) => m.id !== memoryId);
  writeLocalStore(profileId, store);
  return true;
}

export async function deleteAllChatHistory(profile) {
  const profileId = resolveProfileKey(profile);
  const hasEntities = await checkEntities();

  if (hasEntities && profile?.id) {
    try {
      const rows = await base44.entities.AIChatMessage.filter({ profileId: profile.id }, '', 500);
      await Promise.all((rows || []).map((r) => base44.entities.AIChatMessage.delete(r.id)));
    } catch (err) {
      console.warn('AIChatMessage bulk delete failed:', err?.message);
    }
  }

  const store = readLocalStore(profileId);
  store.chats = [];
  writeLocalStore(profileId, store);
}

export async function deleteAllSemanticMemories(profile) {
  const profileId = resolveProfileKey(profile);
  const hasEntities = await checkEntities();

  if (hasEntities && profile?.id) {
    try {
      const rows = await base44.entities.AIMemory.filter({ profileId: profile.id }, '', 500);
      await Promise.all((rows || []).map((r) => base44.entities.AIMemory.delete(r.id)));
    } catch (err) {
      console.warn('AIMemory bulk delete failed:', err?.message);
    }
  }

  const store = readLocalStore(profileId);
  store.memories = [];
  writeLocalStore(profileId, store);
  localStorage.removeItem('anchor_ai_memory');
}

export async function clearAllUserMemory(profile) {
  await deleteAllChatHistory(profile);
  await deleteAllSemanticMemories(profile);
  clearLocalStore(resolveProfileKey(profile));
}

export async function exportUserMemory(profile) {
  const profileId = resolveProfileKey(profile);
  const [chats, memories] = await Promise.all([
    fetchChats(profile?.id || profileId, { limit: 500 }),
    fetchMemories(profile?.id || profileId, { activeOnly: false }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profileId: profile?.id || profileId,
    chats: chats.map(({ message, response, feature, createdAt }) => ({
      message, response, feature, createdAt,
    })),
    memories: memories.map(({ type, value, sourceFeature, keywords, active, createdAt }) => ({
      type, value, sourceFeature, keywords, active, createdAt,
    })),
  };
}

export async function setMemoryEnabled(profile, updateProfile, enabled) {
  if (!updateProfile) return;
  await updateProfile({ aiMemoryEnabled: enabled });
  if (!enabled) {
    await clearAllUserMemory(profile);
  }
}

export { MEMORY_UX_NOTICE, clearAllLocalMemoryKeys };
