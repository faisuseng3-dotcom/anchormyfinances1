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
              activeTab === 'agent' ? 'bg-white/15' : ''
            }`}
          >
            Fråga
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`${anchorSecondaryButtonClass} h-9 px-3 text-[13px] ${
              activeTab === 'analyze' ? 'bg-white/15' : ''
            }`}
          >
            Räkna
          </button>
        </div>
      }
    >
      {activeTab === 'agent' && <TravelAgentChat profile={profile} />}
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
