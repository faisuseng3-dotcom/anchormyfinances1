import React from 'react';
import GalaxyExplorer from '@/components/social/GalaxyExplorer';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexGalaxyBadge from '@/components/demo/AlexGalaxyBadge';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';

export default function Galaxy() {
  const { isAlexMode } = useDemoMode();
  const { profile: financialProfile } = useFinancialProfile();

  return (
    <PageShell
      title="Galaxy"
      subtitle="Hitta ekonomiska tvillingar"
      backHref={createPageUrl('Dashboard')}
      className="!pb-28"
    >
      <p className="text-[15px] text-white/55 -mt-4 mb-4 leading-relaxed">
        Utforska hur andra med liknande livssituation hanterar sin ekonomi.
      </p>

      {isAlexMode && (
        <div className="mb-6">
          <AlexGalaxyBadge />
        </div>
      )}

      <GalaxyExplorer userFinancialProfile={financialProfile} />
    </PageShell>
  );
}
