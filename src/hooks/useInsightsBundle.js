import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { buildInsightsBundle } from '@/lib/dataFetchers';

/** Cachad insikts- + läckagemotor — prefetchas från Hem. */
export function useInsightsBundle(profile, transactions) {
  const personalTxs = useMemo(
    () => (transactions || []).filter((t) => t.context !== 'BUSINESS'),
    [transactions],
  );

  const query = useQuery({
    queryKey: queryKeys.insightsBundle(profile?.id, personalTxs.length),
    queryFn: () => buildInsightsBundle(profile, personalTxs),
    enabled: Boolean(profile),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    insights: query.data?.insights ?? [],
    leakage: query.data?.leakage ?? null,
    isLoading: query.isLoading && !query.data,
  };
}
