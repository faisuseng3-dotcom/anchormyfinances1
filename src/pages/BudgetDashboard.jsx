// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { TRACKED_BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow';
import SetBudgetModal from '@/components/budget/SetBudgetModal';
import { calcUnderBudgetStreak } from '@/lib/budgetStreak';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function getMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end:   new Date(now.getFullYear(), now.getMonth() + 1, 0),
    prev:  new Date(now.getFullYear(), now.getMonth() - 1, 1),
    prevEnd: new Date(now.getFullYear(), now.getMonth(), 0),
  };
}

function getDaysLeft() {
  const now  = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, last - now.getDate());
}

function getWinStatus(pct, daysLeft, daysTotal) {
  const daysPassed = daysTotal - daysLeft;
  const expectedPct = daysPassed / daysTotal;
  if (pct === 0)       return { label: 'Sätt din budget',   color: 'rgba(255,255,255,0.35)', icon: null };
  if (pct >= 1)        return { label: 'Gränsen nådd',      color: '#f87171',                icon: null };
  if (pct > expectedPct + 0.15) return { label: 'Håll koll',  color: '#fcd34d',              icon: null };
  return                        { label: 'Du vinner månaden', color: '#22d97a',               icon: '🟢' };
}

export default function BudgetDashboard() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState(null);
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions();

  const { start, end, prev, prevEnd } = useMemo(getMonthRange, []);
  const daysLeft  = getDaysLeft();
  const daysTotal = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  // This month's spending per category
  const monthlySpent = useMemo(() => {
    const spent = {};
    transactions.forEach((tx) => {
      if (!['expense', 'shopping'].includes(tx.type) && tx.amount >= 0) return;
      const d = new Date(tx.created_date);
      if (d < start || d > end) return;
      const cat = tx.category || 'other';
      spent[cat] = (spent[cat] || 0) + Math.abs(tx.amount);
    });
    return spent;
  }, [transactions, start, end]);

  // Last month's spending per category (for trend arrows)
  const prevMonthSpent = useMemo(() => {
    const spent = {};
    transactions.forEach((tx) => {
      if (!['expense', 'shopping'].includes(tx.type) && tx.amount >= 0) return;
      const d = new Date(tx.created_date);
      if (d < prev || d > prevEnd) return;
      const cat = tx.category || 'other';
      spent[cat] = (spent[cat] || 0) + Math.abs(tx.amount);
    });
    return spent;
  }, [transactions, prev, prevEnd]);

  const budgetLimits  = profile?.budgetLimits || {};
  const totalBudgeted = Object.values(budgetLimits).reduce((s, v) => s + v, 0);
  const totalSpent    = TRACKED_BUDGET_CATEGORIES.reduce((s, c) => s + (monthlySpent[c] || 0), 0);
  const totalLeft     = Math.max(0, totalBudgeted - totalSpent);
  const pct           = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;
  const dailyLeft     = totalBudgeted > 0 ? Math.round(totalLeft / daysLeft) : 0;
  const streak        = calcUnderBudgetStreak(profile, transactions);
  const winStatus     = getWinStatus(pct, daysLeft, daysTotal);

  const now       = new Date();
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long' });
  const capsMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const handleSaveBudget = async (category, amount) => {
    if (!profile) return;
    const updated = { ...(profile.budgetLimits || {}), [category]: amount };
    try {
      await base44.entities.FinancialProfile.update(profile.id, { budgetLimits: updated });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      setEditCategory(null);
    } catch {
      toast.error('Kunde inte spara budget. Försök igen.');
    }
  };

  const hasAnyBudget = totalBudgeted > 0;

  return (
    <PageShell
      title="Budget"
      subtitle={`${capsMonth} · ${daysLeft} dagar kvar`}
      backHref={createPageUrl('Dashboard')}
    >

      {/* ── Hero: Vinn månaden ───────────────────────────────────── */}
      <div
        className="rounded-[24px] p-6 mb-4"
        style={{
          background: 'linear-gradient(145deg, rgba(34,217,122,0.10) 0%, rgba(107,159,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {hasAnyBudget ? (
          <>
            <div className="flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40 mb-2">
              Kvar att spendera
            </p>
            <p className="text-[64px] sm:text-[76px] font-black text-white tabular-nums leading-none tracking-tight">
              {fmt(totalLeft)}
              <span className="text-[28px] sm:text-[32px] font-semibold text-white/40 ml-1">kr</span>
            </p>
            <p className="text-[13px] text-white/40 mt-2">
              av {fmt(totalBudgeted)} kr · {fmt(dailyLeft)} kr/dag
            </p>
            </div>

            {/* Wide progress bar */}
            <div className="mt-5 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, pct * 100)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: pct >= 1
                    ? '#f87171'
                    : pct >= 0.8
                      ? 'linear-gradient(90deg, #fcd34d, #f87171)'
                      : 'linear-gradient(90deg, #22d97a, #6B9FFF)',
                }}
              />
            </div>

            {/* Status + streak */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[13px] font-semibold" style={{ color: winStatus.color }}>
                {winStatus.icon && `${winStatus.icon} `}{winStatus.label}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-white/50">
                  <Flame size={12} className="text-orange-400" />
                  {streak} dagar i rad
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Trophy size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-[16px] font-bold text-white mb-1">Sätt din budget och vinn månaden</p>
            <p className="text-[13px] text-white/40 leading-relaxed">
              Tryck på en kategori nedan för att sätta en gräns. Lago håller koll åt dig.
            </p>
          </div>
        )}
      </div>

      {/* ── Kategorierna ─────────────────────────────────────────── */}
      <div className="space-y-2">
        {TRACKED_BUDGET_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <BudgetCategoryRow
              category={cat}
              spent={monthlySpent[cat] || 0}
              limit={budgetLimits[cat] || 0}
              prevSpent={prevMonthSpent[cat] || 0}
              onEdit={setEditCategory}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Footer hint ──────────────────────────────────────────── */}
      <p className="text-[12px] text-white/25 text-center mt-4">
        Tryck på en kategori för att sätta eller ändra gräns
      </p>

      {editCategory && (
        <SetBudgetModal
          category={editCategory}
          currentLimit={budgetLimits[editCategory] || 0}
          onSave={handleSaveBudget}
          onClose={() => setEditCategory(null)}
        />
      )}
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Budget');
