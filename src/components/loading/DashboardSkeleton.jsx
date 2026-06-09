// @ts-nocheck
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonLine } from './SkeletonBlocks';

/** Layout-skeleton för Hem — innehåll medan profil laddas (sidebar i Layout). */
export default function DashboardSkeleton() {
  return (
    <>
      <header className="copilot-topbar px-5 sm:px-8 py-5 border-b ">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonLine width="w-32" className="h-3" />
            <Skeleton className="h-7 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </header>

      <div className="copilot-content px-5 sm:px-8 py-6">
        <Skeleton className="h-14 w-full rounded-2xl mb-7" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </>
  );
}
