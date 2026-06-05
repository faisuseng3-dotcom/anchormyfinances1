import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — trender finns under Historik. */
export default function FinancialHistory() {
  return <LegacyRedirect page="FinancialHistory" />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
