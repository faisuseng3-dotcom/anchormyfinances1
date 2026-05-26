import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/** Legacy route — insikter finns nu som flik på transaktionssidan. */
export default function InsightsPage() {
  return <Navigate to={`${createPageUrl('TransactionHistory')}?tab=insights`} replace />;
}
