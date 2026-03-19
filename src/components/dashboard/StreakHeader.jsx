import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakHeader({ streak, level, totalXP }) {
  if (!streak || streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
        border: '1px solid rgba(251, 191, 36, 0.3)'
      }}
    >
      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <Flame className="w-5 h-5 text-amber-400" />
        </motion.div>
        <div>
          <p className="text-xs font-bold text-amber-300">{streak} DAG STREAK</p>
          <p className="text-[10px] text-amber-200/70">Väl jobbat!</p>
        </div>
      </div>

      <div className="w-px h-8 bg-amber-400/20" />

      {/* Level */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">L{level}</span>
        </div>
        <div>
          <p className="text-xs font-bold text-white">LEVEL {level}</p>
          <p className="text-[10px] text-slate-400">{totalXP} XP</p>
        </div>
      </div>
    </motion.div>
  );
}