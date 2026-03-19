import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: MONTH_NAMES[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return months;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a2235] px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {fmt(p.value)} kr
        </p>
      ))}
    </div>
  );
};

export default function FinancialHistory() {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const { data: allTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions_all'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
  });

  const months = getLast6Months();

  // Build per-month data points
  const chartData = useMemo(() => {
    if (!profile) return [];

    const totalFixedMonthly =
      (profile.housingCost || 0) +
      (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
      (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

    // Group transactions by month key
    const txByMonth = {};
    allTransactions.forEach(tx => {
      const d = new Date(tx.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!txByMonth[key]) txByMonth[key] = [];
      txByMonth[key].push(tx);
    });

    // Running simulation: start from estimated buffer 6 months ago
    // We use current buffer as anchor and work backwards via transactions
    let runningBuffer = profile.buffer || 0;

    // Collect monthly deltas going back in time
    const monthlyDeltas = {};
    months.forEach(m => {
      const txs = txByMonth[m.key] || [];
      let delta = 0;
      txs.forEach(tx => {
        if (tx.type === 'income') delta += tx.amount;
        else if (tx.type === 'expense') delta -= Math.abs(tx.amount);
        else if (tx.type === 'transfer_to_savings') delta -= tx.amount;
        else if (tx.type === 'transfer_to_spending') delta += tx.amount;
      });
      monthlyDeltas[m.key] = delta;
    });

    // Build forward from estimated start
    // Estimate starting buffer by subtracting all known deltas
    let estimatedStart = runningBuffer;
    months.forEach(m => {
      estimatedStart -= (monthlyDeltas[m.key] || 0);
    });

    // Total debt per month — assume current debt + monthly payments accumulate backwards
    const totalDebtNow = (profile.loans || []).reduce((s, l) => s + l.totalAmount, 0);
    const totalMonthlyPayments = (profile.loans || []).reduce((s, l) => s + l.monthlyPayment, 0);

    let bufferSim = estimatedStart;
    let debtSim = totalDebtNow + (totalMonthlyPayments * months.length); // rough estimate going back

    return months.map((m, i) => {
      bufferSim += monthlyDeltas[m.key] || 0;
      debtSim = Math.max(0, debtSim - totalMonthlyPayments);

      return {
        label: m.label,
        Buffert: Math.max(0, Math.round(bufferSim)),
        Skuld: Math.round(debtSim),
      };
    });
  }, [profile, allTransactions, months]);

  const latestBuffer = chartData[chartData.length - 1]?.Buffert || 0;
  const earliestBuffer = chartData[0]?.Buffert || 0;
  const latestDebt = chartData[chartData.length - 1]?.Skuld || 0;
  const earliestDebt = chartData[0]?.Skuld || 0;
  const bufferGrowth = latestBuffer - earliestBuffer;
  const debtReduction = earliestDebt - latestDebt;

  const isLoading = loadingProfile || loadingTx;

  return (
    <div className="min-h-screen pb-28 px-5 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl('Dashboard')}>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </motion.div>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Ekonomisk Historik</h1>
          <p className="text-xs text-slate-400">Senaste 6 månader</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-32 rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 border"
              style={{
                background: bufferGrowth >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                borderColor: bufferGrowth >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {bufferGrowth >= 0
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-rose-400" />
                }
                <span className="text-xs text-slate-400">Buffert 6 mån</span>
              </div>
              <p className={`text-lg font-bold ${bufferGrowth >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {bufferGrowth >= 0 ? '+' : ''}{fmt(bufferGrowth)} kr
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Nu: {fmt(latestBuffer)} kr</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-4 border"
              style={{
                background: debtReduction >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                borderColor: debtReduction >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">Skuld 6 mån</span>
              </div>
              <p className={`text-lg font-bold ${debtReduction >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {debtReduction >= 0 ? '-' : '+'}{fmt(Math.abs(debtReduction))} kr
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Kvar: {fmt(latestDebt)} kr</p>
            </motion.div>
          </div>

          {/* Main chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-white font-semibold text-sm mb-4">Buffert vs Skuld</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af', paddingTop: '12px' }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Line
                  type="monotone"
                  dataKey="Buffert"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="Skuld"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Buffert only */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-white font-semibold text-sm mb-1">Buffertens resa</h2>
            <p className="text-xs text-slate-500 mb-4">Hur din likviditet har förändrats</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Buffert"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Debt only */}
          {latestDebt > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h2 className="text-white font-semibold text-sm mb-1">Skuldens resa</h2>
              <p className="text-xs text-slate-500 mb-4">Varje månad du amorterar räknas</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Skuld"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {debtReduction > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-300 text-xs font-medium">
                    🎯 Du har minskat din skuld med {fmt(debtReduction)} kr de senaste 6 månaderna. Fortsätt så!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}