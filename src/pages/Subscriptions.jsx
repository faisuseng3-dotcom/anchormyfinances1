import React, { useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import SubscriptionListView from '@/components/dashboard/copilot/tools/SubscriptionListView';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';

/**
 * Dedikerad route för abonnemangslistan — ALDRIG ProTools.
 */
export default function Subscriptions() {
  const { profile, isLoading, updateProfile, invalidate } = useFinancialProfile();
  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh(invalidate);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[SubscriptionsPage] mounted — rendering SubscriptionListView');
    }
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%', overflowY: 'auto' }}>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <SubscriptionListView
        profile={profile}
        updateProfile={updateProfile}
      />
    </div>
  );
}

export const pageSeo = pageSeoFor('Subscriptions');
