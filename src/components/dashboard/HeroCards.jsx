import React from 'react';
import { TrendingUp, Shield, Target, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { AnimatedCurrency, AnimatedNumber } from "@/components/ui/animated-number";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function HeroCards({ profile }) {
  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const monthlyMargin = profile.income - totalFixedCosts;
  
  const bufferProgress = totalFixedCosts > 0 ? Math.min(100, (profile.buffer / (totalFixedCosts * 3)) * 100) : 0;
  const savingsProgress = profile.savingsGoal > 0 ? Math.round((profile.buffer / profile.savingsGoal) * 100) : 0;
  const fixedCostsPercent = profile.income > 0 ? Math.round((totalFixedCosts / profile.income) * 100) : 0;

  const cards = [
    {
      id: 'margin',
      icon: TrendingUp,
      title: 'Marginal',
      value: monthlyMargin,
      type: 'currency',
      color: monthlyMargin >= 0 ? 'emerald' : 'rose',
      gradient: monthlyMargin >= 0 ? 'from-emerald-500/20 via-green-500/10 to-transparent' : 'from-rose-500/20 via-red-500/10 to-transparent',
      showIndicator: true,
      isPositive: monthlyMargin >= 0
    },
    {
      id: 'buffer',
      icon: Shield,
      title: 'Buffert',
      value: profile.buffer,
      type: 'currency',
      color: 'blue',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      showGauge: true,
      gaugeValue: bufferProgress,
      subtitle: `${Math.round(bufferProgress)}% av 3 månader`
    },
    {
      id: 'savings',
      icon: Target,
      title: 'Sparmål',
      value: profile.savingsGoal > 0 ? savingsProgress : null,
      type: 'percent',
      color: 'purple',
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      isEmpty: profile.savingsGoal === 0,
      emptyText: '+ Sätt mål',
      showProgress: profile.savingsGoal > 0,
      progressValue: savingsProgress,
      subtitle: profile.savingsGoalName
    },
    {
      id: 'fixed',
      icon: Home,
      title: 'Fasta Kostnader',
      value: totalFixedCosts,
      type: 'currency',
      color: 'amber',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      showMeter: true,
      meterPercent: fixedCostsPercent,
      subtitle: `${fixedCostsPercent}% av inkomst`
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group"
            style={{
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Icon */}
            <div className="relative mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
              {card.showIndicator && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="absolute -top-1 -right-1"
                >
                  {card.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <TrendingUp className="w-4 h-4 text-rose-400 rotate-180" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Title */}
            <p className="text-xs font-medium text-slate-400 mb-2 tracking-wide uppercase">{card.title}</p>

            {/* Value */}
            <div className="relative">
              {card.isEmpty ? (
                <button className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-all text-sm font-medium">
                  {card.emptyText}
                </button>
              ) : (
                <>
                  {card.showGauge && (
                    <div className="absolute -right-2 -top-2">
                      <svg width="60" height="60" className="opacity-20">
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-blue-500"
                          strokeDasharray={`${(card.gaugeValue / 100) * 157} 157`}
                          transform="rotate(-90 30 30)"
                        />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-1">
                    {card.type === 'currency' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 + 0.2 }}
                        className="text-2xl font-bold text-white"
                      >
                        <AnimatedCurrency value={card.value} duration={1.5} />
                      </motion.div>
                    )}
                    {card.type === 'percent' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 + 0.2 }}
                        className="text-2xl font-bold text-white"
                      >
                        <AnimatedNumber value={card.value} duration={1.5} />
                        <span className="text-lg">%</span>
                      </motion.div>
                    )}
                  </div>

                  {card.subtitle && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{card.subtitle}</p>
                  )}

                  {card.showProgress && (
                    <div className="mt-3">
                      <Progress value={card.progressValue} className="h-1.5 bg-white/5" />
                    </div>
                  )}

                  {card.showMeter && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, card.meterPercent)}%` }}
                          transition={{ duration: 1.5, delay: i * 0.05 + 0.3, ease: "easeOut" }}
                          className={`h-full ${
                            card.meterPercent > 80 ? 'bg-rose-500' :
                            card.meterPercent > 60 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}