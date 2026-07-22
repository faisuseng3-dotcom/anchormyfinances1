// @ts-nocheck
/**
 * Bakåtkompatibilitet — delegerar till Lago Memory V2.
 * @deprecated Importera från @/lib/anchorMemory istället.
 */
import {
  saveSemanticMemory,
  recallRelevantMemories as recallV2,
  buildMemoryPromptContext,
} from '@/lib/anchorMemory';
import { tokenize, toVector } from '@/lib/anchorMemory/extract';

export function rememberInsight({ text, type = 'insight', tags = [] }) {
  if (!text?.trim()) return null;
  return saveSemanticMemory({
    profile: { id: 'local' },
    type: type === 'question' ? 'insight' : type,
    value: text.trim().slice(0, 500),
    sourceFeature: 'coach',
    keywords: tags,
  });
}

export async function recallRelevantMemories(query, { limit = 4, type } = {}) {
  const all = await recallV2(query, { id: 'local' }, { limit: limit * 2 });
  const filtered = type ? all.filter((m) => m.type === type) : all;
  return filtered.slice(0, limit);
}

export function formatMemoryContext(memories) {
  if (!memories?.length) return '';
  const lines = memories.map((m) => `- [${m.type}] ${m.text || m.value}`);
  return `\nRelevanta minnen från tidigare (använd bara om det passar):\n${lines.join('\n')}\n`;
}

export function indexFromPatterns(patterns) {
  (patterns || []).forEach((p) => {
    rememberInsight({ text: p.label, type: 'pattern', tags: [p.type] });
  });
}

export { tokenize, toVector };
