import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function ForecastChart({ profile }) {
  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const monthlySavings = (profile.income - totalFixedCosts) * 0.3;

  // Generate 5-year forecast data
  const data = [];
  let currentWealth = profile.buffer;

  for (let year = 0; year <= 5; year++) {
    currentWealth += monthlySavings * 12;
    data.push({
      year: year === 0 ? 'Nu' : `År ${year}`,
      value: Math.round(currentWealth)
    });
  }

  const finalValue = data[data.length - 1].value;
  const isStable = monthlySavings > 0 && profile.buffer > totalFixedCosts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Status Badge */}
      {isStable && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-300">Stark stabilitet</span>
          </div>
        </motion.div>
      )}

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">5-års prognos</h3>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="year" 
            stroke="rgba(148, 163, 184, 0.5)" 
            style={{ fontSize: '11px' }}
            tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
          />
          <YAxis 
            stroke="rgba(148, 163, 184, 0.5)" 
            style={{ fontSize: '11px' }}
            tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
            tickFormatter={(value) => `${Math.round(value/1000)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              padding: '12px'
            }}
            labelStyle={{ color: '#F3F4F6', fontWeight: 600 }}
            itemStyle={{ color: '#A78BFA' }}
            formatter={(value) => [`${formatNumber(value)} kr`, 'Förmögenhet']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#6366F1" 
            strokeWidth={2}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Prognostiserat värde (År 5)</span>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formatNumber(finalValue)} kr
          </span>
        </div>
      </div>
    </motion.div>
  );
}