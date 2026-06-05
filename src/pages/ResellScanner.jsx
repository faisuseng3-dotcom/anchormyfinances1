import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';

/** Avpublicerad — passar inte Anchors kärnupplevelse (privat ekonomi). */
export default function ResellScanner() {
  return <Navigate to={createPageUrl('Dashboard')} replace />;
}

export const pageSeo = pageSeoFor('Dashboard');
