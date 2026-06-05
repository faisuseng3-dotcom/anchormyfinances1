import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FeedbackPrompt from '@/components/feedback/FeedbackPrompt';
import HeroSpendingCard from '@/components/expenses/HeroSpendingCard';
import SpendingDonut from '@/components/expenses/SpendingDonut';
import SpendingBubbles from '@/components/expenses/SpendingBubbles';
import CategoryExpenseList from '@/components/expenses/CategoryExpenseList';

const categories = [
  { id: 'food', label: 'Mat & Dryck' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'transport', label: 'Transport' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'health', label: 'Hälsa' },
  { id: 'utilities', label: 'Räkningar' },
  { id: 'other', label: 'Övrigt' },
];

export default function Expenses() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [autoOpenCategory, setAutoOpenCategory] = useState(null);

  const handleDonutClick = (catId) => {
    setAutoOpenCategory(catId);
    setTimeout(() => {
      const el = document.getElementById(`cat-${catId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const { profile, isPersisted } = useFinancialProfile();

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      if (!isPersisted || !profile?.id) return;
      await base44.entities.FinancialProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      base44.analytics.track({ eventName: 'expense_added', properties: { category } });
    }
  });

  const expenses = profile?.monthlyExpenses || [];
  const subscriptions = profile?.subscriptions || [];

  // Merge expenses + subscriptions into categoryTotals for full picture
  const categoryTotals = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
  });
  subscriptions.forEach(sub => {
    const cat = sub.category || 'other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + sub.amount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  // Budget = 30% of income as a rough spending budget
  const budget = profile ? Math.round((profile.income - (profile.housingCost || 0)) * 0.6) : 0;

  const handleAddExpense = async () => {
    if (!name || !amount || !category) return;

    const newExpense = {
      name,
      amount: parseInt(amount.replace(/\s/g, '')),
      date: new Date().toISOString().split('T')[0],
      category
    };

    const newExpenses = [...expenses, newExpense];
    await updateProfile.mutateAsync({ monthlyExpenses: newExpenses });

    setName('');
    setAmount('');
    setCategory('');
    setShowAddForm(false);

    if (newExpenses.length === 3) {
      setTimeout(() => setShowFeedback(true), 1000);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Denna månad</p>
              <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>Utgifter</h1>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Card */}
        <HeroSpendingCard totalSpent={totalSpent} budget={budget} />
      </div>

      <div className="px-5 space-y-5">
        {/* Bubble visualization — primary */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <SpendingBubbles categoryTotals={categoryTotals} />
        </div>

        {/* Categorized Transactions */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Per kategori</p>
          <CategoryExpenseList expenses={expenses} subscriptions={profile?.subscriptions} autoOpenCategory={autoOpenCategory} onAutoOpenHandled={() => setAutoOpenCategory(null)} />
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full glass-effect rounded-t-3xl p-6 pb-24"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <h3 className="text-xl font-bold text-white mb-5">Lägg till utgift</h3>

              <div className="space-y-4">
                <Input
                  placeholder="Vad köpte du?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <Input
                  type="text"
                  placeholder="Belopp (kr)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  className="h-12 rounded-xl"
                />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Välj kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 h-12 rounded-xl">
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleAddExpense}
                    disabled={!name || !amount || !category || updateProfile.isPending}
                    className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                  >
                    Spara
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackPrompt
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        question="Blev du förvånad över någon kategori?"
        options={['Ja, mycket', 'Lite', 'Nej, inte alls']}
        context="expense_insights"
      />
    </div>
  );
}

export const pageSeo = pageSeoFor('Expenses');
