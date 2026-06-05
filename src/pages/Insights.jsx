import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — insikter finns under Historik. */
export default function Insights() {
  return <LegacyRedirect page="Insights" />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
