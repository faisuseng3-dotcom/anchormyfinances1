import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, Zap, PiggyBank, TrendingUp, Calculator } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  anchorIconButtonClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  anchorZoneClass,
  elevatedSheet,
} from '@/lib/anchorTheme';
import { DashboardDivider } from './DashboardChrome';
import AIStoryBar from './AIStoryBar';
import SpendableHero from './SpendableHero';
import FuturePulse from './FuturePulse';
import MoneyOverview from './MoneyOverview';
import DebtCheck from './DebtCheck';
import SavingsAndBudget from './SavingsAndBudget';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import MLIBanner from '@/components/dashboard/MLIBanner';
import { calculateMLI, getMLIToneConfig, resetActionDensity } from '@/lib/mliEngine';
import SpendingHubModule from '@/components/dashboard/SpendingHubModule';
import LeakageDetector from '@/components/dashboard/LeakageDetector';

export default function FutureDashboard({
  profile,
  transactions,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [magicSpotlight, setMagicSpotlight] = useState(false);
  const [kalkylatornOpen, setKalkylatornOpen] = useState(false);

  const mli = useMemo(() => {
    resetActionDensity();
    return calculateMLI(transactions || [], profile);
  }, [transactions, profile]);

  const toneConfig = useMemo(() => getMLIToneConfig(mli), [mli]);
  const firstName = user?.full_name?.split(' ')[0] || 'Hej';

  const handleMagicEntry = () => {
    setMagicSpotlight(true);
    setTimeout(() => {
      setMagicSpotlight(false);
      onOpenMagicEntry?.();
    }, 600);
  };

  return (
    <div className="min-h-screen pb-36 relative overflow-x-hidden anchor-page">
      {/* Soft top glow — Wallet-style depth */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 50% at 50% -10%, rgba(120,160,255,0.22) 0%, transparent 55%)',
        }}
      />

      <AnimatePresence>
        {magicSpotlight && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Header — minimal, Monzo-style */}
      <header className={`relative z-10 ${anchorZoneClass} pt-10 sm:pt-12 pb-2 flex items-center justify-between`}>
        <div>
          <p className="text-[15px] text-white/50">{firstName}</p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight mt-0.5">Översikt</h1>
        </div>
        <Link to={createPageUrl('Settings')} aria-label="Inställningar">
          <span className={anchorIconButtonClass}>
            <Settings className="w-4 h-4" />
          </span>
        </Link>
      </header>

      <div className="relative z-10">
        <MLIBanner mli={mli} greeting={toneConfig.greeting} />
        <SpendableHero profile={profile} />

        {/* Primary actions — directly under hero so they stay reachable after import */}
        <div className={`${anchorZoneClass} mt-5 flex flex-col sm:flex-row gap-3`}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleMagicEntry}
            className={`${anchorPrimaryButtonClass} w-full sm:flex-1`}
          >
            <Zap className="w-4 h-4" />
            Magisk inmatning
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setKalkylatornOpen(true)}
            className={`${anchorSecondaryButtonClass} w-full sm:w-auto sm:min-w-[140px]`}
          >
            <Calculator className="w-4 h-4" />
            Kalkylator
          </motion.button>
        </div>
        <div className={`${anchorZoneClass} mt-2 flex flex-col sm:flex-row gap-2 sm:gap-3`}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenExpense?.()}
            className={`${anchorSecondaryButtonClass} w-full sm:flex-1 text-[14px]`}
          >
            Registrera utgift
          </motion.button>
          <Link
            to={createPageUrl('Import')}
            className={`${anchorSecondaryButtonClass} w-full sm:flex-1 text-center no-underline text-[14px] flex items-center justify-center`}
          >
            Importera CSV
          </Link>
        </div>

        <AIStoryBar profile={profile} transactions={transactions} />

        <DashboardDivider className="mx-5 sm:mx-6 my-6" />

        <FuturePulse profile={profile} transactions={transactions} />

        <DashboardDivider className="mx-5 sm:mx-6 my-6" />

        <MoneyOverview profile={profile} />
        <div className="h-8" />
        <DebtCheck profile={profile} />
        <div className="h-8" />
        <SavingsAndBudget profile={profile} />
        <div className="h-8" />
        <SpendingHubModule transactions={transactions || []} profile={profile} />
        <div className="h-8" />
        <LeakageDetector profile={profile} transactions={transactions} variant="dashboard" />
      </div>

      <KalkylatornSheet
        isOpen={kalkylatornOpen}
        onClose={() => setKalkylatornOpen(false)}
        profile={profile}
      />

      {/* Transaction drawer — single elevated surface */}
      <div className="fixed bottom-[76px] sm:bottom-[72px] left-0 right-0 z-40 flex justify-center pointer-events-none">
        <motion.button
          type="button"
          onClick={() => setDrawerOpen(true)}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full pointer-events-auto text-[13px] font-medium text-white/70 bg-white/[0.08] hover:bg-white/[0.12] transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          Transaktioner
        </motion.button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="dw"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden max-h-[70vh]"
              style={elevatedSheet()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </div>
              <div className={`${anchorZoneClass} pb-10`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[17px] font-semibold text-white">Snabbval</h2>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="text-[15px] font-medium text-white/55 hover:text-white"
                  >
                    Stäng
                  </button>
                </div>
                <div className="space-y-0">
                  {[
                    { label: 'Registrera utgift', icon: Zap, action: () => { setDrawerOpen(false); onOpenExpense(); } },
                    { label: 'Spara pengar', icon: PiggyBank, action: () => { setDrawerOpen(false); onOpenTransactionHub(); } },
                    { label: 'Historik', icon: TrendingUp, href: createPageUrl('TransactionHistory') },
                  ].map((item, i) => {
                    const Ic = item.icon;
                    const rowInner = (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                          <Ic className="w-5 h-5 text-white/85" />
                        </div>
                        <span className="text-[15px] font-medium text-white">{item.label}</span>
                      </>
                    );
                    return (
                      <React.Fragment key={item.label}>
                        {i > 0 && <DashboardDivider />}
                        {item.href ? (
                          <Link
                            to={item.href}
                            onClick={() => setDrawerOpen(false)}
                            className="flex items-center gap-4 py-4 w-full no-underline active:opacity-70"
                          >
                            {rowInner}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-4 py-4 w-full text-left active:opacity-70"
                            onClick={item.action}
                          >
                            {rowInner}
                          </button>
                        )}
                      </React.Fragment>
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
