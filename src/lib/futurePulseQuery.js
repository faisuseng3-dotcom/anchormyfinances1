import { base44 } from '@/api/base44Client';
import {
  computeLocalFuturePulse,
  summarizeForFutureEngine,
  mergeFuturePulse,
  extractPatterns,
  compactFuturePulse,
  enrichFuturePulseDetail,
} from '@/lib/futurePulseEngine';
import { detectSpendingPatterns } from '@/lib/onDeviceMl';
import { canUseFeature, normalizePlan } from '@/lib/billingPlans';

export async function fetchFuturePulse(profile, transactions, { compact = true } = {}) {
  const personalTxs = (transactions || []).filter((t) => t.context !== 'BUSINESS');
  const maxEvents = compact ? 2 : 6;
  const localRaw = computeLocalFuturePulse(profile, personalTxs, 60, maxEvents);
  const payload = summarizeForFutureEngine(profile, personalTxs);
  const patterns = extractPatterns(profile, personalTxs);
  const onDevicePatterns = detectSpendingPatterns(personalTxs);


  let merged = localRaw;
  const plan = normalizePlan(profile?.plan);
  if (canUseFeature(plan, 'future_pulse')) {
    try {
      const res = await base44.functions.invoke('futureEngine', {
        ...payload,
        localBaseline: compactFuturePulse(localRaw),
        patterns,
        context: 'PERSONAL',
      });
      merged = mergeFuturePulse(localRaw, res.data);
    } catch {
      merged = localRaw;
    }
  }

  if (compact) return compactFuturePulse(merged);
  return enrichFuturePulseDetail(merged, profile);
}