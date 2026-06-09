import React, { useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import PlanCalendar from '@/components/calendar/PlanCalendar';
import DinFramtidPanel from '@/components/future/DinFramtidPanel';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { useTransactions } from '@/hooks/useTransactions';
import { useModeContext } from '@/components/modes/ModeContext';
import { getBufferRunwayMonths } from '@/lib/economicHealth';

export default function FuturePulse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const { isBusiness } = useModeContext();
  const { profile } = useFinancialProfile();
  const { profileWithEvents, savePlannedEvents, syncFromLocalIfEmpty } = usePlannedEvents();
  const { transactions } = useTransactions({ limit: 1000 });
  const runwayMonths = getBufferRunwayMonths(profile);
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
        {runwayMonths != null && runwayMonths > 0 && (
          <p className="mb-4 rounded-2xl px-4 py-3 organic-surface bg-[var(--copilot-bg-card)] text-[14px] text-[var(--copilot-text-secondary)]">
            Din buffert ger{' '}
            <span className="text-[var(--copilot-accent-green)] font-semibold tabular-nums">{runwayMonths}</span>
            {' '}månad{runwayMonths === 1 ? '' : 'er'} handlingsutrymme framåt.
          </p>
        )}
        <PlanCalendar
          profile={profileWithEvents || profile}
          onSavePlannedEvents={savePlannedEvents}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Din Framtid"
      subtitle="Se vad som väntar — justera och planera framåt"
      backHref={createPageUrl('Dashboard')}
    >
      <DinFramtidPanel profile={profile} transactions={transactions} />
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('FuturePulse');
