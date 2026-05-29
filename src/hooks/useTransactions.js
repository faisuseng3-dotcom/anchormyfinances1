import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useDemoMode } from '@/components/demo/DemoMode';

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
    queryKey: ['transactions', order, limit, personalOnly],
    queryFn: async () => {
      const all = await base44.entities.Transaction.list(order, limit);
      const list = all || [];
      return personalOnly ? list.filter((t) => t.context !== 'BUSINESS') : list;
    },
    enabled: enabled && !isDemoMode,
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
