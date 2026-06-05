import React, { useState, useMemo } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import PageShell from '@/components/layout/PageShell';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { createPageUrl } from '@/utils';
import { TRACKED_BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import BudgetHero from '@/components/budget/BudgetHero';
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow';
import SetBudgetModal from '@/components/budget/SetBudgetModal';

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

  const handleSaveBudget = async (category, amount) => {
    if (!profile) return;
    const updated = { ...(profile.budgetLimits || {}), [category]: amount };
    await base44.entities.FinancialProfile.update(profile.id, { budgetLimits: updated });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    setEditCategory(null);
  };

  const now = new Date();
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });

  return (
    <PageShell title="Budget" subtitle="Plan mot utfall" backHref={createPageUrl('Dashboard')}>
      <BudgetHero
        totalSpent={totalSpent}
        totalBudgeted={totalBudgeted}
        monthName={monthName}
      />

      <DashboardSection nested title="Kategorier" subtitle="Tryck för att ändra gräns">
        {TRACKED_BUDGET_CATEGORIES.map((cat, i) => (
          <React.Fragment key={cat}>
            {i > 0 && <DashboardDivider />}
            <BudgetCategoryRow
              category={cat}
              spent={monthlySpent[cat] || 0}
              limit={budgetLimits[cat] || 0}
              onEdit={setEditCategory}
            />
          </React.Fragment>
        ))}
      </DashboardSection>

      <p className={`text-center ${sectionSubtitleClass} mt-2 px-2 font-light`}>
        Uppdateras från dina transaktioner den här månaden. Gränser kan kopieras från Jämför.
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
