import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GalaxyExplorer from '@/components/social/GalaxyExplorer';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexGalaxyBadge from '@/components/demo/AlexGalaxyBadge';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';

export default function Galaxy() {
  const { isAlexMode } = useDemoMode();
  const { data: financialProfile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
    enabled: !isAlexMode,
  });

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
