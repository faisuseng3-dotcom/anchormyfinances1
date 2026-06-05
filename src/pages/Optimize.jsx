import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — abonnemangsoptimering finns under Verktyg. */
export default function Optimize() {
  return <LegacyRedirect page="Optimize" />;
}

export const pageSeo = pageSeoFor('ProTools');
