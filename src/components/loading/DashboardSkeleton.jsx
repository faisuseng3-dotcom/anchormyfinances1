// @ts-nocheck
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonLine } from './SkeletonBlocks';
import '../dashboard/copilot/anchorCopilot.css';

/** Layout-skeleton för Hem — Copilot-struktur medan profil laddas. */
export default function DashboardSkeleton() {
  return (
    <div className="anchor-copilot-shell">
      <aside className="copilot-sidebar hidden lg:flex">
        <div className="copilot-sidebar-logo">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 mx-5 my-1 rounded" />
        ))}
      </aside>

      <main className="copilot-main">
        <header className="copilot-topbar">
          <div className="space-y-2">
            <SkeletonLine width="w-32" className="h-3" />
            <Skeleton className="h-7 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </header>

        <div className="copilot-content">
          <Skeleton className="h-14 w-full rounded-2xl mb-7" />
          <div className="copilot-summary-row">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="copilot-grid-main">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
