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
      className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <Receipt className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Avdragsgilla utgifter</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
          {totalDeductible.toLocaleString('sv-SE')} kr
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
        {transactions.map((t, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: t.type === 'income' ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}>
                {t.type === 'income'
                  ? <Receipt className="w-4 h-4" style={{ color: '#0D7377' }} />
                  : <Receipt className="w-4 h-4" style={{ color: '#9AA5B4' }} />}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{t.label}</p>
                <p className="text-xs" style={{ color: '#9AA5B4' }}>{t.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-sm font-bold"
                style={{ color: t.type === 'income' ? '#0D7377' : '#1A2332' }}>
                {t.type === 'income' ? '+' : ''}{t.amount.toLocaleString('sv-SE')} kr
              </p>
              {t.deductible && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}