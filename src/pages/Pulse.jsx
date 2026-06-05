import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — sammanslagen med Planera. */
export default function Pulse() {
  return <LegacyRedirect page="Pulse" />;
}

export const pageSeo = pageSeoFor('FuturePulse');
