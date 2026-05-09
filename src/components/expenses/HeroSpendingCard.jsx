import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

const formatNumber = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function HeroSpendingCard({ totalSpent, budget }) {
  const percentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  
  const barColor = percentage >= 100 ? 'from-rose-500 to-red-600' :
                   percentage >= 75  ? 'from-amber-500 to-orange-500' :
                                       'from-emerald-500 to-green-500';
  
  const textColor = percentage >= 100 ? 'text-rose-400' :
                    percentage >= 75  ? 'text-amber-400' :
                                        'text-emerald-400';

  const remaining = budget - totalSpent;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(20,31,61,0.9) 0%, rgba(13,22,44,0.84) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(179, 200, 255, 0.2)',
        boxShadow: '0 12px 28px rgba(6, 13, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      <p className="text-[#B7C2D9] text-xs font-medium uppercase tracking-[0.18em] mb-1">Total denna månad</p>
      <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{formatNumber(totalSpent)}<span className="text-xl sm:text-2xl font-semibold text-[#B7C2D9] ml-2">kr</span></p>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-semibold ${textColor}`}>{percentage}% av budget</span>
          <span className="text-xs text-[#9FB5FF]">{formatNumber(budget)} kr</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          />
        </div>
      </div>

      {/* Comparison */}
      {remaining > 0 ? (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-emerald-400 font-semibold">{formatNumber(remaining)} kr</span> kvar av budget
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-rose-400 rotate-180" />
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-rose-400 font-semibold">{formatNumber(Math.abs(remaining))} kr</span> över budget
          </p>
        </div>
      )}
    </motion.div>
  );
}