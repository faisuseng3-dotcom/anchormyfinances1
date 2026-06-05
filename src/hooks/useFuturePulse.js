// @ts-nocheck
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchFuturePulse } from '@/lib/futurePulseQuery';

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
    queryKey: queryKeys.futurePulse(profile?.id, personalTxs.length, compact),
    queryFn: () => fetchFuturePulse(profile, transactions, { compact }),
    enabled: enabled && !!profile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: (prev) => prev,
  });
}
