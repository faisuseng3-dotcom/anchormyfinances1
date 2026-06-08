import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, Zap, PiggyBank, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorIconButtonClass } from '@/lib/anchorTheme';
import { dashZone } from '@/lib/dashboardTheme';
import { staggerItem } from '@/lib/motionPresets';
import { DashboardDivider } from './DashboardChrome';
import DashboardAmbient from './DashboardAmbient';
import DashboardActionDock from './DashboardActionDock';
import DashboardInsightRail from './DashboardInsightRail';
import AnchorBrainSection from '@/components/anchorBrain/AnchorBrainSection';
import EconomicHealthCard from './EconomicHealthCard';
import HomeFocusBanner from './HomeFocusBanner';
import HomeTodaySection from './HomeTodaySection';
import HomeWeekAhead from './HomeWeekAhead';
import DashboardMorePanel from './DashboardMorePanel';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import QuickExpenseFab from './QuickExpenseFab';
import QuickExpenseSheet from './QuickExpenseSheet';

function weekdayLabel() {
  return new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
}

/**
 * @param {{ index: number; children: import('react').ReactNode; className?: string }} props
 */
function StaggerSection({ index, children, className = '' }) {
  return (
    <motion.section className={className} {...staggerItem(index)}>
      {children}
    </motion.section>
  );
}

export default function FutureDashboard({
  profile,
  transactions,
  updateProfile,
  onOpenMagicEntry,
  onOpenTransactionHub,
  onFocusAction,
  user,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [magicSpotlight, setMagicSpotlight] = useState(false);
  const [kalkylatornOpen, setKalkylatornOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  useProactiveWeekPush(profile);

  const openQuickExpense = () => setQuickExpenseOpen(true);

  React.useEffect(() => {
    const open = () => setQuickExpenseOpen(true);
    window.addEventListener('anchor:open-quick-expense', open);
    return () => window.removeEventListener('anchor:open-quick-expense', open);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'du';

  const handleMagicEntry = () => {
    setMagicSpotlight(true);
    setTimeout(() => {
      setMagicSpotlight(false);
      onOpenMagicEntry?.();
    }, 450);
  };

  const flowItems = [
    { label: 'Spara pengar', icon: PiggyBank, action: () => { setDrawerOpen(false); onOpenTransactionHub(); } },
    { label: 'Historik', icon: TrendingUp, href: createPageUrl('TransactionHistory') },
    { label: 'Snabb inmatning', icon: Zap, action: () => { setDrawerOpen(false); handleMagicEntry(); } },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] relative overflow-x-hidden anchor-page anchor-dashboard-pad-bottom anchor-mobile-frame">
      <DashboardAmbient />

      <AnimatePresence>
        {magicSpotlight && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 anchor-overlay"
          />
        )}
      </AnimatePresence>

      <header className={`relative z-10 ${dashZone} pt-11 sm:pt-14 pb-6 anchor-hero-asymmetric`}>
        <div className="min-w-0">
          <p className="anchor-type-body-sm text-white/40 capitalize">{weekdayLabel()}</p>
          <h1 className="anchor-type-display mt-1 break-words">
            Hej {firstName}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <EconomicHealthCard profile={profile} transactions={transactions} compact />
          <Link to={createPageUrl('Settings')} aria-label="Inställningar" className="no-underline">
            <span className={`${anchorIconButtonClass} bg-white/[0.05] ring-1 ring-white/[0.08] anchor-elev-1`}>
              <Settings className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-8 pb-4">
        <StaggerSection index={0} className={dashZone}>
          <AnchorBrainSection
            profile={profile}
            transactions={transactions}
            updateProfile={updateProfile}
          />
        </StaggerSection>

        <StaggerSection index={1}>
          <DashboardInsightRail
            profile={profile}
            transactions={transactions}
            onLessonComplete={updateProfile}
          />
        </StaggerSection>

        <StaggerSection index={2} className={dashZone}>
          <HomeFocusBanner profile={profile} onAction={onFocusAction} variant="chip" />
        </StaggerSection>

        <StaggerSection index={3} className={`${dashZone} space-y-7`}>
          <HomeTodaySection
            toneMode={profile?.toneMode}
            profile={profile}
            transactions={transactions}
          />
          <HomeWeekAhead profile={profile} />
        </StaggerSection>

        <StaggerSection index={4} className={dashZone}>
          <DashboardActionDock
            onMagicEntry={handleMagicEntry}
            onOpenCalculator={() => setKalkylatornOpen(true)}
          />
        </StaggerSection>

        <StaggerSection index={5}>
          <DashboardDivider className="mx-7 my-2 opacity-40" />
          <DashboardMorePanel
            profile={profile}
            transactions={transactions}
          />
        </StaggerSection>
      </div>

      <KalkylatornSheet
        isOpen={kalkylatornOpen}
        onClose={() => setKalkylatornOpen(false)}
        profile={profile}
      />

      <QuickExpenseFab onClick={openQuickExpense} />
      <QuickExpenseSheet
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        profile={profile}
      />

      <div
        className="fixed left-0 right-0 z-40 flex justify-center pointer-events-none max-w-lg mx-auto"
        style={{ bottom: 'var(--anchor-flow-btn-bottom)' }}
      >
        <AnchorPressable
          onClick={() => setDrawerOpen(true)}
          minTouch={false}
          className="flex items-center gap-2 px-5 py-3 min-h-12 rounded-full pointer-events-auto text-[13px] font-medium text-white/60 bg-white/[0.06] backdrop-blur-md ring-1 ring-white/[0.1] anchor-elev-2"
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2"
          >
            <ChevronUp className="w-4 h-4" />
            Flöde
          </motion.span>
        </AnchorPressable>
      </div>

      <AnchorSheet
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Snabbval"
        maxHeight="min(72dvh, 520px)"
      >
        <div className="space-y-1 -mx-1">
          {flowItems.map((item) => {
            const Ic = item.icon;
            const inner = (
              <div className="flex items-center gap-4 py-3 min-h-12">
                <div className="w-11 h-11 rounded-[var(--anchor-radius-lg)] bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08] anchor-elev-1">
                  <Ic className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-[16px] font-medium text-white">{item.label}</span>
              </div>
            );
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="block no-underline anchor-pressable rounded-[var(--anchor-radius-md)]"
                >
                  {inner}
                </Link>
              );
            }
            return (
              <AnchorPressable
                key={item.label}
                type="button"
                className="w-full text-left rounded-[var(--anchor-radius-md)]"
                minTouch={false}
                onClick={item.action}
              >
                {inner}
              </AnchorPressable>
            );
          })}
        </div>
      </AnchorSheet>
    </div>
  );
}
