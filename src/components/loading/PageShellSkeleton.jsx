import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonCard, SkeletonLine } from './SkeletonBlocks';

/** Generisk sid-skeleton med header + innehållsblock. */
export default function PageShellSkeleton({ sections = 3 }) {
  return (
    <div className="anchor-page min-h-screen px-5 sm:px-7 pt-12 pb-28 max-w-lg mx-auto">
      <div className="mb-8 space-y-2">
        <SkeletonLine width="w-32" className="h-4" />
        <SkeletonLine width="w-48" className="h-3" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: sections }, (_, i) => (
          <SkeletonCard key={i} className="space-y-3">
            <SkeletonLine width="w-1/3" />
            <Skeleton className="h-20 w-full rounded-xl" />
            {i === 0 && <Skeleton className="h-10 w-full rounded-full" />}
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
