import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

export default function SafeToSpendWidget({ profile }) {
  if (!profile) return null;

  // Beräkna Safe-to-Spend
  const subscriptionCosts = (profile.subscriptions || []).reduce((sum, s) => sum + (s.amount || 0), 0);
  const loanPayments = (profile.loans || []).reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
  const totalFixedCosts = (profile.housingCost || 0) + subscriptionCosts + loanPayments;

  // Buffer är inte med i beräkningen - det är en separat buffert
  // Safe-to-Spend = vad du kan spendera denna månad från inkomst efter fasta utgifter
  const monthlyMargin = profile.income - totalFixedCosts;
  
  // Beräkna utgifter redan gjorda denna månad (simplified)
  const monthlyExpenseSum = (profile.monthlyExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - monthlyExpenseSum);

  const safePercent = Math.round((safeToSpend / monthlyMargin) * 100);
  const isLow = safeToSpend < monthlyMargin * 0.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 mb-6"
      style={{
        background: isLow 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(219, 39, 119, 0.1))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
        border: isLow ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid rgba(16, 185, 129, 0.3)',
        boxShadow: isLow
          ? '0 0 30px rgba(239, 68, 68, 0.15)'
          : '0 0 30px rgba(16, 185, 129, 0.2)'
      }}
    >
      <motion.div
        animate={isLow ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-3xl"
        style={{
          background: isLow
            ? 'radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1), transparent 70%)'
            : 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1), transparent 70%)'
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">SAFE-TO-SPEND</p>
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl font-black ${
                isLow ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {safeToSpend.toLocaleString('sv-SE')} kr
            </motion.h2>
            <p className={`text-xs mt-1 ${isLow ? 'text-rose-300/70' : 'text-emerald-300/70'}`}>
              Denna månad, efter fasta utgifter
            </p>
          </div>
          <motion.div
            animate={{ rotate: isLow ? [0, -5, 5, 0] : [0, 360] }}
            transition={{
              duration: isLow ? 0.5 : 4,
              repeat: Infinity,
              repeatType: isLow ? 'reverse' : 'loop'
            }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isLow ? 'bg-rose-500/20' : 'bg-emerald-500/20'
            }`}
          >
            {isLow ? (
              <span className="text-2xl">⚠️</span>
            ) : (
              <Zap className={`w-7 h-7 ${isLow ? 'text-rose-400' : 'text-emerald-400'}`} />
            )}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Månadsmarginal använd</span>
            <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
              {Math.round((monthlyExpenseSum / monthlyMargin) * 100)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (monthlyExpenseSum / monthlyMargin) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`h-full rounded-full ${
                isLow
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Inkomst</p>
            <p className="font-bold text-white">{profile.income.toLocaleString('sv-SE')} kr</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Fasta utgifter</p>
            <p className="font-bold text-white">{totalFixedCosts.toLocaleString('sv-SE')} kr</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Buffert</p>
            <p className="font-bold text-white">{profile.buffer.toLocaleString('sv-SE')} kr</p>
          </div>
        </div>

        {/* Coaching message */}
        {isLow && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30"
          >
            <p className="text-rose-200 text-xs leading-relaxed">
              💪 Tuff vecka! Du är redan på {Math.round((monthlyExpenseSum / monthlyMargin) * 100)}% av månadsmarginal. Vi tar oss igenom detta tillsammans.
            </p>
          </motion.div>
        )}

        {monthlyMargin > 0 && monthlyExpenseSum < monthlyMargin * 0.3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30"
          >
            <p className="text-emerald-200 text-xs leading-relaxed">
              🎉 Boom! Du är på rätt spår. Stark kontroll över utgifterna denna månad!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}