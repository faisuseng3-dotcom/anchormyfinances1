import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ChevronUp, FileUp, Zap, PiggyBank, CreditCard, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import EnergyCore from './EnergyCore';
import AIStoryBar from './AIStoryBar';
import GravityWell from './GravityWell';
import SparklineWidget from './SparklineWidget';
import QuickStatOrb from './QuickStatOrb';
import { getTotalFixedCosts } from '@/lib/financialUtils';

/**
 * FutureDashboard — Bento-Futurism layout som ersätter den traditionella dashboard-listan.
 * Mörk bakgrund, neon-accenter, EnergyCore i centrum.
 */
export default function FutureDashboard({
  profile,
  transactions,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const loans = (profile.loans || []).reduce((s, l) => s + (l.totalAmount || 0), 0);
  const savingsPct = profile.savingsGoal ? Math.min(100, Math.round(((profile.savingsCurrentBalance || 0) / profile.savingsGoal) * 100)) : 0;

  return (
    <div
      className="min-h-screen pb-28 relative"
      style={{ background: 'linear-gradient(160deg, #070b18 0%, #0c1428 60%, #0a1220 100%)' }}
    >
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(15,222,189,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-32 left-[-40px] w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-10 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>ANCHOR</p>
          <h1 className="text-xl font-black" style={{ color: '#fff' }}>
            {user?.full_name?.split(' ')[0] || 'Din ekonomi'}
          </h1>
        </div>
        <Link to={createPageUrl('Settings')}>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Settings className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </Link>
      </div>

      {/* AI Story Bar */}
      <div className="relative z-10 mt-3">
        <AIStoryBar profile={profile} transactions={transactions} />
      </div>

      {/* Energy Core */}
      <div className="relative z-10 mt-2">
        <EnergyCore profile={profile} />
      </div>

      {/* Bento Grid */}
      <div className="relative z-10 px-4 mt-4 space-y-3">

        {/* Row 1: Sparkline + Gravity Well side by side */}
        <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <SparklineWidget transactions={transactions} />
          <GravityWell profile={profile} />
        </div>

        {/* Row 2: Stat orbs */}
        <div className="grid grid-cols-3 gap-3">
          <QuickStatOrb
            label="MARGINAL"
            value={monthlyMargin >= 1000 ? `${Math.round(monthlyMargin/1000)}k` : monthlyMargin.toLocaleString('sv-SE')}
            sub="kr/mån"
            color="#0FDEBD"
            delay={0.05}
          />
          <QuickStatOrb
            label="LÅN"
            value={loans >= 1000 ? `${Math.round(loans/1000)}k` : loans.toLocaleString('sv-SE')}
            sub="kr totalt"
            color="#FF4466"
            href="/Loans"
            delay={0.1}
          />
          <QuickStatOrb
            label="SPARAT"
            value={`${savingsPct}%`}
            sub="av mål"
            color="#A78BFA"
            href="/SavingsGoals"
            delay={0.15}
          />
        </div>

        {/* Row 3: Pro tools + Budget side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl('ProTools')}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="rounded-3xl p-4 flex flex-col justify-between"
              style={{
                height: 90,
                background: 'linear-gradient(135deg, rgba(45,31,110,0.9) 0%, rgba(26,47,94,0.9) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(180,168,255,0.6)' }}>SUPERKRAFTER</p>
              <p className="text-sm font-black" style={{ color: '#e0d8ff' }}>Pro Verktyg</p>
            </motion.div>
          </Link>
          <Link to="/Budget">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="rounded-3xl p-4 flex flex-col justify-between"
              style={{
                height: 90,
                background: 'rgba(10,12,22,0.85)',
                border: '1px solid rgba(246,173,85,0.25)',
              }}
            >
              <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(246,173,85,0.6)' }}>BUDGET</p>
              <p className="text-sm font-black" style={{ color: '#FED7AA' }}>Hantera gränser</p>
            </motion.div>
          </Link>
        </div>

        {/* Row 4: Import & Magic entry */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/Import">
            <motion.div whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FileUp className="w-4 h-4" style={{ color: '#0FDEBD' }} />
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Importera CSV</span>
            </motion.div>
          </Link>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenMagicEntry}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Zap className="w-4 h-4" style={{ color: '#A78BFA' }} />
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Magisk inmatning</span>
          </motion.button>
        </div>
      </div>

      {/* Pull-up Drawer handle */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 flex justify-center">
        <motion.button
          onClick={() => setDrawerOpen(true)}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-t-2xl"
          style={{ background: 'rgba(15,222,189,0.12)', border: '1px solid rgba(15,222,189,0.2)', borderBottom: 'none' }}
        >
          <ChevronUp className="w-4 h-4" style={{ color: '#0FDEBD' }} />
          <span className="text-[9px] font-black tracking-widest" style={{ color: '#0FDEBD' }}>TRANSAKTIONER</span>
        </motion.button>
      </div>

      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ background: '#0c1428', border: '1px solid rgba(15,222,189,0.2)', maxHeight: '70vh' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>KONTROLLPANEL</p>
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
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        onClick={item.action}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer"
                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}
                      >
                        <Ic className="w-5 h-5" style={{ color: item.color }} />
                        <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
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