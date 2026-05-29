import React from 'react';
import GalaxyExplorer from '@/components/social/GalaxyExplorer';
import PublishEconomyPanel from '@/components/social/PublishEconomyPanel';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexGalaxyBadge from '@/components/demo/AlexGalaxyBadge';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

export default function Galaxy() {
  const { isAlexMode } = useDemoMode();
  const { profile: financialProfile } = useFinancialProfile();

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <PageShell
      title="Jämför"
      subtitle="Liknande ekonomier"
      backHref={createPageUrl('Dashboard')}
      className="!pb-28"
    >
      <p className={`${sectionSubtitleClass} -mt-4 mb-4`}>
        Publicera hur du fördelar lönen, jämför med andra — och kopiera en fördelning till din
        egen månadsbudget med ett tryck.
      </p>

      <div className="mb-6">
        <PublishEconomyPanel />
      </div>

      {isAlexMode && (
        <div className="mb-4">
          <AlexGalaxyBadge />
        </div>
      )}

      <GalaxyExplorer
        userFinancialProfile={financialProfile}
        currentUserId={currentUser?.id}
      />
    </PageShell>
  );
}
