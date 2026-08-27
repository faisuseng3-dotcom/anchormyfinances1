import { useMemo } from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { getSafeToSpend } from '@/lib/financialEngine';
import { getMonthlyMargin } from '@/lib/financialUtils';

/**
 * Reaktiv "tryggt att spendera" — synkas via React Query när transaktioner ändras (inkl. optimistiskt).
 */
export function useFreeMoney(options = {}) {
  const { profile } = useFinancialProfile(options);
  const { transactions = [], isLoading } = useTransactions({
    personalOnly: true,
    limit: 1000,
    ...options,
  });

  const margin = useMemo(() => getMonthlyMargin(profile), [profile]);
  const safeToSpend = useMemo(
    () => getSafeToSpend(profile, transactions),
    [profile, transactions],
  );
  const freeMoney = safeToSpend.amount;

  /** Simulera effekt av en ny/ändrad transaktion innan spar. */
  const projectFreeMoney = useMemo(
    () => (draft) => {
      if (!draft?.amount) return freeMoney;
      const amt = Math.abs(Number(draft.amount) || 0);
      const isExpense = draft.type === 'expense' || draft.isExpense !== false;
      if (!isExpense) return freeMoney + amt;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const draftDate = draft.created_date ? new Date(draft.created_date) : now;
      if (draftDate < monthStart) return freeMoney;
      return Math.max(0, freeMoney - amt);
    },
    [freeMoney],
  );

  return {
    profile,
    transactions,
    margin,
    freeMoney,
    safeToSpend,
    projectFreeMoney,
    isLoading,
  };
}
