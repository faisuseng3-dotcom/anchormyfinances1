import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — grupper nås via Vänner. */
export default function Squads() {
  return <LegacyRedirect page="Squads" />;
}

export const pageSeo = pageSeoFor('Social');
