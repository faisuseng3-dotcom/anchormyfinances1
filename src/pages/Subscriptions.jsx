import React, { useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import SubscriptionListView from '@/components/dashboard/copilot/tools/SubscriptionListView';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';

/**
 * Dedikerad route för abonnemangslistan — ALDRIG ProTools.
 */
export default function Subscriptions() {
  const { profile, isLoading, updateProfile } = useFinancialProfile();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[SubscriptionsPage] mounted — rendering SubscriptionListView');
    }
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <SubscriptionListView
      profile={profile}
      updateProfile={updateProfile}
    />
  );
}

export const pageSeo = pageSeoFor('Subscriptions');
