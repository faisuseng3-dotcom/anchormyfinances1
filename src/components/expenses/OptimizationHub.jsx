import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShoppingCart, Star, Ghost, Coffee, Heart, Check, Clock3, Sparkle } from 'lucide-react';
import { FeelingIcon } from '@/lib/anchorIcons';
import { Button } from '@/components/ui/button';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

function BasketSwap({ item }) {
  const alt = Math.round(item.amount * 0.78);
  const saving = item.amount - alt;
  return (
    <div>
      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> The Basket Swap</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs text-slate-400 mb-1">ICA (nuvarande)</p>
          <p className="text-lg font-bold text-rose-400">{fmt(item.amount)} kr</p>
        </div>
        <span className="text-slate-500 text-xl">⇄</span>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-xs text-slate-400 mb-1">Willys (alternativ)</p>
          <p className="text-lg font-bold text-emerald-400">{fmt(alt)} kr</p>
        </div>
      </div>
      <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <p className="text-xs text-indigo-300">Förslag: Identisk kasse hos Willys sparar dig <span className="font-bold text-white">{fmt(saving)} kr/mån</span>. Ekologiska mejeriprodukter kan bytas mot liknande utan att offra kvaliteten.</p>
      </div>
      <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-5">
        <ShoppingCart className="w-4 h-4 mr-2" /> Uppdatera min smarta inköpslista
      </Button>
    </div>
  );
}

function GhostNegotiator({ item }) {
  const [step, setStep] = useState(0);
  const market = Math.round(item.amount * 0.55);

  useEffect(() => {
    if (step < 3) {
      const t = setTimeout(() => setStep(s => s + 1), 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  const steps = [
    'Analyserar marknadsläget...',
    'Hittar bättre avtal...',
    'Genererar argument för prutning...',
  ];

  return (
    <div>
      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Ghost className="w-4 h-4" /> The Ghost Negotiator</p>
      <div className="space-y-2 mb-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: step > i ? 1 : 0.2, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 text-xs text-slate-400"
          >
            {step > i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clock3 className="w-3.5 h-3.5 text-slate-500" />} {s}
          </motion.div>
        ))}
      </div>
      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs text-indigo-300 flex items-start gap-1.5"><Sparkle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden /> Ditt abonnemang kostar <span className="font-bold text-rose-400">{fmt(item.amount)} kr</span>. Snittet för din förbrukning ligger på <span className="font-bold text-emerald-400">{fmt(market)} kr</span>. Jag har förberett ett manus du kan klistra in hos din operatör.</p>
          </div>
          <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-5">
            <Zap className="w-4 h-4 mr-2" /> Starta prut-chatt
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function MicroHabitSwitch({ item }) {
  const weekly = Math.round(item.amount / 4);
  const savedPerMonth = Math.round(weekly * 2);
  const goalAmount = 20000;
  const monthsEarlier = Math.round(savedPerMonth / (savedPerMonth + 1) * 8);

  return (
    <div>
      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Coffee className="w-4 h-4" /> The Micro-Habit Switch</p>
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Ute (4x/vecka)</span>
          <span className="text-sm font-bold text-rose-400">{fmt(item.amount)} kr/mån</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Hemma + spara hälften</span>
          <span className="text-sm font-bold text-emerald-400">+{fmt(savedPerMonth)} kr → Madrid</span>
        </div>
      </div>
      <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <p className="text-xs text-indigo-300 flex items-start gap-1.5"><Sparkle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden /> Om du brygger hemma halverar du kostnaden. Du når din <span className="font-bold text-white">Madrid-resa</span> {monthsEarlier} dagar tidigare.</p>
      </div>
      <Button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-5">
        <Star className="w-4 h-4 mr-2" /> Aktivera 'Skippa-Kaffet'-utmaningen
      </Button>
    </div>
  );
}

function HappinessMap({ feelings, item }) {
  const loved = Object.entries(feelings).filter(([, v]) => v === 'star').length;
  const meh = Object.entries(feelings).filter(([, v]) => v === 'neutral').length;
  const skip = Object.entries(feelings).filter(([, v]) => v === 'skip').length;

  return (
    <div className="mt-5 pt-4 border-t border-white/10">
      <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Heart className="w-4 h-4" /> Livskvalitets-analys</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Älskar', count: loved, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)', feel: 'star' },
          { label: 'Okej', count: meh, color: 'text-slate-400', bg: 'rgba(100,116,139,0.1)', feel: 'neutral' },
          { label: 'Onödig', count: skip, color: 'text-rose-400', bg: 'rgba(239,68,68,0.1)', feel: 'skip' },
        ].map(({ label, count, color, bg, feel }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: bg, border: '1px solid rgba(255,255,255,0.06)' }}>
            <FeelingIcon type={feel} size={20} className={`mx-auto mb-1 ${color}`} />
            <p className={`text-lg font-bold ${color}`}>{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      {loved > 0 && (
        <p className="text-xs text-emerald-400 mt-3 italic">Uppfattat – vi skyddar din livskvalitetsbudget för {loved} post{loved > 1 ? 'er' : ''}.</p>
      )}
    </div>
  );
}

function hubType(item) {
  if (!item) return null;
  if (item.category === 'food') return 'basket';
  if (['other', 'entertainment', 'utilities'].includes(item.category)) return 'negotiator';
  return 'habit';
}

export default function OptimizationHub({ item, onClose, feelings }) {
  if (!item) return null;
  const type = hubType(item);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={e => e.stopPropagation()}
          className="w-full rounded-t-3xl overflow-hidden"
          style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '85vh', overflowY: 'auto' }}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
          <div className="p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-base font-bold text-white">Optimization Hub</p>
                <p className="text-xs text-slate-500">{item.name} · {fmt(item.amount)} kr</p>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {type === 'basket' && <BasketSwap item={item} />}
            {type === 'negotiator' && <GhostNegotiator item={item} />}
            {type === 'habit' && <MicroHabitSwitch item={item} />}

            <HappinessMap feelings={feelings} item={item} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}