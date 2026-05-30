import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';

/** Profil + transaktioner för personlig rådgivare (inkl. Alex/demo). */
export function useAdvisorContext() {
  const { profile, isDemoMode } = useFinancialProfile();
  const { transactions } = useTransactions({ limit: 500 });
  return { profile, transactions, isDemoMode };
}
