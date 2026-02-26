import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function GoalAutomation({ profile }) {
  const [roundUpSavings, setRoundUpSavings] = useState(0);

  useEffect(() => {
    if (!profile?.monthlyExpenses) return;

    // Calculate round-up for each expense
    const totalRoundUp = profile.monthlyExpenses.reduce((sum, expense) => {
      const amount = expense.amount;
      const roundedUp = Math.ceil(amount / 10) * 10;
      const roundUpAmount = roundedUp - amount;
      return sum + roundUpAmount;
    }, 0);

    setRoundUpSavings(Math.round(totalRoundUp));
  }, [profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-emerald-400" />
          <h3 className="font-semibold text-white">Goal-Based Automation</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Avrunda varje köp till närmsta 10-krona och spara mellanskillnaden automatiskt.
        </p>

        <div className="glass-effect p-6 rounded-xl text-center mb-6">
          <p className="text-sm text-slate-400 mb-2">Denna månad sparar du</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            {formatNumber(roundUpSavings)} kr
          </p>
          <p className="text-xs text-slate-500 mt-2">genom småsparande</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Exempel på transaktioner:</p>
          {profile?.monthlyExpenses?.slice(0, 5).map((expense, i) => {
            const rounded = Math.ceil(expense.amount / 10) * 10;
            const diff = rounded - expense.amount;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-white">{expense.name}</p>
                  <p className="text-xs text-slate-400">{expense.amount} kr → {rounded} kr</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">+{diff.toFixed(0)} kr</p>
                  <p className="text-xs text-slate-500">sparas</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-semibold text-white">Årsprognos</p>
        </div>
        <p className="text-sm text-slate-300">
          Med denna takt sparar du cirka {formatNumber(roundUpSavings * 12)} kr per år utan att märka det!
        </p>
      </div>
    </motion.div>
  );
}