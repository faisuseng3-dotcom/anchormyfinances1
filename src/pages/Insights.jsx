import { Navigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';

/** Legacy route — insikter finns nu som flik på transaktionssidan. */
export default function Insights() {
  return <Navigate to={`${createPageUrl('TransactionHistory')}?tab=insights`} replace />;
}

export const pageSeo = pageSeoFor('Insights');
