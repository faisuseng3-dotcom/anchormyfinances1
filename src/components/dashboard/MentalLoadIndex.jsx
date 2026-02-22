import React from 'react';
import { Brain, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentalLoadIndex({ score, factors }) {
  const getLevel = () => {
    if (score <= 30) return { label: 'Låg belastning', color: 'text-emerald-600', bg: 'bg-emerald-500' };
    if (score <= 60) return { label: 'Måttlig belastning', color: 'text-amber-600', bg: 'bg-amber-500' };
    return { label: 'Hög belastning', color: 'text-rose-600', bg: 'bg-rose-500' };
  };

  const level = getLevel();

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Mental belastning</h3>
            <p className={`text-sm ${level.color}`}>{level.label}</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{score}</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full ${level.bg} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {factors && factors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Påverkande faktorer</p>
          {factors.map((factor, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{factor.name}</span>
              <span className={factor.positive ? 'text-emerald-600' : 'text-rose-600'}>
                {factor.positive ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}