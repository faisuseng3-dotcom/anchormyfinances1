import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, Zap, PiggyBank, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorIconButtonClass, elevatedSheet } from '@/lib/anchorTheme';
import { dashZone } from '@/lib/dashboardTheme';
import { DashboardDivider } from './DashboardChrome';
import DashboardAmbient from './DashboardAmbient';
import DashboardActionDock from './DashboardActionDock';
import DashboardInsightRail from './DashboardInsightRail';
import AnchorBrainSection from '@/components/anchorBrain/AnchorBrainSection';
import EconomicHealthCard from './EconomicHealthCard';
import MicroWinsStrip from './MicroWinsStrip';
import ProactiveWeekBanner from './ProactiveWeekBanner';
import HomeFocusBanner from './HomeFocusBanner';
import HomeTodaySection from './HomeTodaySection';
import HomeWeekAhead from './HomeWeekAhead';
import DashboardMorePanel from './DashboardMorePanel';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import { calculateMLI, resetActionDensity } from '@/lib/mliEngine';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import QuickExpenseFab from './QuickExpenseFab';
import QuickExpenseSheet from './QuickExpenseSheet';

function weekdayLabel() {
  return new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
}

export default function FutureDashboard({
  profile,
  transactions,
  updateProfile,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  onFocusAction,
  user,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [magicSpotlight, setMagicSpotlight] = useState(false);
  const [kalkylatornOpen, setKalkylatornOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  const mli = useMemo(() => {
    resetActionDensity();
    return calculateMLI(transactions || [], profile);
  }, [transactions, profile]);

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
            className="fixed inset-0 z-50 bg-[#030610]/92 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <header className={`relative z-10 ${dashZone} pt-11 sm:pt-14 pb-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-white/40 capitalize">{weekdayLabel()}</p>
            <h1 className="text-[28px] sm:text-[36px] font-light tracking-tight text-white mt-0.5 break-words">
              Hej {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <EconomicHealthCard profile={profile} transactions={transactions} compact />
            <Link to={createPageUrl('Settings')} aria-label="Inställningar">
              <span className={`${anchorIconButtonClass} bg-white/[0.05] ring-1 ring-white/[0.08]`}>
                <Settings className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 space-y-8">
        <div className={dashZone}>
          <AnchorBrainSection
            profile={profile}
            transactions={transactions}
            updateProfile={updateProfile}
          />
        </div>

        <DashboardInsightRail
          profile={profile}
          transactions={transactions}
          onLessonComplete={updateProfile}
        />

        <div className={dashZone}>
          <ProactiveWeekBanner profile={profile} />
        </div>

        <div className={dashZone}>
          <MicroWinsStrip profile={profile} transactions={transactions} />
        </div>

        <HomeFocusBanner profile={profile} onAction={onFocusAction} variant="chip" />

        <div className={`${dashZone} space-y-7`}>
          <HomeTodaySection toneMode={profile?.toneMode} />
          <HomeWeekAhead profile={profile} />
        </div>

        <div className={dashZone}>
          <DashboardActionDock
            onMagicEntry={handleMagicEntry}
            onOpenCalculator={() => setKalkylatornOpen(true)}
            onOpenExpense={openQuickExpense}
          />
        </div>

        <DashboardDivider className="mx-7 my-2 opacity-40" />

        <DashboardMorePanel
          profile={profile}
          transactions={transactions}
          onOpenExpense={onOpenExpense}
        />
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
        <motion.button
          type="button"
          onClick={() => setDrawerOpen(true)}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-2 px-5 py-2 rounded-full pointer-events-auto text-[13px] font-medium text-white/60 bg-white/[0.06] backdrop-blur-md ring-1 ring-white/[0.1] hover:text-white/90"
        >
          <ChevronUp className="w-4 h-4" />
          Flöde
        </motion.button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] overflow-hidden max-h-[min(72dvh,520px)] max-w-lg mx-auto"
              style={elevatedSheet()}
            >
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>
              <div className={`${dashZone} pb-[max(3rem,env(safe-area-inset-bottom,0px))]`}>
                <p className="text-[13px] text-white/40 mb-4">Snabbval</p>
                <div className="space-y-1">
                  {[
                    { label: 'Registrera utgift', icon: Zap, action: () => { setDrawerOpen(false); openQuickExpense(); } },
                    { label: 'Spara pengar', icon: PiggyBank, action: () => { setDrawerOpen(false); onOpenTransactionHub(); } },
                    { label: 'Historik', icon: TrendingUp, href: createPageUrl('TransactionHistory') },
                  ].map((item) => {
                    const Ic = item.icon;
                    const inner = (
                      <div className="flex items-center gap-4 py-4">
                        <div className="w-11 h-11 rounded-2xl bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08]">
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
                          className="block no-underline active:opacity-70"
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className="w-full text-left active:opacity-70"
                        onClick={item.action}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
