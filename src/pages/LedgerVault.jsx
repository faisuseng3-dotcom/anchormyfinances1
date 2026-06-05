import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — verifikat finns som flik under Historik (företag). */
export default function LedgerVault() {
  return <LegacyRedirect page="LedgerVault" />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
