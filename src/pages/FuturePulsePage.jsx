import React from 'react';
import PageShell from '@/components/layout/PageShell';
import FuturePulseDetail from '@/components/futurepulse/FuturePulseDetail';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';

export default function FuturePulsePage() {
  const { profile } = useFinancialProfile();
  const { transactions } = useTransactions({ limit: 1000 });

  return (
    <PageShell
      title="Hur ser nästa månader ut?"
      subtitle="Kommande händelser och prognos"
      backHref={createPageUrl('Dashboard')}
    >
      <FuturePulseDetail profile={profile} transactions={transactions} />
    </PageShell>
  );
}
