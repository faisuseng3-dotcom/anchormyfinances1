import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function MarginModal({ isOpen, onClose, profile }) {
  if (!isOpen || !profile) return null;

  const totalSubs = (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0);
  const totalLoans = (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const totalFixed = (profile.housingCost || 0) + totalSubs + totalLoans;
  const totalVariable = (profile.monthlyExpenses || []).reduce((s, x) => s + x.amount, 0);
  const income = profile.income || 0;
  const margin = Math.max(0, income - totalFixed - totalVariable);

  const segments = [
    { label: 'Fasta', value: totalFixed, pct: income > 0 ? (totalFixed / income) * 100 : 0, color: '#7F1D1D', textColor: 'text-red-300' },
    { label: 'Rörliga', value: totalVariable, pct: income > 0 ? (totalVariable / income) * 100 : 0, color: '#D97706', textColor: 'text-amber-300' },
    { label: 'Marginal', value: margin, pct: income > 0 ? (margin / income) * 100 : 0, color: '#22C55E', textColor: 'text-green-400' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-t-3xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
          <div className="p-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Marginal-analys</p>
                  <p className="text-xs text-slate-500">Inkomst → Frihet</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Waterfall Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={44}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${fmt(Math.abs(v))} kr`, '']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={entry.value < 0 ? 0.8 : 1} />)}
                  <LabelList dataKey="value" position="top" formatter={(v) => `${fmt(Math.abs(v))}`} style={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Breakdown rows */}
            <div className="mt-4 space-y-2">
              {[
                { label: 'Inkomst', value: profile.income || 0, color: 'text-emerald-400', sign: '+' },
                { label: 'Fasta kostnader', value: totalFixed, color: 'text-rose-400', sign: '−' },
                { label: 'Rörliga utgifter', value: totalVariable, color: 'text-amber-400', sign: '−' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.color}`}>{row.sign} {fmt(row.value)} kr</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-white">= Marginal</span>
                <span className={`text-sm font-bold ${margin >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>{fmt(margin)} kr</span>
              </div>
            </div>

            {/* AI Insight */}
            <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-xs text-indigo-300 leading-relaxed">
                <span className="font-bold">✦ AI-insikt:</span> Du har {fmt(Math.max(0, margin))} kr i fri marginal denna månad. Vill du automatisera sparandet av överskottet?
              </p>
            </div>

            <Button className="w-full mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-6 shadow-lg shadow-emerald-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Optimera Marginal
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}