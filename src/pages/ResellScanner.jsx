import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — borttagen; tillbaka till Hem. */
export default function ResellScanner() {
  return <LegacyRedirect page="ResellScanner" />;
}

export const pageSeo = pageSeoFor('Dashboard');
