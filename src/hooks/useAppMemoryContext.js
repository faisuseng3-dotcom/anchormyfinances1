/**
 * Samlar all app-aktivitet som chatten ska ha tillgång till:
 * - Köpanalyser (PurchaseAnalyzer)
 * - Reseplanering (TravelAgentChat)
 * - Planerade händelser (ekonomikalender)
 * - AI-minnen från aiMemory.js
 */
import { useMemo } from 'react';
import { recallRelevantMemories } from '@/lib/aiMemory';

function readJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useAppMemoryContext(query = '') {
  return useMemo(() => {
    const parts = [];

    // ── Köpanalyser ─────────────────────────────────────────────────
    const wishlist = readJSON('anchor_impulse_wishlist');
    if (wishlist.length > 0) {
      const items = wishlist.slice(0, 5).map((w) => {
        const verdict = w.verdict || w.result?.verdict || '?';
        const name = w.name || w.product || w.url || 'Produkt';
        const price = w.price || w.result?.price || '';
        return `  • ${name}${price ? ` (${Math.round(price).toLocaleString('sv-SE')} kr)` : ''} — ${verdict}`;
      });
      parts.push(`KÖPANALYSER DU GJORT:\n${items.join('\n')}`);
    }

    // ── Reseplanering ───────────────────────────────────────────────
    const travel = readJSON('anchor_travel_cache', null);
    if (travel?.data?.analysis) {
      const a = travel.data.analysis;
      parts.push(`RESEPLANERING:\n  • Destination: ${a.destination || '?'}, Budget: ${a.totalBudget ? Math.round(a.totalBudget).toLocaleString('sv-SE') + ' kr' : '?'}, ${a.nights || '?'} nätter`);
    }

    // ── Planerade händelser ─────────────────────────────────────────
    const events = readJSON('anchor_planned_events');
    if (events.length > 0) {
      const upcoming = events.slice(0, 5).map((e) => `  • ${e.label || e.event} (${e.date || ''}): ${e.amount ? Math.round(e.amount).toLocaleString('sv-SE') + ' kr' : ''}`);
      parts.push(`PLANERADE EKONOMISKA HÄNDELSER:\n${upcoming.join('\n')}`);
    }

    // ── Semantiska AI-minnen (relevant till frågan) ─────────────────
    if (query.trim()) {
      const memories = recallRelevantMemories(query, { limit: 5 });
      if (memories.length > 0) {
        const lines = memories.map((m) => `  • ${m.text}`);
        parts.push(`RELEVANTA MINNEN FRÅN TIDIGARE AKTIVITET:\n${lines.join('\n')}`);
      }
    }

    return parts.join('\n\n');
  }, [query]);
}
