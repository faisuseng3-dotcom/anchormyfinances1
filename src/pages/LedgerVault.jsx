import { Navigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { historyTabHref } from '@/lib/historyTabs';

/** Legacy — verifikat finns som flik under Historik (företag). */
export default function LedgerVault() {
  return <Navigate to={historyTabHref('ledger', { includeLedger: true })} replace />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
