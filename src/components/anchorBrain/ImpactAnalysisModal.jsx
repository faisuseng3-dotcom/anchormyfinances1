// @ts-nocheck
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
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(11,18,32,0.45)' }}
        onClick={onAccept}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden bg-white border border-[var(--color-border)]"
          style={{
            boxShadow: '0 0 60px rgba(239,68,68,0.2), 0 20px 60px rgba(11,18,32,0.25)'
          }}
        >
          <div className="h-1 bg-[var(--color-danger)]" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[var(--color-danger)]" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">Konsekvensanalys</h2>
              </div>
              <button onClick={onAccept} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-5">Impulsköp – 800 kr</p>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid var(--color-border)', boxShadow: 'var(--anchor-shadow-1)', borderRadius: 8, fontSize: 12 }}
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
            <div className="mt-4 p-4 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Detta köp tar <span className="text-[var(--color-danger)] font-bold">800 kr</span> från din månadsmarginal.
                Din nya marginal: <span className="font-bold text-[var(--color-text-primary)]">{formatNumber(marginAfter)} kr</span>.
                {marginAfter < 0 && (
                  <span className="text-[var(--color-danger)]"> Du är nu <strong>{formatNumber(Math.abs(marginAfter))} kr</strong> under noll.</span>
                )}
              </p>
            </div>

            {/* Buttons */}
            {done ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-success-soft)] border border-[var(--color-success)]/30"
              >
                <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                <p className="text-sm font-semibold text-[var(--color-success)]">Köp ångrat! +800 kr återställt.</p>
              </motion.div>
            ) : (
              <div className="flex gap-3 mt-5">
                <Button onClick={handleUndo} className="flex-1 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm">
                  <Undo2 className="w-4 h-4 mr-1.5" />
                  Ångra köp
                </Button>
                <Button onClick={onAccept} variant="outline" className="flex-1 rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] text-sm">
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