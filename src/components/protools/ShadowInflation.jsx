import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function ShadowInflation({ profile }) {
  const [inflationData, setInflationData] = useState(null);

  useEffect(() => {
    if (!profile?.monthlyExpenses) return;

    // Filter food expenses
    const foodExpenses = (profile.monthlyExpenses || []).filter(e => 
      e.category === 'Livsmedel' || e.category === 'food'
    );

    // Separate by year
    const feb2025 = foodExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === 2025 && date.getMonth() === 1;
    });

    const feb2026 = foodExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === 2026 && date.getMonth() === 1;
    });

    if (feb2025.length === 0 || feb2026.length === 0) {
      setInflationData({ error: 'Ingen data för februari 2025 eller 2026' });
      return;
    }

    const avg2025 = feb2025.reduce((sum, e) => sum + e.amount, 0) / feb2025.length;
    const avg2026 = feb2026.reduce((sum, e) => sum + e.amount, 0) / feb2026.length;
    const change = ((avg2026 - avg2025) / avg2025) * 100;

    setInflationData({
      avg2025: Math.round(avg2025),
      avg2026: Math.round(avg2026),
      change: change.toFixed(1),
      isIncrease: change > 0
    });
  }, [profile]);

  if (!inflationData) {
    return (
      <div className="dark-card p-6 rounded-2xl">
        <p className="text-slate-400 text-sm">Laddar inflationsdata...</p>
      </div>
    );
  }

  if (inflationData.error) {
    return (
      <div className="dark-card p-6 rounded-2xl">
        <p className="text-slate-400 text-sm">{inflationData.error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="dark-card p-6 rounded-2xl">
        <h3 className="font-semibold text-white mb-4">Din Personliga Inflation</h3>
        <p className="text-sm text-slate-400 mb-6">Livsmedel: Februari 2025 vs 2026</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Feb 2025 (snitt)</p>
            <p className="text-xl font-bold text-white">{formatNumber(inflationData.avg2025)} kr</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Feb 2026 (snitt)</p>
            <p className="text-xl font-bold text-white">{formatNumber(inflationData.avg2026)} kr</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          inflationData.isIncrease 
            ? 'bg-rose-500/10 border border-rose-500/30' 
            : 'bg-emerald-500/10 border border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {inflationData.isIncrease ? (
              <TrendingUp className="w-5 h-5 text-rose-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            )}
            <span className={`font-bold text-lg ${
              inflationData.isIncrease ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {inflationData.isIncrease ? '+' : ''}{inflationData.change}%
            </span>
          </div>
          <p className="text-sm text-slate-300">
            {inflationData.isIncrease 
              ? 'Dina livsmedelskostnader har ökat' 
              : 'Du har lyckats sänka dina livsmedelskostnader'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}