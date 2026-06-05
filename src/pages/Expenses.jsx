import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — utgifter och lista finns under Historik. */
export default function Expenses() {
  return <LegacyRedirect page="Expenses" />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
