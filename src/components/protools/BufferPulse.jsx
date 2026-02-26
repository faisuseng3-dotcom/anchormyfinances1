import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function BufferPulse({ profile }) {
  const [pulseData, setPulseData] = useState([]);
  const [projectedBalance, setProjectedBalance] = useState(0);

  useEffect(() => {
    if (!profile) return;

    // Calculate average daily spending
    const expenses = profile.monthlyExpenses || [];
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgDailySpending = expenses.length > 0 ? totalSpent / 30 : 200; // Fallback 200 kr/day

    // Days until payday (assume 25th of month)
    const today = new Date();
    const payday = new Date(today.getFullYear(), today.getMonth(), 25);
    if (payday < today) {
      payday.setMonth(payday.getMonth() + 1);
    }
    const daysUntilPayday = Math.ceil((payday - today) / (1000 * 60 * 60 * 24));

    // Generate forecast
    const data = [];
    let currentBalance = profile.buffer;

    for (let day = 0; day <= daysUntilPayday; day++) {
      const balance = profile.buffer - (day * avgDailySpending);
      data.push({
        day: day === 0 ? 'Idag' : day === daysUntilPayday ? 'Lön' : `+${day}d`,
        balance: Math.max(0, Math.round(balance))
      });
    }

    setPulseData(data);
    setProjectedBalance(Math.max(0, Math.round(profile.buffer - (daysUntilPayday * avgDailySpending))));
  }, [profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-400" />
          <h3 className="font-semibold text-white">Financial Buffer Pulse</h3>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-1">Prognos till nästa lön</p>
          <p className={`text-3xl font-bold ${projectedBalance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatNumber(projectedBalance)} kr
          </p>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={pulseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF" 
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              style={{ fontSize: '11px' }}
              tickFormatter={(value) => `${Math.round(value/1000)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value) => `${formatNumber(value)} kr`}
            />
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}