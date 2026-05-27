import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
import { useDemoMode } from '@/components/demo/DemoMode';
import PageShell from '@/components/layout/PageShell';
import FuturePulseDetail from '@/components/futurepulse/FuturePulseDetail';
import { createPageUrl } from '@/utils';

export default function FuturePulsePage() {
  const { isDemoMode, demoProfile, demoTransactions } = useDemoMode();

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      if (isGuestMode()) return loadGuestProfile() || null;
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
    enabled: !isDemoMode,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 1000),
    enabled: !isDemoMode,
  });

  const activeProfile = isDemoMode ? demoProfile : profile;
  const activeTx = isDemoMode ? demoTransactions : transactions;

  return (
    <PageShell
      title="Framtidspuls"
      subtitle="60 dagar framåt"
      backHref={createPageUrl('Dashboard')}
    >
      <FuturePulseDetail profile={activeProfile} transactions={activeTx} />
    </PageShell>
  );
}
