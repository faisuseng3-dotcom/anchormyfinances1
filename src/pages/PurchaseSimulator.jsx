import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import PlanGate from '@/components/billing/PlanGate';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { ChevronDown } from 'lucide-react';
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
  const [showCategories, setShowCategories] = useState(false);
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

        <DashboardSection nested title="Kan jag köpa det här?" subtitle="Skriv, klistra in en länk eller ladda upp en bild">
          <PurchaseAnalyzer profile={profile} />
        </DashboardSection>

        <DashboardDivider className="my-6" />

        {!selectedCategory ? (
          <>
            <button
              type="button"
              onClick={() => setShowCategories((v) => !v)}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Eller gör en djupare analys — fordon, boende, elektronik, event
              <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showCategories ? 'rotate(180deg)' : 'none' }} />
            </button>
            {showCategories && (
              <div className="mt-4">
                <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
              </div>
            )}
          </>
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
