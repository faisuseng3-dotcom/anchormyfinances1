import React, { useState, useEffect } from 'react';
import QuickExpenseSheet from './QuickExpenseSheet';
import CopilotFreeMoneyHero from '@/components/ui-premium/copilot/CopilotFreeMoneyHero';
import ProactiveInsights from './ProactiveInsights';
import UpcomingThings from './UpcomingThings';
import WeeklyReport from './WeeklyReport';
import EconomicControlCard from './EconomicControlCard';
import ImportBankCta from './ImportBankCta';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import { recordSafeToSpendView } from '@/lib/northStar';
import { base44 } from '@/api/base44Client';

const DASHBOARD_LAYOUT_ID = 'north-star-v1';

export default function CopilotBentoDashboard({
  profile,
  transactions,
}) {
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  useProactiveWeekPush(profile);

  useEffect(() => {
    const open = () => setQuickExpenseOpen(true);
    window.addEventListener('anchor:open-quick-expense', open);
    return () => window.removeEventListener('anchor:open-quick-expense', open);
  }, []);

  useEffect(() => {
    if (!profile?.income) return;
    const count = recordSafeToSpendView();
    base44.analytics?.track?.({
      eventName: 'north_star_safe_to_spend_view',
      properties: { weeklyOpens: count },
    });
  }, [profile?.income]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CopilotBentoDashboard] layout:', DASHBOARD_LAYOUT_ID);
    }
  }, []);

  return (
    <div
      className="copilot-bento-dashboard min-h-full flex flex-col flex-1 w-full"
      data-dashboard-layout={DASHBOARD_LAYOUT_ID}
    >
      <div className="copilot-content !pt-0 space-y-5 pb-24">

        <CopilotFreeMoneyHero />

        <EconomicControlCard />

        <WeeklyReport profile={profile} transactions={transactions} />

        <ProactiveInsights profile={profile} transactions={transactions} />

        <UpcomingThings profile={profile} />

        <ImportBankCta transactionCount={(transactions || []).length} />
      </div>

      <button
        type="button"
        className="copilot-fab"
        title="Lägg till transaktion"
        aria-label="Lägg till transaktion"
        onClick={() => setQuickExpenseOpen(true)}
      >
        +
      </button>

      <QuickExpenseSheet
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        profile={profile}
      />
    </div>
  );
}
