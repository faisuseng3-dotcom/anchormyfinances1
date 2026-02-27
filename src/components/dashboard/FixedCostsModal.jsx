import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Smartphone, Zap, Car, Dumbbell, Film, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmt = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

const NEGOTIABILITY = {
  streaming: { label: 'Förhandlingsbart', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  transport: { label: 'Kan sänkas', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/25', dot: 'bg-yellow-400' },
  health: { label: 'Kan sänkas', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/25', dot: 'bg-yellow-400' },
  entertainment: { label: 'Förhandlingsbart', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  insurance: { label: 'Förhandlingsbart', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  food: { label: 'Kan optimeras', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/25', dot: 'bg-yellow-400' },
  other: { label: 'Förhandlingsbart', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
};

const CATEGORY_ICONS = {
  streaming: Film,
  transport: Car,
  health: Dumbbell,
  entertainment: Film,
  insurance: Package,
  food: Package,
  other: Package,
};

export default function FixedCostsModal({ isOpen, onClose, profile, onNegotiate }) {
  if (!isOpen || !profile) return null;

  const totalSubs = (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0);
  const totalLoans = (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const totalFixed = (profile.housingCost || 0) + totalSubs + totalLoans;

  const items = [
    { name: 'Hyra / Boende', amount: profile.housingCost || 0, negotiability: null, locked: true, Icon: Home },
    ...(profile.subscriptions || []).map((s) => ({
      name: s.name,
      amount: s.amount,
      negotiability: NEGOTIABILITY[s.category] || NEGOTIABILITY.other,
      locked: false,
      Icon: CATEGORY_ICONS[s.category] || Package,
    })),
    ...(profile.loans || []).map((l) => ({
      name: l.name,
      amount: l.monthlyPayment,
      negotiability: null,
      locked: true,
      Icon: Smartphone,
    })),
  ];

  const negotiableCount = items.filter(i => !i.locked).length;

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
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Home className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Kostnads-jakt</p>
                  <p className="text-xs text-slate-500">{negotiableCount} förhandlingsbara poster</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total */}
            <div className="my-4 p-3 rounded-xl flex justify-between items-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="text-sm text-slate-400">Totalt fasta kostnader</span>
              <span className="text-base font-bold text-amber-400">{fmt(totalFixed)} kr/mån</span>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {items.map((item, i) => {
                const Icon = item.Icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{item.name}</p>
                      {item.locked && (
                        <p className="text-xs text-slate-600">Låst kostnad</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.negotiability ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.negotiability.bg} ${item.negotiability.color}`}>
                          {item.negotiability.label}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-white/5 text-slate-600">
                          Låst
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">{fmt(item.amount)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={() => { onClose(); onNegotiate && onNegotiate(); }}
              className="w-full mt-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-6 shadow-lg shadow-amber-500/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Starta Förhandling
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}