import { Navigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { planeraTabHref } from '@/lib/planeraTabs';

/** Legacy — sammanslagen med Planera. */
export default function WhatIf() {
  return <Navigate to={planeraTabHref('scenario')} replace />;
}

export const pageSeo = pageSeoFor('FuturePulse');
