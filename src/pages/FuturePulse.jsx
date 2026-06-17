import React, { useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import PlanCalendar from '@/components/planner/PlanCalendar';
import ScenarioCompare from '@/components/future/ScenarioCompare';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { useTransactions } from '@/hooks/useTransactions';
import { useModeContext } from '@/components/modes/ModeContext';
import PlanGate from '@/components/billing/PlanGate';

export default function FuturePulse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const { isBusiness } = useModeContext();
  const { profile } = useFinancialProfile();
  const { profileWithEvents, savePlannedEvents, syncFromLocalIfEmpty } = usePlannedEvents();
  const { transactions } = useTransactions({ limit: 1000 });
  const showCalendar = view === 'kalender';

  useEffect(() => {
    if (isBusiness) navigate('/BusinessDashboard', { replace: true });
  }, [isBusiness, navigate]);

  useEffect(() => {
    syncFromLocalIfEmpty();
  }, [syncFromLocalIfEmpty]);

  if (showCalendar) {
    return (
      <PageShell
        title="Ekonomikalender"
        subtitle="Planerade händelser"
        backHref={createPageUrl('FuturePulse')}
      >
        <PlanGate feature="future_pulse">
          <PlanCalendar
            profile={profileWithEvents || profile}
            onSavePlannedEvents={savePlannedEvents}
          />
        </PlanGate>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Framtid"
      subtitle="Tre scenarier — vad händer om du fortsätter eller ändrar något?"
      backHref={createPageUrl('Dashboard')}
    >
      <PlanGate feature="future_pulse">
        <ScenarioCompare profile={profile} transactions={transactions} />
      </PlanGate>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('FuturePulse');
