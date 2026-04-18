import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka</span>
        </button>
        <p className="text-xs font-medium uppercase tracking-widest mb-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>{monthName}</p>
        <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>Budget</h1>
      </div>

      {/* Summary card */}
      {totalBudgeted > 0 && (
        <div className="mx-5 mb-4 rounded-2xl p-5"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>Månadens totala budget</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              {totalSpent.toLocaleString('sv-SE')} <span className="text-lg font-normal">kr</span>
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>av {totalBudgeted.toLocaleString('sv-SE')} kr</p>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: totalSpent / totalBudgeted >= 1 ? '#E53E3E'
                  : totalSpent / totalBudgeted >= 0.8 ? '#D69E2E'
                  : '#0D7377'
              }}
            />
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="mx-5 rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
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

      <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
        Baserat på transaktioner importerade eller registrerade denna månad
      </p>

      {/* Modal */}
      {editCategory && (
        <SetBudgetModal
          category={editCategory}
          currentLimit={budgetLimits[editCategory] || 0}
          onSave={handleSaveBudget}
          onClose={() => setEditCategory(null)}
        />
      )}
    </div>
  );
}