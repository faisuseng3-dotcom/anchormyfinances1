import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import TransactionList from '@/components/expenses/TransactionList';

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

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FinancialProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      base44.analytics.track({ eventName: 'expense_added', properties: { category } });
    }
  });

  const expenses = profile?.monthlyExpenses || [];

  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-5">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Utgifter</h1>
            <p className="text-xs text-slate-500">Visuell överblick denna månad</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            size="icon"
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Hero Card */}
        <HeroSpendingCard totalSpent={totalSpent} budget={budget} />
      </div>

      <div className="px-6 space-y-5">
        {/* Donut Chart */}
        <SpendingDonut categoryTotals={categoryTotals} totalSpent={totalSpent} />

        {/* Transactions */}
        <div>
          <p className="text-sm font-semibold text-white mb-3">Senaste köp</p>
          <TransactionList expenses={expenses} />
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