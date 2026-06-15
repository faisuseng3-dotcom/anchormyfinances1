import React, { useState, useMemo } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { TRACKED_BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import BudgetCategoryCard from '@/components/budget/BudgetCategoryCard';
import SetBudgetModal from '@/components/budget/SetBudgetModal';
import CopilotProgressRing from '@/components/ui-premium/copilot/CopilotProgressRing';
import CopilotCard from '@/components/ui-premium/copilot/CopilotCard';
import StreakBadge from '@/components/ui-premium/copilot/StreakBadge';
import { calcUnderBudgetStreak } from '@/lib/budgetStreak';
import { calcSavingsStreak } from '@/lib/microWins';
import { toast } from 'sonner';

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

export default function BudgetDashboard() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState(null);

  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions();

  const monthlySpent = useMemo(() => {
    const { start, end } = getMonthRange();
    const spent = {};
    transactions.forEach((tx) => {
      if (!['expense', 'shopping'].includes(tx.type) && tx.amount >= 0) return;
      const date = new Date(tx.created_date);
      if (date < start || date > end) return;
      const cat = tx.category || 'other';
      spent[cat] = (spent[cat] || 0) + Math.abs(tx.amount);
    });
    return spent;
  }, [transactions]);

  const budgetLimits = profile?.budgetLimits || {};
  const totalBudgeted = Object.values(budgetLimits).reduce((s, v) => s + v, 0);
  const totalSpent = TRACKED_BUDGET_CATEGORIES.reduce(
    (s, cat) => s + (monthlySpent[cat] || 0),
    0,
  );
  const remaining = Math.max(0, totalBudgeted - totalSpent);
  const budgetPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const underBudgetStreak = calcUnderBudgetStreak(profile, transactions);
  const savingsStreak = calcSavingsStreak(transactions);

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

  const now = new Date();
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long' });

  return (
    <PageShell title="Budget" subtitle={`${monthName} · plan mot utfall`} backHref={createPageUrl('Dashboard')}>
      <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-none">
        <StreakBadge count={underBudgetStreak} label="dagar under budget" variant="budget" />
        <StreakBadge count={savingsStreak} label="dagars sparande" variant="save" />
      </div>

      <CopilotCard className="flex flex-col items-center py-8">
        <CopilotProgressRing
          value={totalBudgeted > 0 ? Math.min(totalSpent, totalBudgeted) : 0}
          max={totalBudgeted || 1}
          size={148}
          stroke={10}
          color={budgetPct >= 100 ? '#f87171' : budgetPct >= 80 ? '#fcd34d' : '#22d97a'}
          label={totalBudgeted > 0 ? `${Math.round(budgetPct)}%` : '—'}
          sublabel="använt"
        />
        <div className="grid grid-cols-3 gap-6 mt-6 w-full max-w-sm text-center">
          <div>
            <p className="anchor-type-caption">Budget</p>
            <p className="text-[16px] font-bold text-white tabular-nums mt-1">
              {totalBudgeted.toLocaleString('sv-SE')}
            </p>
          </div>
          <div>
            <p className="anchor-type-caption">Spenderat</p>
            <p className="text-[16px] font-bold text-[#f87171] tabular-nums mt-1">
              {totalSpent.toLocaleString('sv-SE')}
            </p>
          </div>
          <div>
            <p className="anchor-type-caption">Kvar</p>
            <p className="text-[16px] font-bold text-[var(--copilot-accent-green)] tabular-nums mt-1">
              {remaining.toLocaleString('sv-SE')}
            </p>
          </div>
        </div>
      </CopilotCard>

      <div>
        <p className="anchor-type-label mb-3 px-1">
          Kategorier — svep för att se alla
        </p>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-none">
          {TRACKED_BUDGET_CATEGORIES.map((cat, i) => (
            <BudgetCategoryCard
              key={cat}
              category={cat}
              spent={monthlySpent[cat] || 0}
              limit={budgetLimits[cat] || 0}
              onEdit={setEditCategory}
              index={i}
            />
          ))}
        </div>
        <p className="text-[12px] text-[var(--copilot-text-muted)] text-center mt-3">
          Tryck på ett kort för att sätta eller ändra gräns
        </p>
      </div>

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
