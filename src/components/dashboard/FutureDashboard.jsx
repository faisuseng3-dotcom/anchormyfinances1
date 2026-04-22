import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, ArrowUpRight, ArrowDownLeft, ChevronRight, Zap, PiggyBank, TrendingUp, Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import AIStoryBar from './AIStoryBar';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const FLOW_DATA = [
  { v: 42000 }, { v: 38000 }, { v: 51000 },
  { v: 44000 }, { v: 56000 }, { v: 48000 }, { v: 52000 },
];

const CATEGORY_ICONS = {
  food:          { emoji: '🛒', bg: '#FFF3E0', color: '#E65100' },
  transport:     { emoji: '🚆', bg: '#E8EAF6', color: '#3949AB' },
  entertainment: { emoji: '🎬', bg: '#FCE4EC', color: '#C2185B' },
  shopping:      { emoji: '🛍️', bg: '#E8F5E9', color: '#2E7D32' },
  health:        { emoji: '💊', bg: '#E1F5FE', color: '#0277BD' },
  income:        { emoji: '💰', bg: '#E8F5E9', color: '#1B5E20' },
  savings:       { emoji: '🏦', bg: '#F3E5F5', color: '#6A1B9A' },
  other:         { emoji: '📦', bg: '#F5F5F5', color: '#616161' },
};

function getCatIcon(cat) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.other;
}

export default function FutureDashboard({
  profile,
  transactions,
  onOpenExpense,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const [showActions, setShowActions] = useState(false);

  const totalFixed    = getTotalFixedCosts(profile);
  const safeToSpend   = Math.max(0, profile.income - totalFixed);
  const savingsPct    = profile.savingsGoal
    ? Math.min(100, Math.round(((profile.savingsCurrentBalance || 0) / profile.savingsGoal) * 100))
    : 0;

  const recentTx = (transactions || []).slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: '#F9F8F6' }}>

      {/* ── HEADER ── */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold" style={{ color: '#9AA5B4' }}>🏠 Hem</p>
          <h1 className="text-2xl font-black tracking-tight mt-0.5" style={{ color: '#1A2332' }}>
            {user?.full_name?.split(' ')[0] || 'Översikt'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Bell className="w-4 h-4" style={{ color: '#9AA5B4' }} />
          </button>
          <Link to={createPageUrl('Settings')}>
            <button className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <Settings className="w-4 h-4" style={{ color: '#9AA5B4' }} />
            </button>
          </Link>
        </div>
      </div>

      {/* ── AI STORY BAR ── */}
      <div className="px-5 mb-4">
        <AIStoryBar profile={profile} transactions={transactions} />
      </div>

      <div className="px-5 pb-28 space-y-4">

        {/* ── HERO: SAFE TO SPEND ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #0D7377 0%, #074f52 100%)',
            boxShadow: '0 16px 48px rgba(13,115,119,0.25)',
          }}
        >
          <div className="px-6 pt-7 pb-2">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Ditt att röra dig med
            </p>
            <div className="flex items-end gap-2 mt-1">
              <p className="font-black leading-none" style={{ fontSize: 52, color: '#fff', letterSpacing: '-2px' }}>
                {fmt(safeToSpend)}
              </p>
              <span className="text-xl font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>kr</span>
            </div>
            <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Inkomst {fmt(profile.income)} kr — fasta kost. {fmt(totalFixed)} kr
            </p>
          </div>
          {/* Sparkline */}
          <div style={{ height: 60, opacity: 0.35 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FLOW_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} fill="url(#pdGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── QUICK ACTIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Registrera', icon: Zap, color: '#0D7377', bg: 'rgba(13,115,119,0.09)', action: onOpenExpense },
            { label: 'Spara', icon: PiggyBank, color: '#7C3AED', bg: 'rgba(124,58,237,0.09)', action: onOpenTransactionHub },
            { label: 'Historia', icon: TrendingUp, color: '#EA580C', bg: 'rgba(234,88,12,0.09)', href: createPageUrl('TransactionHistory') },
          ].map(item => {
            const Ic = item.icon;
            const inner = (
              <motion.div
                whileTap={{ scale: 0.93 }}
                onClick={item.action}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl cursor-pointer"
                style={{
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                  <Ic className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>{item.label}</span>
              </motion.div>
            );
            return item.href
              ? <Link key={item.label} to={item.href}>{inner}</Link>
              : <div key={item.label}>{inner}</div>;
          })}
        </motion.div>

        {/* ── SAVINGS GOAL ── */}
        {profile.savingsGoal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-5"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{profile.savingsGoalEmoji || '🎯'}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{profile.savingsGoalName || 'Sparmål'}</p>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>{savingsPct}% klart</p>
                </div>
              </div>
              <p className="text-sm font-black" style={{ color: '#0D7377' }}>
                {fmt(profile.savingsCurrentBalance || 0)} / {fmt(profile.savingsGoal)} kr
              </p>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F0F2F5' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${savingsPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0D7377, #0FDEBD)' }}
              />
            </div>
          </motion.div>
        )}

        {/* ── RECENT TRANSACTIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F4F6F8' }}>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Senaste händelser</p>
            <Link to={createPageUrl('TransactionHistory')}>
              <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#0D7377' }}>
                Se alla <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {recentTx.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: '#9AA5B4' }}>Inga transaktioner än — lägg till din första!</p>
            </div>
          ) : (
            <div>
              {recentTx.map((tx, i) => {
                const cat = getCatIcon(tx.category);
                const isIncome = tx.amount > 0;
                return (
                  <div key={i}
                    className="px-5 py-3.5 flex items-center justify-between"
                    style={{ borderBottom: i < recentTx.length - 1 ? '1px solid #F9F8F6' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                        style={{ background: cat.bg }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                          {tx.vendor || tx.label}
                        </p>
                        <p className="text-xs" style={{ color: '#9AA5B4' }}>
                          {tx.category} · {tx.created_date ? new Date(tx.created_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isIncome
                        ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />
                        : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#9AA5B4' }} />}
                      <p className="text-sm font-bold" style={{ color: isIncome ? '#0D7377' : '#1A2332' }}>
                        {isIncome ? '+' : ''}{fmt(tx.amount)} kr
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── BUDGET OVERVIEW ── */}
        {profile.budgetLimits && Object.keys(profile.budgetLimits).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl p-5"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Budget denna månad</p>
              <Link to="/Budget">
                <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#0D7377' }}>
                  Hantera <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {Object.entries(profile.budgetLimits).slice(0, 3).map(([cat, limit]) => {
                const spent = (transactions || [])
                  .filter(t => t.category === cat && t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const pct = Math.min(100, Math.round((spent / limit) * 100));
                const over = pct >= 90;
                const ci = getCatIcon(cat);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ci.emoji}</span>
                        <span className="text-xs font-semibold capitalize" style={{ color: '#4A5568' }}>{cat}</span>
                      </div>
                      <span className="text-xs" style={{ color: over ? '#E53E3E' : '#9AA5B4' }}>
                        {fmt(spent)} / {fmt(limit)} kr
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F0F2F5' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: over ? '#E53E3E' : '#0D7377',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}