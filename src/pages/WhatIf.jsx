import React from 'react';
import { base44 } from '@/api/base44Client';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import ModeGate from '@/components/ModeGate';
import AnchorOracle from '@/components/whatif/AnchorOracle';
import { DashboardSection } from '@/components/dashboard/DashboardChrome';

export default function WhatIf() {
  const { profile } = useFinancialProfile();

  const currentMode = profile?.mode || 'basic';

  return (
    <PageShell
      title="Vad händer om…?"
      subtitle="Beskriv ett scenario — vi räknar på konsekvensen"
      backHref={createPageUrl('Dashboard')}
    >
      <ModeGate feature="what_if" mode={currentMode}>
        <DashboardSection
          title="Scenario"
          subtitle="T.ex. sjukskrivning, lägre lön eller nytt lån"
        >
          <AnchorOracle profile={profile} />
        </DashboardSection>
      </ModeGate>
    </PageShell>
  );
}
