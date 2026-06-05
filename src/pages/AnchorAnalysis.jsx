import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — insikter finns under Historik. */
export default function AnchorAnalysis() {
  return <LegacyRedirect page="AnchorAnalysis" />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
