import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — sammanslagen med Planera. */
export default function WhatIf() {
  return <LegacyRedirect page="WhatIf" />;
}

export const pageSeo = pageSeoFor('FuturePulse');
