import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  computeLocalFuturePulse,
  summarizeForFutureEngine,
  mergeFuturePulse,
  extractPatterns,
  compactFuturePulse,
  enrichFuturePulseDetail,
} from '@/lib/futurePulseEngine';

/**
 * @param {object} profile
 * @param {array} transactions
 * @param {{ compact?: boolean }} options — compact för dashboard-kort, full för detaljsida
 */
export function useFuturePulse(profile, transactions, { compact = true, enabled = true } = {}) {
  const personalTxs = useMemo(
    () => (transactions || []).filter((t) => t.context !== 'BUSINESS'),
    [transactions],
  );

  return useQuery({
    queryKey: ['futurePulse', profile?.id, personalTxs.length, compact ? 'compact' : 'full'],
    queryFn: async () => {
      const maxEvents = compact ? 2 : 6;
      const localRaw = computeLocalFuturePulse(profile, personalTxs, 60, maxEvents);
      const payload = summarizeForFutureEngine(profile, personalTxs);
      const patterns = extractPatterns(profile, personalTxs);

      let merged = localRaw;
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

      if (compact) {
        return compactFuturePulse(merged);
      }
      return enrichFuturePulseDetail(merged, profile);
    },
    enabled: enabled && !!profile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
