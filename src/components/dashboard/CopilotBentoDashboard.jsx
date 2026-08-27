import React, { useState, useEffect } from 'react';
import QuickExpenseSheet from './QuickExpenseSheet';
import CopilotFreeMoneyHero from '@/components/ui-premium/copilot/CopilotFreeMoneyHero';
import DashboardQuickActions from './DashboardQuickActions';
import SubscriptionDueToday from './SubscriptionDueToday';
import DashboardAccountsSummary from './DashboardAccountsSummary';
import DashboardRecentActivity from './DashboardRecentActivity';
import DashboardDiscoveries from './DashboardDiscoveries';
import LagoRecommends from './LagoRecommends';
import ImportBankCta from './ImportBankCta';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import { recordSafeToSpendView } from '@/lib/northStar';
import { base44 } from '@/api/base44Client';

const DASHBOARD_LAYOUT_ID = 'revolut-balance-hero';

export default function CopilotBentoDashboard({
  profile,
  transactions,
  onOpenTransactionHub,
  onOpenMagicEntry,
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
      className="copilot-bento-dashboard copilot-bento-dashboard--open min-h-full flex flex-col flex-1 w-full"
      data-dashboard-layout={DASHBOARD_LAYOUT_ID}
    >
      <section className="anchor-dashboard-hero" aria-label="Säkert att spendera">
        <CopilotFreeMoneyHero layout="balance" />
      </section>

      <div className="anchor-dashboard-below">
        <DashboardQuickActions
          onAddTransaction={() => setQuickExpenseOpen(true)}
          onTransfer={onOpenTransactionHub}
        />
        <SubscriptionDueToday profile={profile} />
        <DashboardAccountsSummary profile={profile} />
        <DashboardRecentActivity transactions={transactions} />
        <DashboardDiscoveries profile={profile} transactions={transactions} />
        <LagoRecommends profile={profile} transactions={transactions} />
        <ImportBankCta transactionCount={(transactions || []).length} variant="link" />
      </div>

      <QuickExpenseSheet
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        profile={profile}
        transactions={transactions}
        onSwitchToWrite={onOpenMagicEntry ? () => {
          setQuickExpenseOpen(false);
          onOpenMagicEntry();
        } : undefined}
      />
    </div>
  );
}
