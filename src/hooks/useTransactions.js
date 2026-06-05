import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/demo/DemoMode';
import { queryKeys } from '@/lib/queryKeys';
import { fetchTransactions } from '@/lib/dataFetchers';

/**
 * Transactions for the active session (API or demo preview).
 */
export function useTransactions(options = {}) {
  const {
    enabled = true,
    limit = 500,
    order = '-created_date',
    personalOnly = false,
  } = options;
  const { isDemoMode, demoTransactions } = useDemoMode();

  const query = useQuery({
    queryKey: queryKeys.transactions(order, limit, personalOnly),
    queryFn: () => fetchTransactions({ order, limit, personalOnly }),
    enabled: enabled && !isDemoMode,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const transactions = useMemo(() => {
    const source = isDemoMode ? demoTransactions || [] : query.data || [];
    return personalOnly ? source.filter((t) => t.context !== 'BUSINESS') : source;
  }, [isDemoMode, demoTransactions, query.data, personalOnly]);

  return {
    transactions,
    isLoading: !isDemoMode && query.isLoading,
    isDemoMode,
    refetch: query.refetch,
  };
}
