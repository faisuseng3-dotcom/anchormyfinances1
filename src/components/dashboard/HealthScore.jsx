import React from 'react';
import { motion } from 'framer-motion';

export default function HealthScore({ score, label }) {
  const getColor = () => {
    if (score >= 70) return { ring: 'stroke-emerald-500', bg: 'from-emerald-500/20', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' };
    if (score >= 40) return { ring: 'stroke-amber-500', bg: 'from-amber-500/20', text: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.5)' };
    return { ring: 'stroke-rose-500', bg: 'from-rose-500/20', text: 'text-rose-400', glow: 'rgba(239, 68, 68, 0.5)' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-effect rounded-2xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} to-transparent`} />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={colors.ring}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ 
                strokeDasharray: circumference,
                filter: `drop-shadow(0 0 8px ${colors.glow})`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-4xl font-bold ${colors.text}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              style={{
                textShadow: `0 0 20px ${colors.glow}`
              }}
            >
              {score}
            </motion.span>
          </div>
        </div>
        <div>
          <h3 className="text-sm text-slate-400 mb-1">Ekonomisk Hälsa</h3>
          <p className={`text-base font-semibold ${colors.text}`}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
}