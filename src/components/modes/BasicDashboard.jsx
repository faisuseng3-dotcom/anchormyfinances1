import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import QuickStats from '@/components/dashboard/QuickStats';
import HealthScore from '@/components/dashboard/HealthScore';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function BasicDashboard({ profile }) {
  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const monthlyLeft = profile.income - totalFixedCosts;

  // Simple warnings (Basic only reacts to current state)
  const warnings = [];
  const margin = (monthlyLeft / profile.income) * 100;
  
  if (margin < 10) {
    warnings.push({
      type: 'warning',
      message: 'Lite tight den här månaden',
      detail: `Bara ${Math.round(margin)}% av lönen blir kvar efter räkningar — värt att hålla koll.`
    });
  }

  const bufferMonths = profile.buffer / totalFixedCosts;
  if (bufferMonths < 1) {
    warnings.push({
      type: 'alert',
      message: 'Din buffert är låg',
      detail: 'Rekommenderat: minst 3 månaders kostnader'
    });
  }

  // Recent high category (simple detection)
  const thisMonthExpenses = (profile.monthlyExpenses || []).filter(e => {
    const date = new Date(e.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const categoryTotals = {};
  thisMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Main Overview - What's left this month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-3xl p-8 shadow-xl text-center"
      >
        <p className="text-slate-400 text-sm mb-2">Kvar denna månad</p>
        <h2 className="text-5xl font-bold text-white mb-1">{formatNumber(monthlyLeft)} kr</h2>
        <p className="text-slate-500 text-sm">efter fasta kostnader</p>
      </motion.div>

      {/* Quick Stats */}
      <QuickStats profile={profile} />

      {/* Simple Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Notiser</h3>
          {warnings.map((warning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${
                warning.type === 'alert' 
                  ? 'border-rose-500/30 bg-rose-500/10' 
                  : 'border-amber-500/30 bg-amber-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  warning.type === 'alert' ? 'text-rose-400' : 'text-amber-400'
                }`} />
                <div>
                  <p className="font-medium text-white">{warning.message}</p>
                  <p className="text-sm text-slate-400 mt-1">{warning.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Buffer Goal */}
      {profile.savingsGoal > 0 && (
        <div className="dark-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Ditt sparmål</h3>
            <span className="text-sm text-slate-400">
              {Math.round((profile.buffer / profile.savingsGoal) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (profile.buffer / profile.savingsGoal) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-sm text-slate-400">
            {formatNumber(profile.buffer)} kr av {formatNumber(profile.savingsGoal)} kr
          </p>
        </div>
      )}

      {/* All Good Message */}
      {warnings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark-card p-6 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Allt ser bra ut!</h3>
              <p className="text-sm text-slate-400">
                Din ekonomi är stabil just nu. Fortsätt så här.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}