import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SavingsDepositModal({ profile, onSave, onClose }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const current = profile?.savingsCurrentBalance || 0;
  const goal = profile?.savingsGoal || 0;
  const remaining = Math.max(goal - current, 0);

  const handleSave = async () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    const newBalance = current + val;
    await onSave(val, newBalance);
    if (newBalance >= goal) {
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 }, colors: ['#0D7377', '#4B7CF3', '#FFD700'] });
    }
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl p-6 pb-10"
          style={{ background: 'var(--color-card)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.12)' }}>
                <PiggyBank className="w-5 h-5" style={{ color: '#0D7377' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Spara mot</p>
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {profile?.savingsGoalEmoji || '🎯'} {profile?.savingsGoalName || 'Mitt mål'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {remaining > 0 && (
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Du behöver spara <strong>{remaining.toLocaleString('sv-SE')} kr</strong> till för att nå ditt mål.
            </p>
          )}

          <div className="relative mb-6">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full text-4xl font-black text-center py-5 rounded-2xl outline-none"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-accent)',
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>kr</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !amount}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'var(--color-accent)' }}
          >
            {saving ? 'Sparar...' : 'Bekräfta insättning'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}