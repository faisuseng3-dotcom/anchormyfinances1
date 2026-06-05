import { Navigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { historyTabHref } from '@/lib/historyTabs';

/** Legacy — sammanslagen med Historik. */
export default function FinancialHistory() {
  return <Navigate to={historyTabHref('trends')} replace />;
}

export const pageSeo = pageSeoFor('TransactionHistory');
