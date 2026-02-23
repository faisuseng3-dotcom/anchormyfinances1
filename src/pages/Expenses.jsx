import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, TrendingUp, ShoppingCart, Coffee, Car, Zap, Heart, Film, Package } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import FeedbackPrompt from '@/components/feedback/FeedbackPrompt';

const categories = [
  { id: 'food', label: 'Mat & Dryck', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { id: 'entertainment', label: 'Nöje', icon: Film, color: 'bg-pink-100 text-pink-600' },
  { id: 'health', label: 'Hälsa', icon: Heart, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'utilities', label: 'Räkningar', icon: Zap, color: 'bg-amber-100 text-amber-600' },
  { id: 'other', label: 'Övrigt', icon: Package, color: 'bg-slate-100 text-slate-600' },
];

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

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
      base44.analytics.track({
        eventName: 'expense_added',
        properties: { category }
      });
    }
  });

  const expenses = profile?.monthlyExpenses || [];
  
  // Calculate category insights
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const topCategory = sortedCategories[0];

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
    
    // Show feedback after 3rd expense
    if (newExpenses.length === 3) {
      setTimeout(() => setShowFeedback(true), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Utgifter</h1>
            <p className="text-sm text-slate-500">Registrera dina köp</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            size="icon"
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Total this month */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <p className="text-slate-300 text-sm">Total denna månad</p>
          <p className="text-3xl font-bold mt-1">{formatNumber(totalSpent)} kr</p>
          {topCategory && (
            <p className="text-slate-300 text-sm mt-3">
              Du spenderar mest på <span className="font-semibold text-white">{categories.find(c => c.id === topCategory[0])?.label}</span>
            </p>
          )}
        </div>
      </div>

      {/* Category Insights */}
      {sortedCategories.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Topp 3 kategorier</h2>
          <div className="space-y-3">
            {sortedCategories.map(([catId, total], index) => {
              const cat = categories.find(c => c.id === catId);
              const Icon = cat?.icon || Package;
              const percentage = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
              
              return (
                <motion.div
                  key={catId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${cat?.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-slate-900">{cat?.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatNumber(total)} kr</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">{percentage}% av totala utgifter</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="px-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Senaste köp</h2>
        <div className="space-y-2">
          {expenses.slice(-10).reverse().map((expense, i) => {
            const cat = categories.find(c => c.id === expense.category);
            const Icon = cat?.icon || Package;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${cat?.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{expense.name}</p>
                    <p className="text-xs text-slate-500">{expense.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">{formatNumber(expense.amount)} kr</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setShowAddForm(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl p-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Lägg till utgift</h3>
            
            <div className="space-y-4">
              <Input
                placeholder="Vad köpte du?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl"
              />
              
              <Input
                type="text"
                placeholder="Belopp"
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
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleAddExpense}
                  disabled={!name || !amount || !category}
                  className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  Spara
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Feedback Prompt */}
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