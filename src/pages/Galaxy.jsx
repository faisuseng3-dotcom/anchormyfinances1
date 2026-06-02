import React, { useState } from 'react';
import GalaxyExplorer from '@/components/social/GalaxyExplorer';
import GalaxyCompareHero from '@/components/social/GalaxyCompareHero';
import PublishEconomyPanel from '@/components/social/PublishEconomyPanel';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexGalaxyBadge from '@/components/demo/AlexGalaxyBadge';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GALAXY_DEMO_PROFILES } from '@/lib/galaxyProfiles';

export default function Galaxy() {
  const { isAlexMode } = useDemoMode();
  const { profile: financialProfile } = useFinancialProfile();
  const { socialProfile } = useSocialProfile();
  const [stats, setStats] = useState({
    publishedCount: 0,
    exampleCount: GALAXY_DEMO_PROFILES.length,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const hasIncome = (financialProfile?.income || 0) > 0;
  const isPublished = Boolean(socialProfile?.economy_published);

  return (
    <PageShell
      title="Jämför"
      subtitle="Liknande ekonomier"
      backHref={createPageUrl('Dashboard')}
      className="!pb-28"
    >
      <GalaxyCompareHero
        publishedCount={stats.publishedCount}
        exampleCount={stats.exampleCount}
        isPublished={isPublished}
        hasIncome={hasIncome}
      />

      <PublishEconomyPanel defaultCollapsed={isPublished} />

      {isAlexMode && (
        <div className="mb-4 -mt-2">
          <AlexGalaxyBadge />
        </div>
      )}

      <GalaxyExplorer
        userFinancialProfile={financialProfile}
        currentUserId={currentUser?.id}
        onStatsChange={setStats}
      />
    </PageShell>
  );
}
