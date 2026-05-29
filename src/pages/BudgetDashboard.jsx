import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { motion } from 'framer-motion';
import PageShell from '@/components/layout/PageShell';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { createPageUrl } from '@/utils';
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow';
import SetBudgetModal from '@/components/budget/SetBudgetModal';

const TRACKED_CATEGORIES = ['food', 'transport', 'entertainment', 'travel', 'health', 'home', 'shopping', 'other'];

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

  // Aggregate expenses for current month per category
  const monthlySpent = useMemo(() => {
    const { start, end } = getMonthRange();
    const spent = {};
    transactions.forEach(tx => {
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
  const totalSpent = TRACKED_CATEGORIES.reduce((s, cat) => s + (monthlySpent[cat] || 0), 0);

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
    <PageShell title="Budget" subtitle={monthName} backHref={createPageUrl('Dashboard')}>
      {totalBudgeted > 0 && (
        <DashboardSection nested title="Total budget">
          <div className="flex items-end justify-between mb-3">
            <p className="text-[32px] font-semibold text-white tabular-nums leading-none">
              {totalSpent.toLocaleString('sv-SE')} <span className="text-lg font-normal text-white/45">kr</span>
            </p>
            <p className={sectionSubtitleClass}>av {totalBudgeted.toLocaleString('sv-SE')} kr</p>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden bg-white/[0.08]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: totalSpent / totalBudgeted >= 1 ? '#FF8A9A'
                  : totalSpent / totalBudgeted >= 0.8 ? '#FCD34D'
                  : 'linear-gradient(90deg, #5B8CFF, #A8C4FF)'
              }}
            />
          </div>
        </DashboardSection>
      )}

      <DashboardSection nested title="Kategorier" subtitle="Tryck för att ändra gräns">
        {TRACKED_CATEGORIES.map((cat, i) => (
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

      <p className={`text-center ${sectionSubtitleClass} mt-2`}>
        Baserat på transaktioner importerade eller registrerade denna månad
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