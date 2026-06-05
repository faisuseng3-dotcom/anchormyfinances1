import { base44 } from '@/api/base44Client';
import { loadGuestProfile, isGuestMode } from '@/components/guestStorage';
import { runInsightEngine } from '@/lib/insightEngine';
import { runLeakageDetector } from '@/lib/leakageEngine';
import { fetchFuturePulse } from '@/lib/futurePulseQuery';

export async function fetchFinancialProfile() {
  if (isGuestMode()) return loadGuestProfile() || null;
  const profiles = await base44.entities.FinancialProfile.list();
  return profiles.length > 0 ? profiles[0] : null;
}

export async function fetchTransactions({
  order = '-created_date',
  limit = 500,
  personalOnly = false,
} = {}) {
  const all = await base44.entities.Transaction.list(order, limit);
  const list = all || [];
  return personalOnly ? list.filter((t) => t.context !== 'BUSINESS') : list;
}

export function buildInsightsBundle(profile, transactions) {
  const txs = transactions || [];
  return {
    insights: runInsightEngine(profile, txs),
    leakage: runLeakageDetector(profile, txs),
  };
}

export { fetchFuturePulse };
