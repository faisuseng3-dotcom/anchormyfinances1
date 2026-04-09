import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, CheckCircle2 } from 'lucide-react';

export default function DeductibleTransactions({ transactions }) {
  const deductible = transactions.filter(t => t.deductible);
  const totalDeductible = deductible.reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4" style={{ color: '#34A86A' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Avdragsgilla utgifter</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(52,168,106,0.2)', color: '#34A86A' }}>
          {totalDeductible.toLocaleString('sv-SE')} kr
        </span>
      </div>
      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div key={i} className="flex items-center gap-3 py-2"
            style={{ borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'income' ? '' : ''}`}
              style={{ background: t.type === 'income' ? '#34A86A' : t.deductible ? '#34A86A' : '#C94040' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{t.label}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.date}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-sm font-semibold"
                style={{ color: t.type === 'income' ? '#34A86A' : 'var(--color-text-primary)' }}>
                {t.type === 'income' ? '+' : ''}{t.amount.toLocaleString('sv-SE')} kr
              </p>
              {t.deductible && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#34A86A' }} />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}