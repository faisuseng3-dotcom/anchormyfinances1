import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Target } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import BasicStatusBubble from '@/components/dashboard/BasicStatusBubble';
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';
import DepositHub from '@/components/goals/DepositHub';

export default function BasicDashboard({ profile }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDepositHub, setShowDepositHub] = useState(false);
  const queryClient = useQueryClient();

  const savingsGoal = profile?.savingsGoal || 0;
  const savingsBalance = profile?.savingsCurrentBalance || 0;
  const savingsProgress = savingsGoal > 0 ? Math.min(100, Math.round((savingsBalance / savingsGoal) * 100)) : 0;

  const savingsText = () => {
    if (savingsGoal === 0) return 'Inget sparmål satt ännu.';
    if (savingsProgress >= 100) return '🎉 Mål nått! Grattis!';
    if (savingsProgress >= 75) return 'Nästan framme, håll i!';
    if (savingsProgress >= 50) return 'Halvvägs – bra jobbat!';
    if (savingsProgress >= 25) return 'Du är på väg!';
    return 'Du har precis börjat – fortsätt!';
  };

  return (
    <div className="px-5 pb-24">
      {/* Status Bubble */}
      <div className="flex justify-center mb-10">
        <BasicStatusBubble profile={profile} />
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 mb-10"
      >
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-bold text-white text-base"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}
        >
          <Plus size={32} />
          Registrera köp
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-bold text-white text-base"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
        >
          <Minus size={32} />
          Registrera utgift
        </button>
      </motion.div>

      {/* Savings Goal Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5 border border-white/10"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Target size={20} className="text-purple-400" />
          <h3 className="font-bold text-white text-base">
            {profile?.savingsGoalName || 'Sparmål'}
          </h3>
        </div>

        <Progress value={savingsProgress} className="h-3 bg-white/10" />

        <p className="text-sm text-slate-300 mt-3 text-center">{savingsText()}</p>

        {savingsGoal > 0 && (
          <p className="text-xs text-slate-500 text-center mt-1">
            {savingsBalance.toLocaleString('sv-SE')} / {savingsGoal.toLocaleString('sv-SE')} kr
          </p>
        )}

        {savingsGoal > 0 && (
          <button
            onClick={() => setShowDepositHub(true)}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-300"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            💰 Sätt in i sparmål
          </button>
        )}
      </motion.div>

      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        profile={profile}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
          setShowExpenseModal(false);
        }}
      />

      <DepositHub
        isOpen={showDepositHub}
        onClose={() => setShowDepositHub(false)}
        profile={profile}
        type="savings"
      />
    </div>
  );
}