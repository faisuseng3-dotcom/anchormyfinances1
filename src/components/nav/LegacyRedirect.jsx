import { Navigate } from 'react-router-dom';
import { legacyRedirectTarget } from '@/lib/appStructure';

/** Omdirigera gamla routes till kärn- eller djupvy. */
export default function LegacyRedirect({ page }) {
  const to = legacyRedirectTarget(page);
  if (!to) return <Navigate to="/" replace />;
  return <Navigate to={to} replace />;
}
