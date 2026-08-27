import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import PlanGate from '@/components/billing/PlanGate';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import CategorySelector from '@/components/purchase/CategorySelector';
import PurchaseAnalyzer from '@/components/purchase/PurchaseAnalyzer';
import PurchaseHero from '@/components/purchase/PurchaseHero';
import VehicleAnalysis from '@/components/purchase/categories/VehicleAnalysis';
import HousingAnalysis from '@/components/purchase/categories/HousingAnalysis';
import ElectronicsAnalysis from '@/components/purchase/categories/ElectronicsAnalysis';
import EventAnalysis from '@/components/purchase/categories/EventAnalysis';
import { anchorGhostButtonClass } from '@/lib/anchorTheme';
import PageShellSkeleton from '@/components/loading/PageShellSkeleton';

export default function PurchaseSimulator() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { profile, isLoading } = useFinancialProfile();
  const currentMode = profile?.mode || 'basic';

  if (isLoading) {
    return <PageShellSkeleton sections={2} />;
  }

  return (
    <PageShell
      title="Kan jag köpa det här?"
      subtitle="Simulera större köp"
      backHref={createPageUrl('Dashboard')}
    >
      <PlanGate feature="purchase_simulator">
        <PurchaseHero profile={profile} />

        <DashboardSection nested title="Snabbkoll" subtitle="Länk eller bild från annons">
          <PurchaseAnalyzer profile={profile} />
        </DashboardSection>

        <DashboardDivider className="my-6" />

        {!selectedCategory ? (
          <DashboardSection nested title="Större köp" subtitle="Fordons-, bostads- och eventanalys">
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
            {selectedCategory === 'vehicle' && <VehicleAnalysis mode={currentMode} profile={profile} />}
            {selectedCategory === 'housing' && <HousingAnalysis mode={currentMode} profile={profile} />}
            {selectedCategory === 'electronics' && (
              <ElectronicsAnalysis mode={currentMode} profile={profile} />
            )}
            {selectedCategory === 'event' && <EventAnalysis mode={currentMode} profile={profile} />}
          </>
        )}
      </PlanGate>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('PurchaseSimulator');
