import React from 'react';
import { motion } from 'framer-motion';

export default function HealthScore({ score, label }) {
  const getColor = () => {
    if (score >= 70) return { ring: 'stroke-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' };
    if (score >= 40) return { ring: 'stroke-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' };
    return { ring: 'stroke-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-6 rounded-2xl ${colors.bg}`}>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/50"
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
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-3xl font-bold ${colors.text}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
          </div>
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${colors.text}`}>Ekonomisk hälsa</h3>
          <p className="text-slate-600 text-sm mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}