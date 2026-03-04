import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, TrendingUp } from 'lucide-react';

export default function AnchorWealthCard({ profile }) {
  const buffer = profile?.buffer || 0;
  const savingsBalance = profile?.savingsCurrentBalance || 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const total = buffer + savingsBalance;

  const goalProgress = savingsGoal > 0 ? Math.min(100, Math.round((savingsBalance / savingsGoal) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.9) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        boxShadow: '0 0 40px rgba(139,92,246,0.1)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest">Anchor-förmögenhet</p>
          <p className="text-xs text-slate-500">Buffert + Sparmål</p>
        </div>
      </div>

      <p className="text-4xl font-black text-white mb-1">{total.toLocaleString('sv-SE')} kr</p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-xs text-slate-400">Buffert</p>
          <p className="text-lg font-bold text-emerald-400">{buffer.toLocaleString('sv-SE')} kr</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <p className="text-xs text-slate-400">{profile?.savingsGoalName || 'Sparmål'}</p>
          <p className="text-lg font-bold text-purple-400">{savingsBalance.toLocaleString('sv-SE')} kr</p>
          {savingsGoal > 0 && (
            <div className="mt-1.5">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{goalProgress}% av {savingsGoal.toLocaleString('sv-SE')} kr</p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent)' }} />
    </motion.div>
  );
}