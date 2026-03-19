import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { QUICK_ACTIONS } from '@/lib/smartCategorization';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function QuickActionExpense({ profile, onSuccess }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuickAdd = async (category) => {
    if (!amount || !profile) return;

    setSubmitting(true);
    try {
      const action = QUICK_ACTIONS.find(a => a.category === category);
      const label = action.label.split(' ')[0] || category;

      await base44.entities.Transaction.create({
        type: 'expense',
        amount: -Math.abs(parseFloat(amount)),
        label,
        vendor: '',
        category,
        paymentMethod: 'Konto',
        note: ''
      });

      // Update profile with new expense
      const newExpense = {
        name: label,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        category
      };
      const updated = [...(profile.monthlyExpenses || []), newExpense];
      await base44.entities.FinancialProfile.update(profile.id, {
        monthlyExpenses: updated
      });

      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // XP award
      if (profile.totalXP !== undefined) {
        await base44.entities.FinancialProfile.update(profile.id, {
          totalXP: profile.totalXP + 10
        });
      }

      setAmount('');
      setSelectedCategory(null);
      setShowConfirm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <motion.button
            key={action.category}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(action.category)}
            className={`p-3 rounded-xl text-center transition-all ${
              selectedCategory === action.category
                ? 'bg-emerald-500/25 border border-emerald-500'
                : 'bg-white/8 border border-white/15 hover:bg-white/12'
            }`}
          >
            <p className="text-lg mb-1">{action.icon}</p>
            <p className="text-xs font-semibold text-white leading-tight">
              {action.label.split(' ')[0]}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Amount Input */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Belopp"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              className="h-12 text-lg text-right pr-12 bg-white/10"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">kr</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setAmount('');
              }}
              className="flex-1 h-10 rounded-lg"
            >
              Avbryt
            </Button>
            <Button
              onClick={() => handleQuickAdd(selectedCategory)}
              disabled={!amount || submitting}
              className="flex-1 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600"
            >
              {submitting ? 'Registrerar...' : 'Klar'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}