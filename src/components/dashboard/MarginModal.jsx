import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

const OPTIMIZATIONS = [
  { id: 1, emoji: '⚡', title: 'Byt elavtal', desc: 'Prismatch med billigaste leverantören just nu', saving: 320, action: 'Byt nu' },
  { id: 2, emoji: '📺', title: 'Säg upp oanvänd streaming', desc: 'Du betalar för tjänster du knappt använder', saving: 219, action: 'Granska' },
  { id: 3, emoji: '🏦', title: 'Samla dina lån', desc: 'En kredit med lägre ränta – potentiellt stor besparing', saving: 680, action: 'Simulera' },
  { id: 4, emoji: '📱', title: 'Billigare mobilabonnemang', desc: 'Prisvärdare alternativ finns på marknaden', saving: 150, action: 'Jämför' },
];

export default function MarginModal({ isOpen, onClose, profile }) {
  const [optimized, setOptimized] = useState({});
  const [loading, setLoading] = useState({});

  if (!isOpen || !profile) return null;

  const totalSubs = (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0);
  const totalLoans = (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const totalFixed = (profile.housingCost || 0) + totalSubs + totalLoans;
  const totalVariable = (profile.monthlyExpenses || []).reduce((s, x) => s + x.amount, 0);
  const income = profile.income || 0;
  const baseMargin = Math.max(0, income - totalFixed - totalVariable);
  const bonusMargin = Object.values(optimized).reduce((s, v) => s + v, 0);
  const totalMargin = baseMargin + bonusMargin;

  const segments = [
    { label: 'Fasta', value: totalFixed - bonusMargin, pct: income > 0 ? ((totalFixed - bonusMargin) / income) * 100 : 0, color: '#7F1D1D' },
    { label: 'Rörliga', value: totalVariable, pct: income > 0 ? (totalVariable / income) * 100 : 0, color: '#D97706' },
    { label: 'Marginal', value: totalMargin, pct: income > 0 ? (totalMargin / income) * 100 : 0, color: '#22C55E' },
  ];

  const handleOptimize = async (opt) => {
    if (optimized[opt.id]) return;
    setLoading(l => ({ ...l, [opt.id]: true }));
    await new Promise(r => setTimeout(r, 1800));
    setLoading(l => ({ ...l, [opt.id]: false }));
    setOptimized(o => ({ ...o, [opt.id]: opt.saving }));
    toast.success(`✅ ${opt.title} aktiverat – +${fmt(opt.saving)} kr/mån i marginal!`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-t-3xl overflow-hidden"
          style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '90vh', overflowY: 'auto' }}
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
                  <p className="text-base font-bold text-white">Marginal-Booster</p>
                  <p className="text-xs text-slate-500">Utgiftsoptimering</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live margin */}
            <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs text-slate-500 mb-1">Din marginal efter optimering</p>
              <motion.p key={totalMargin} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="text-4xl font-black text-emerald-400">
                {fmt(totalMargin)} kr/mån
              </motion.p>
              {bonusMargin > 0 && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-300 mt-1">+{fmt(bonusMargin)} kr frigörd 🎉</motion.p>
              )}
            </div>

            {/* Waterfall bar */}
            <div className="mb-5">
              <div className="flex h-8 rounded-xl overflow-hidden shadow-lg">
                {segments.map((seg, i) => (
                  <motion.div key={seg.label}
                    animate={{ width: `${Math.max(0, seg.pct)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full flex items-center justify-center"
                    style={{ background: seg.color, minWidth: seg.pct > 3 ? undefined : 0 }}
                    title={`${seg.label}: ${fmt(seg.value)} kr`}>
                    {seg.pct > 8 && <span className="text-xs font-bold text-white/90">{Math.round(seg.pct)}%</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Optimization list */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">💡 Föreslagna optimeringar</p>
            <div className="space-y-3">
              {OPTIMIZATIONS.map(opt => {
                const isDone = !!optimized[opt.id];
                const isLoading = !!loading[opt.id];
                return (
                  <motion.div key={opt.id}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{
                      background: isDone ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isDone ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{opt.title}</p>
                      <p className="text-xs text-slate-500 truncate">{opt.desc}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">+{fmt(opt.saving)} kr/mån</p>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Button size="sm" onClick={() => handleOptimize(opt)} disabled={isLoading}
                        className="rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs h-8 px-3 flex-shrink-0">
                        {isLoading ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> AI förhandlar...</>
                        ) : (
                          <>{opt.action} <ChevronRight className="w-3 h-3 ml-1" /></>
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}