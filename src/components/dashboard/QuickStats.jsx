import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function QuickStats({ profile }) {
  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const monthlyMargin = profile.income - totalFixedCosts;
  const savingsProgress = profile.savingsGoal > 0 ? Math.round((profile.buffer / profile.savingsGoal) * 100) : 0;

  const stats = [
    {
      label: 'Månadens marginal',
      value: `${formatNumber(monthlyMargin)} kr`,
      icon: monthlyMargin >= 0 ? TrendingUp : TrendingDown,
      color: monthlyMargin >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
      iconColor: monthlyMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'
    },
    {
      label: 'Din buffert',
      value: `${formatNumber(profile.buffer)} kr`,
      icon: Wallet,
      color: 'bg-blue-50 text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      label: 'Sparmål',
      value: profile.savingsGoal > 0 ? `${savingsProgress}%` : 'Ej satt',
      icon: Target,
      color: 'bg-purple-50 text-purple-600',
      iconColor: 'text-purple-500',
      subtitle: profile.savingsGoalName,
      showProgress: profile.savingsGoal > 0,
      progressValue: savingsProgress
    },
    {
      label: 'Fasta kostnader',
      value: `${formatNumber(totalFixedCosts)} kr`,
      icon: PiggyBank,
      color: 'bg-amber-50 text-amber-600',
      iconColor: 'text-amber-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl ${stat.color}`}
          >
            <Icon className={`w-5 h-5 ${stat.iconColor} mb-2`} />
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-lg font-semibold mt-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500 mt-1 truncate">{stat.subtitle}</p>
            )}
            {stat.showProgress && (
              <div className="mt-2">
                <Progress value={stat.progressValue} className="h-1.5" />
                <p className="text-xs text-slate-500 mt-1">
                  {formatNumber(profile.buffer)} / {formatNumber(profile.savingsGoal)} kr
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}