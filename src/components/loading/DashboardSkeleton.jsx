// @ts-nocheck
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonCard, SkeletonLine, SkeletonCircle } from './SkeletonBlocks';
import { dashZone } from '@/lib/dashboardTheme';

/** Layout-skeleton för Hem — visar struktur medan profil laddas. */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen anchor-page anchor-dashboard-pad-bottom anchor-mobile-frame relative overflow-x-hidden">
      <header className={`relative z-10 ${dashZone} pt-11 sm:pt-14 pb-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <SkeletonLine width="w-24" className="h-3" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
          <SkeletonCircle size={44} />
        </div>
      </header>

      <div className={`relative z-10 space-y-8 ${dashZone}`}>
        <SkeletonCard className="space-y-4">
          <SkeletonLine width="w-28" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
          </div>
        </SkeletonCard>

        <div className="space-y-3">
          <SkeletonLine width="w-16" />
          <SkeletonCard>
            <SkeletonLine width="w-3/4" className="mb-2" />
            <SkeletonLine width="w-1/2" />
          </SkeletonCard>
        </div>

        <SkeletonCard>
          <SkeletonLine width="w-32" className="mb-4" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </SkeletonCard>

        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 flex-1 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
