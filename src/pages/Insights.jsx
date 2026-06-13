import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionInsightsPanel from '@/components/transactions/TransactionInsightsPanel';

export default function Insights() {
  const { profile } = useFinancialProfile();
  const { transactions = [], isLoading } = useTransactions({ personalOnly: true, limit: 500 });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-white">Insikter</h1>
        <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-1">
          Mönster, trender och förslag baserat på dina transaktioner.
        </p>
      </div>
      <TransactionInsightsPanel
        transactions={transactions}
        isLoading={isLoading}
        profile={profile}
      />
    </div>
  );
}

export const pageSeo = pageSeoFor('Insights');
