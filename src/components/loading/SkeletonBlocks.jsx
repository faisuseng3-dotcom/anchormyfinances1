// @ts-nocheck
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** @param {{ className?: string, width?: string }} props */
export function SkeletonLine({ className, width = 'w-full' }) {
  return <Skeleton className={cn('h-3 rounded-full', width, className)} />;
}

/** @param {{ size?: number, className?: string }} props */
export function SkeletonCircle({ size = 40, className }) {
  return <Skeleton className={cn('rounded-full shrink-0', className)} style={{ width: size, height: size }} />;
}

export function SkeletonCard({ className, children }) {
  return (
    <div className={cn('rounded-2xl shadow-[var(--anchor-shadow-1)] bg-white/[0.04] p-4', className)}>
      {children}
    </div>
  );
}

/** En rad i transaktionslistan. */
export function TransactionRowSkeleton({ className }) {
  return (
    <div className={cn('flex items-center gap-3 py-3.5', className)}>
      <SkeletonCircle size={36} />
      <div className="flex-1 space-y-2 min-w-0">
        <SkeletonLine width="w-2/5" />
        <SkeletonLine width="w-1/4" className="h-2.5" />
      </div>
      <SkeletonLine width="w-14" className="h-4" />
    </div>
  );
}

export function TransactionListSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }, (_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}
