import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import BasicTravelPlanner from '@/components/travel/BasicTravelPlanner';
import SmartTravelPlanner from '@/components/travel/SmartTravelPlanner';
import ProTravelPlanner from '@/components/travel/ProTravelPlanner';
import TravelAgentChat from '@/components/travel/TravelAgentChat';
import { anchorSecondaryButtonClass } from '@/lib/anchorTheme';
import PageShellSkeleton from '@/components/loading/PageShellSkeleton';
import PlanGate from '@/components/billing/PlanGate';

export default function TravelPlanner() {
  const [activeTab, setActiveTab] = useState('agent');

  const { profile, isLoading } = useFinancialProfile();

  const currentMode = profile?.mode || 'basic';

  if (isLoading) {
    return <PageShellSkeleton sections={2} />;
  }

  return (
    <PageShell
      title="Planera en resa"
      subtitle="Budget och kostnad per dag"
      backHref={createPageUrl('Dashboard')}
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            className={`${anchorSecondaryButtonClass} h-9 px-3 text-[13px] ${
              activeTab === 'agent'
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : ''
            }`}
          >
            Fråga
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`${anchorSecondaryButtonClass} h-9 px-3 text-[13px] ${
              activeTab === 'analyze'
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : ''
            }`}
          >
            Räkna
          </button>
        </div>
      }
    >
      {activeTab === 'agent' && (
        <PlanGate feature="future_pulse">
          <TravelAgentChat profile={profile} />
        </PlanGate>
      )}
      {activeTab === 'analyze' && (
        <>
          {currentMode === 'basic' && <BasicTravelPlanner profile={profile} />}
          {currentMode === 'smart' && <SmartTravelPlanner profile={profile} />}
          {currentMode === 'pro' && <ProTravelPlanner profile={profile} />}
        </>
      )}
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('TravelPlanner');
