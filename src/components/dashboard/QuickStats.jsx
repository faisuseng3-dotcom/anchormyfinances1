import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { AnimatedCurrency, AnimatedNumber } from "@/components/ui/animated-number";

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
      iconColor: monthlyMargin >= 0 ? 'text-emerald-400' : 'text-rose-400',
      gradient: monthlyMargin >= 0 ? 'from-emerald-500 to-green-600' : 'from-rose-500 to-red-600'
    },
    {
      label: 'Din buffert',
      value: `${formatNumber(profile.buffer)} kr`,
      icon: Wallet,
      iconColor: 'text-blue-400',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Sparmål',
      value: profile.savingsGoal > 0 ? `${savingsProgress}%` : 'Ej satt',
      icon: Target,
      iconColor: 'text-purple-400',
      gradient: 'from-purple-500 to-pink-600',
      subtitle: profile.savingsGoalName,
      showProgress: profile.savingsGoal > 0,
      progressValue: savingsProgress
    },
    {
      label: 'Fasta kostnader',
      value: `${formatNumber(totalFixedCosts)} kr`,
      icon: PiggyBank,
      iconColor: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-600'
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
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-effect rounded-xl p-4 shadow-lg hover:shadow-2xl transition-shadow relative overflow-hidden cursor-pointer"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-20 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                {stat.label.includes('Sparmål') && profile.savingsGoal === 0 ? (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="text-2xl font-bold text-white"
                  >
                    Ej satt
                  </motion.span>
                ) : stat.label.includes('Sparmål') ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="text-2xl font-bold text-white"
                  >
                    <AnimatedNumber value={savingsProgress} duration={1.5} />%
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="text-2xl font-bold text-white tracking-tight"
                  >
                    <AnimatedCurrency 
                      value={
                        stat.label.includes('marginal') ? monthlyMargin :
                        stat.label.includes('buffert') ? profile.buffer :
                        totalFixedCosts
                      } 
                      duration={1.5}
                    />
                  </motion.div>
                )}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-slate-500 mt-1 truncate">{stat.subtitle}</p>
              )}
              {stat.showProgress && (
                <div className="mt-2">
                  <Progress value={stat.progressValue} className="h-1.5 bg-white/10" />
                  <p className="text-xs text-slate-500 mt-1">
                    {formatNumber(profile.buffer)} / {formatNumber(profile.savingsGoal)} kr
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}