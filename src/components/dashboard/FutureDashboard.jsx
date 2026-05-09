import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, Zap, PiggyBank, TrendingUp, Calculator } from 'lucide-react';
import { createPageUrl } from '@/utils';
import AIStoryBar from './AIStoryBar';
import SpendableHero from './SpendableHero';
import MoneyOverview from './MoneyOverview';
import DebtCheck from './DebtCheck';
import SavingsAndBudget from './SavingsAndBudget';
import MagicEntryBox from '@/components/import/MagicEntryBox';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import MLIBanner from '@/components/dashboard/MLIBanner';
import { calculateMLI, getMLIToneConfig, resetActionDensity } from '@/lib/mliEngine';
import SpendingHubModule from '@/components/dashboard/SpendingHubModule';

export default function FutureDashboard({
  profile,
  transactions,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
  alexMode,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [magicSpotlight, setMagicSpotlight] = useState(false);
  const [kalkylatornOpen, setKalkylatornOpen] = useState(false);

  // Beräkna MLI vid varje render (körs en gång per session via resetActionDensity)
  const mli = useMemo(() => {
    resetActionDensity();
    return calculateMLI(transactions || [], profile);
  }, [transactions, profile]);

  const toneConfig = useMemo(() => getMLIToneConfig(mli), [mli]);

  const handleMagicEntry = () => {
    setMagicSpotlight(true);
    setTimeout(() => {
      setMagicSpotlight(false);
      onOpenMagicEntry?.();
    }, 600);
  };

  return (
    <div
      className="min-h-screen pb-32 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #2f5cff 0%, #1846e7 22%, #0a239e 52%, #060f4a 78%, #040814 100%)' }}
    >
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,213,255,0.18) 0%, transparent 65%)' }} />
        <div className="absolute bottom-40 left-[-80px] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(111,145,255,0.14) 0%, transparent 65%)' }} />
        {[...Array(22)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              top: `${(i * 37 + 5) % 100}%`,
              left: `${(i * 61 + 7) % 100}%`,
              background: '#fff',
              opacity: 0.11 + (i % 4) * 0.08,
            }}
            animate={{ opacity: [0.08, 0.34, 0.08] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i * 0.3) % 4 }}
          />
        ))}
      </div>

      {/* Spotlight overlay */}
      <AnimatePresence>
        {magicSpotlight && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-5 pt-8 sm:pt-10 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Anchor</p>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {user?.full_name?.split(' ')[0] || 'Din ekonomi'}
          </h1>
        </div>
        <Link to={createPageUrl('Settings')}>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <Settings className="w-4 h-4 text-white/75" />
          </button>
        </Link>
      </div>

      {/* MLI Banner — kontextuellt meddelande */}
      <div className="relative z-10 mt-2">
        <MLIBanner mli={mli} greeting={toneConfig.greeting} />
      </div>

      {/* AI Story Bar */}
      <div className="relative z-10 mt-2">
        <AIStoryBar profile={profile} transactions={transactions} />
      </div>

      {/* ─── KAPITEL 1: SANNINGEN ─── */}
      <div className="relative z-10 mt-3">
        <SpendableHero profile={profile} />
      </div>

      {/* ─── KAPITEL 2: FLÖDE ─── */}
      <div className="relative z-10 mt-3 space-y-3">
        <MoneyOverview profile={profile} />
        <DebtCheck profile={profile} />
      </div>

      {/* ─── KAPITEL 3: HINKARNA ─── */}
      <div className="relative z-10 mt-3">
        <SavingsAndBudget profile={profile} />
      </div>

      {/* ─── KAPITEL 4: VART PENGARNA GÅR ─── */}
      <div className="relative z-10 mt-3">
        <SpendingHubModule transactions={transactions || []} profile={profile} />
      </div>

      {/* Action buttons row */}
      <div className="relative z-10 mx-4 mt-4 flex flex-col sm:flex-row gap-3">
        {/* Magic entry */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleMagicEntry}
          className="w-full sm:flex-1 h-14 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 text-slate-900"
          style={{
            background: '#fff',
            boxShadow: '0 14px 32px rgba(0,0,0,0.22)',
          }}
        >
          <Zap className="w-4 h-4 text-slate-800" />
          Magisk inmatning
        </motion.button>

        {/* Kalkylator — gateway to pro tools */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setKalkylatornOpen(true)}
          className="w-full sm:w-auto h-14 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white/90"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            flexShrink: 0,
          }}
        >
          <Calculator className="w-4 h-4 text-white/80" />
          <span>Kalkylator</span>
        </motion.button>
      </div>

      <KalkylatornSheet isOpen={kalkylatornOpen} onClose={() => setKalkylatornOpen(false)} />

      {/* Pull-up Drawer handle */}
      <div className="fixed bottom-[76px] sm:bottom-[72px] left-0 right-0 z-40 flex justify-center pointer-events-none">
        <motion.button
          onClick={() => setDrawerOpen(true)}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 px-6 py-2.5 rounded-t-[20px] pointer-events-auto"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', borderBottom: 'none' }}
        >
          <ChevronUp className="w-4 h-4 text-white/70" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">Transaktioner</span>
        </motion.button>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
              onClick={() => setDrawerOpen(false)} />
            <motion.div key="dw"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(18,28,52,0.98) 0%, rgba(8,12,24,0.98) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderBottom: 'none',
                maxHeight: '70vh',
                boxShadow: '0 -20px 48px rgba(2,8,23,0.45)',
              }}>
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Snabbval</p>
                  <button type="button" onClick={() => setDrawerOpen(false)} className="text-xs font-semibold text-white/70 hover:text-white">
                    Stäng
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Registrera', icon: Zap, action: () => { setDrawerOpen(false); onOpenExpense(); } },
                    { label: 'Spara', icon: PiggyBank, action: () => { setDrawerOpen(false); onOpenTransactionHub(); } },
                    { label: 'Historia', icon: TrendingUp, href: createPageUrl('TransactionHistory') },
                  ].map(item => {
                    const Ic = item.icon;
                    const inner = (
                      <motion.div whileTap={{ scale: 0.93 }} onClick={item.action}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Ic className="w-5 h-5 text-white/85" />
                        <span className="text-xs font-medium text-white/70">{item.label}</span>
                      </motion.div>
                    );
                    return item.href
                      ? <Link key={item.label} to={item.href} onClick={() => setDrawerOpen(false)}>{inner}</Link>
                      : <div key={item.label}>{inner}</div>;
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