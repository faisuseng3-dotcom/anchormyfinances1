import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import ModeGate from '@/components/ModeGate';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import CategorySelector from '@/components/purchase/CategorySelector';
import PurchaseAnalyzer from '@/components/purchase/PurchaseAnalyzer';
import VehicleAnalysis from '@/components/purchase/categories/VehicleAnalysis';
import HousingAnalysis from '@/components/purchase/categories/HousingAnalysis';
import ElectronicsAnalysis from '@/components/purchase/categories/ElectronicsAnalysis';
import EventAnalysis from '@/components/purchase/categories/EventAnalysis';
import { anchorGhostButtonClass } from '@/lib/anchorTheme';

export default function PurchaseSimulator() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
  });

  const currentMode = profile?.mode || 'basic';

  if (isLoading) {
    return (
      <PageShell title="Kan jag köpa det här?" backHref={createPageUrl('Dashboard')}>
        <p className="text-[15px] text-white/45 py-8 text-center">Laddar…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Kan jag köpa det här?"
      subtitle="Klistra in länk, ladda upp bild eller välj typ av köp"
      backHref={createPageUrl('Dashboard')}
    >
      <ModeGate feature="purchase_simulator" mode={currentMode}>
        <DashboardSection title="Snabbkoll" subtitle="Länk eller bild från annons">
          <PurchaseAnalyzer profile={profile} />
        </DashboardSection>

        <DashboardDivider className="my-6" />

        {!selectedCategory ? (
          <DashboardSection title="Eller välj typ av köp">
            <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
          </DashboardSection>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`${anchorGhostButtonClass} mb-4`}
            >
              ← Byt typ av köp
            </button>
            {selectedCategory === 'vehicle' && (
              <VehicleAnalysis mode={currentMode} profile={profile} />
            )}
            {selectedCategory === 'housing' && (
              <HousingAnalysis mode={currentMode} profile={profile} />
            )}
            {selectedCategory === 'electronics' && (
              <ElectronicsAnalysis mode={currentMode} profile={profile} />
            )}
            {selectedCategory === 'event' && (
              <EventAnalysis mode={currentMode} profile={profile} />
            )}
          </>
        )}
      </ModeGate>
    </PageShell>
  );
}
