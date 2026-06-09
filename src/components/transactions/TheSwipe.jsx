// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { PiggyBank, Wallet, Check, Zap, ArrowDown } from 'lucide-react';

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

function AIFeedback({ amount, profile, direction, onAccept, onDismiss }) {
  const savingsBalance = profile?.savingsCurrentBalance || profile?.buffer || 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const goalName = profile?.savingsGoalName || 'ditt mål';

  let message = '';
  if (direction === 'to_spending') {
    if (savingsGoal > 0 && savingsBalance > 0) {
      const remaining = Math.max(0, savingsGoal - savingsBalance + amount);
      const monthlyMargin = (profile?.income || 0) - (profile?.housingCost || 0) -
        (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) -
        (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
      const savingsRate = monthlyMargin * 0.3;
      const extraDays = savingsRate > 0 ? Math.round((amount / savingsRate) * 30) : 0;
      message = `Okej, jag flyttar ${fmt(amount)} kr. Det betyder att du når ${goalName} ${extraDays > 0 ? `${extraDays} dagar senare` : 'ungefär lika snabbt'}. Är det okej?`;
    } else {
      message = `Okej, jag tar ${fmt(amount)} kr från sparkontot och lägger till i ditt tillgängliga saldo. Är det nödvändigt just nu?`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-2xl border border-amber-500/40 bg-amber-900/30 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-amber-200 text-sm font-semibold mb-1">Rådgivare</p>
          <p className="text-slate-300 text-xs leading-relaxed">{message}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onAccept}
              className="flex-1 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-xs font-semibold transition-all"
            >
              <span className="inline-flex items-center gap-1">Ja, flytta dem <Check className="w-3.5 h-3.5" /></span>
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition-all"
            >
              Avbryt
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CircleVisual({ direction, amount, onDragToSpending, onDragToSavings, profile }) {
  const controls = useAnimation();
  const [dragging, setDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null); // 'spending' | 'savings'

  const savingsBalance = profile?.savingsCurrentBalance || 0;
  const availableBalance = (profile?.income || 0) - (profile?.housingCost || 0) -
    (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) -
    (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

  return (
    <div className="relative flex items-center justify-between px-2 py-4 select-none">
      {/* Savings Circle */}
      <motion.div
        animate={dragTarget === 'savings' ? { scale: 1.12 } : { scale: 1 }}
        className="relative flex flex-col items-center gap-2"
      >
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15))',
            border: dragTarget === 'savings' ? '2px solid rgba(16,185,129,0.8)' : '2px solid rgba(16,185,129,0.4)',
            boxShadow: dragTarget === 'savings' ? '0 0 24px rgba(16,185,129,0.5)' : '0 0 12px rgba(16,185,129,0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <PiggyBank className="w-6 h-6 text-emerald-400" />
          <p className="text-white font-bold text-sm">{fmt(savingsBalance)}</p>
          <p className="text-emerald-400 text-[10px] font-semibold">kr</p>
        </div>
        <p className="text-slate-400 text-xs font-medium">Sparkonto</p>
      </motion.div>

      {/* Arrow indicator */}
      <div className="flex flex-col items-center gap-1">
        <motion.div
          animate={direction === 'to_spending'
            ? { x: [0, 6, 0], opacity: [0.4, 1, 0.4] }
            : { x: [0, -6, 0], opacity: [0.4, 1, 0.4] }
          }
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <ArrowDown
            className="w-5 h-5 text-slate-400"
            style={{ transform: direction === 'to_spending' ? 'rotate(-90deg)' : 'rotate(90deg)' }}
          />
        </motion.div>
        <p className="text-slate-500 text-[10px]">{fmt(amount)} kr</p>
      </div>

      {/* Spending Circle */}
      <motion.div
        animate={dragTarget === 'spending' ? { scale: 1.12 } : { scale: 1 }}
        className="relative flex flex-col items-center gap-2"
      >
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))',
            border: dragTarget === 'spending' ? '2px solid rgba(99,102,241,0.8)' : '2px solid rgba(99,102,241,0.4)',
            boxShadow: dragTarget === 'spending' ? '0 0 24px rgba(99,102,241,0.5)' : '0 0 12px rgba(99,102,241,0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <Wallet className="w-6 h-6 text-indigo-400" />
          <p className="text-white font-bold text-sm">{fmt(availableBalance)}</p>
          <p className="text-indigo-400 text-[10px] font-semibold">kr</p>
        </div>
        <p className="text-slate-400 text-xs font-medium">Tillgängligt</p>
      </motion.div>
    </div>
  );
}

export default function TheSwipe({ profile, onTransfer }) {
  const [direction, setDirection] = useState('to_spending');
  const [amount, setAmount] = useState(500);
  const [showAI, setShowAI] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (direction === 'to_spending') {
      setShowAI(true);
    } else {
      doTransfer();
    }
  };

  const doTransfer = () => {
    setShowAI(false);
    onTransfer(direction, amount);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Direction tabs */}
      <div className="flex rounded-2xl overflow-hidden border border-white/10 p-1 gap-1 bg-white/5">
        <button
          onClick={() => { setDirection('to_spending'); setShowAI(false); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            direction === 'to_spending'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" /> Spar → Spendera
        </button>
        <button
          onClick={() => { setDirection('to_savings'); setShowAI(false); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            direction === 'to_savings'
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Spendera → Spar
        </button>
      </div>

      {/* Circle Visual */}
      <CircleVisual
        direction={direction}
        amount={amount}
        profile={profile}
      />

      {/* Quick amount chips */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map(a => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
              amount === a
                ? direction === 'to_spending'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white/8 text-slate-300 hover:bg-white/12'
            }`}
          >
            {fmt(a)} kr
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(parseInt(e.target.value) || 0)}
          className="w-full h-12 rounded-xl bg-white/8 border border-white/10 text-white text-center text-lg font-bold focus:outline-none focus:border-indigo-500/70"
          placeholder="Eget belopp"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">kr</span>
      </div>

      {/* AI Feedback */}
      <AnimatePresence>
        {showAI && (
          <AIFeedback
            amount={amount}
            profile={profile}
            direction={direction}
            onAccept={doTransfer}
            onDismiss={() => setShowAI(false)}
          />
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <AnimatePresence mode="wait">
        {confirmed ? (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-bold text-sm">Överföring registrerad!</span>
          </motion.div>
        ) : (
          <motion.button
            key="cta"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={handleConfirm}
            disabled={amount <= 0 || showAI}
            className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all disabled:opacity-40"
            style={direction === 'to_spending'
              ? { background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }
              : { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }
            }
          >
            {direction === 'to_spending' ? (
              <><PiggyBank className="w-4 h-4" /> Flytta {fmt(amount)} kr till spendera</>
            ) : (
              <><PiggyBank className="w-4 h-4" /> Flytta {fmt(amount)} kr till sparande</>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}