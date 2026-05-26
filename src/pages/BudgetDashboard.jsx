import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
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

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500)
  });

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
        <GlassSection title="Månadens totala budget">
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-semibold text-white tabular-nums">
              {totalSpent.toLocaleString('sv-SE')} <span className="text-lg font-normal text-white/50">kr</span>
            </p>
            <p className="text-sm text-white/45">av {totalBudgeted.toLocaleString('sv-SE')} kr</p>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: totalSpent / totalBudgeted >= 1 ? '#FCA5A5'
                  : totalSpent / totalBudgeted >= 0.8 ? '#FCD34D'
                  : 'linear-gradient(90deg, #6E9BFF, #B8C9FF)'
              }}
            />
          </div>
        </GlassSection>
      )}

      <div className="anchor-glass-card overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="anchor-section-label normal-case tracking-normal">
            Kategorier — tryck för att ändra
          </p>
        </div>
        {TRACKED_CATEGORIES.map(cat => (
          <BudgetCategoryRow
            key={cat}
            category={cat}
            spent={monthlySpent[cat] || 0}
            limit={budgetLimits[cat] || 0}
            onEdit={setEditCategory}
          />
        ))}
      </div>

      <p className="text-center text-xs mt-4 text-white/40">
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