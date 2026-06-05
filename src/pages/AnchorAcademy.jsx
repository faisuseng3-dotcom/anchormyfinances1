import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — lektioner visas i kontext (dashboard, lån, m.m.). */
export default function AnchorAcademy() {
  return <LegacyRedirect page="AnchorAcademy" />;
}

export const pageSeo = pageSeoFor('Dashboard');
