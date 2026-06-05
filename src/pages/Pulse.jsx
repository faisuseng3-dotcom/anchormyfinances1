import { Navigate, useSearchParams } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { planeraTabHref } from '@/lib/planeraTabs';

/** Legacy — sammanslagen med Planera. */
export default function Pulse() {
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const target = planeraTabHref('nu');
  return <Navigate to={qs ? `${target}&${qs}` : target} replace />;
}

export const pageSeo = pageSeoFor('FuturePulse');
