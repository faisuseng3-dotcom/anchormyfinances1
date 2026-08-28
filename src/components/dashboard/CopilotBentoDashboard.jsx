import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
import { dashboardEntryItem } from '@/lib/motionPresets';

const DASHBOARD_LAYOUT_ID = 'revolut-balance-hero';

export default function CopilotBentoDashboard({
  profile,
  transactions,
  onOpenTransactionHub,
  onOpenMagicEntry,
}) {
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const reduced = useReducedMotion();
  const entry = (i) => dashboardEntryItem(i, { reduced });

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
      <motion.section {...entry(0)} className="anchor-dashboard-hero" aria-label="Säkert att spendera">
        <CopilotFreeMoneyHero layout="balance" />
      </motion.section>

      <div className="anchor-dashboard-below">
        <motion.div {...entry(1)}>
          <DashboardQuickActions
            onAddTransaction={() => setQuickExpenseOpen(true)}
            onTransfer={onOpenTransactionHub}
          />
        </motion.div>
        <motion.div {...entry(2)}>
          <SubscriptionDueToday profile={profile} />
        </motion.div>
        <motion.div {...entry(3)}>
          <DashboardAccountsSummary profile={profile} />
        </motion.div>
        <motion.div {...entry(4)}>
          <DashboardRecentActivity transactions={transactions} />
        </motion.div>
        <motion.div {...entry(5)}>
          <DashboardDiscoveries profile={profile} transactions={transactions} />
        </motion.div>
        <motion.div {...entry(6)}>
          <LagoRecommends profile={profile} transactions={transactions} />
        </motion.div>
        <motion.div {...entry(7)}>
          <ImportBankCta transactionCount={(transactions || []).length} variant="link" />
        </motion.div>
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
