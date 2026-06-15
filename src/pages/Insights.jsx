import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionInsightsPanel from '@/components/transactions/TransactionInsightsPanel';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';

export default function Insights() {
  const { profile } = useFinancialProfile();
  const { transactions = [], isLoading } = useTransactions({ personalOnly: true, limit: 500 });

  return (
    <PageShell
      title="Insikter"
      subtitle="Mönster, trender och förslag"
      backHref={createPageUrl('Dashboard')}
    >
      <TransactionInsightsPanel
        transactions={transactions}
        isLoading={isLoading}
        profile={profile}
      />
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Insights');
