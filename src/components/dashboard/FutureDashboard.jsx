import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, Zap, PiggyBank, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import OrbitCore from './OrbitCore';
import LiquidGoal from './LiquidGoal';
import DataStrip from './DataStrip';
import AIStoryBar from './AIStoryBar';
import SparklineWidget from './SparklineWidget';
import IncomeStar from './IncomeStar';
import CrystalArtifact from './CrystalArtifact';
import ForceFieldBudget from './ForceFieldBudget';
import CommandCenter from './CommandCenter';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function FutureDashboard({
  profile,
  transactions,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [magicSpotlight, setMagicSpotlight] = useState(false);

  const totalFixed     = getTotalFixedCosts(profile);
  const monthlyMargin  = profile.income - totalFixed;
  const savingsPct     = profile.savingsGoal
    ? Math.min(100, Math.round(((profile.savingsCurrentBalance || 0) / profile.savingsGoal) * 100))
    : 0;

  const handleMagicEntry = () => {
    setMagicSpotlight(true);
    setTimeout(() => {
      setMagicSpotlight(false);
      onOpenMagicEntry?.();
    }, 600);
  };

  return (
    <div
      className="min-h-screen pb-28 relative"
      style={{ background: 'linear-gradient(160deg, #050a15 0%, #090e1e 55%, #07101c 100%)' }}
    >
      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Nebula clouds */}
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(15,222,189,0.06) 0%, transparent 65%)' }} />
        <div className="absolute bottom-40 left-[-80px] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)' }} />
        <div className="absolute top-1/3 right-[-60px] w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.05) 0%, transparent 65%)' }} />
        {/* Stars */}
        {[...Array(28)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              top:  `${(i * 37 + 5) % 100}%`,
              left: `${(i * 61 + 7) % 100}%`,
              background: '#fff',
              opacity: 0.15 + (i % 4) * 0.08,
            }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i * 0.3) % 4 }}
          />
        ))}
      </div>

      {/* Spotlight dim overlay */}
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
      <div className="relative z-10 px-5 pt-10 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>ANCHOR</p>
          <h1 className="text-xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            {user?.full_name?.split(' ')[0] || 'Din ekonomi'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>INKOMST</p>
            <p className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.6)' }}>{fmt(profile.income)} kr</p>
          </div>
          <Link to={createPageUrl('Settings')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <Settings className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </Link>
        </div>
      </div>

      {/* AI Story Bar */}
      <div className="relative z-10 mt-2">
        <AIStoryBar profile={profile} transactions={transactions} />
      </div>

      {/* THE ORBIT CORE */}
      <div className="relative z-10 mt-1">
        <OrbitCore profile={profile} />
      </div>

      {/* Bento Grid */}
      <div className="relative z-10 px-4 space-y-3">

        {/* Liquid Goal — full width */}
        <LiquidGoal profile={profile} />

        {/* Data Strip — Marginal & Skulder scanner */}
        <DataStrip profile={profile} />

        {/* Row: Sparkline + Income Star */}
        <div className="grid grid-cols-2 gap-3">
          <SparklineWidget transactions={transactions} />
          <IncomeStar income={profile.income} />
        </div>

        {/* Row: Crystal Artifact + Force Field Budget */}
        <div className="grid grid-cols-2 gap-3">
          <CrystalArtifact />
          <ForceFieldBudget profile={profile} />
        </div>

        {/* Command Center — Input Portal */}
        <CommandCenter onMagicEntry={handleMagicEntry} />
      </div>

      {/* Pull-up Drawer handle */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 flex justify-center pointer-events-none">
        <motion.button
          onClick={() => setDrawerOpen(true)}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-t-2xl pointer-events-auto"
          style={{ background: 'rgba(15,222,189,0.1)', border: '1px solid rgba(15,222,189,0.18)', borderBottom: 'none' }}
        >
          <ChevronUp className="w-4 h-4" style={{ color: '#0FDEBD' }} />
          <span className="text-[8px] font-black tracking-widest" style={{ color: '#0FDEBD' }}>TRANSAKTIONER</span>
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
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ background: '#080c1a', border: '1px solid rgba(15,222,189,0.18)', maxHeight: '70vh' }}>
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
              </div>
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>KONTROLLPANEL</p>
                  <button onClick={() => setDrawerOpen(false)} className="text-xs font-bold" style={{ color: '#0FDEBD' }}>Stäng</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Registrera', icon: Zap, color: '#0FDEBD', action: () => { setDrawerOpen(false); onOpenExpense(); } },
                    { label: 'Spara', icon: PiggyBank, color: '#A78BFA', action: () => { setDrawerOpen(false); onOpenTransactionHub(); } },
                    { label: 'Historia', icon: TrendingUp, color: '#F6AD55', href: createPageUrl('TransactionHistory') },
                  ].map(item => {
                    const Ic = item.icon;
                    const inner = (
                      <motion.div whileTap={{ scale: 0.93 }} onClick={item.action}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer"
                        style={{ background: `${item.color}10`, border: `1px solid ${item.color}28` }}>
                        <Ic className="w-5 h-5" style={{ color: item.color }} />
                        <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</span>
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