import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, Undo2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatNumber = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function ImpactAnalysisModal({ isOpen, onUndo, onAccept, profile }) {
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const totalFixed = (profile?.housingCost || 0) +
    (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

  const marginBefore = (profile?.income || 0) - totalFixed;
  const marginAfter = marginBefore - 800;

  const chartData = [
    { label: 'Marginal (före)', value: Math.max(0, marginBefore), type: 'before' },
    { label: 'Marginal (efter)', value: Math.max(0, marginAfter), type: 'after' },
  ];

  const handleUndo = () => {
    setDone(true);
    setTimeout(() => { setDone(false); onUndo(); }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4"
        onClick={onAccept}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.98)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 0 60px rgba(239,68,68,0.2), 0 20px 60px rgba(0,0,0,0.6)'
          }}
        >
          <div className="h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">Konsekvensanalys</h2>
              </div>
              <button onClick={onAccept} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">Impulsköp – 800 kr</p>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${formatNumber(v)} kr`, '']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.type} fill={entry.type === 'before' ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Impact text */}
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-slate-300 leading-relaxed">
                Detta köp tar <span className="text-rose-400 font-bold">800 kr</span> från din månadsmarginal.
                Din nya marginal: <span className="font-bold text-white">{formatNumber(marginAfter)} kr</span>.
                {marginAfter < 0 && (
                  <span className="text-rose-400"> Du är nu <strong>{formatNumber(Math.abs(marginAfter))} kr</strong> under noll.</span>
                )}
              </p>
            </div>

            {/* Buttons */}
            {done ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-300">Köp ångrat! +800 kr återställt.</p>
              </motion.div>
            ) : (
              <div className="flex gap-3 mt-5">
                <Button onClick={handleUndo} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm">
                  <Undo2 className="w-4 h-4 mr-1.5" />
                  Ångra köp
                </Button>
                <Button onClick={onAccept} variant="outline" className="flex-1 rounded-xl border-white/10 hover:bg-white/5 text-slate-300 text-sm">
                  Acceptera
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}