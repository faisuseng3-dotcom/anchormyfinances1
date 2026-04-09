import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Clock } from 'lucide-react';

export default function InvoiceList({ invoices }) {
  const total = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: '#D4AF37' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Utestående fakturor</p>
        </div>
        <p className="text-sm font-black" style={{ color: '#D4AF37' }}>
          {total.toLocaleString('sv-SE')} kr
        </p>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => {
          const isOverdue = inv.status === 'overdue';
          const isSoon = inv.daysLeft <= 7 && inv.daysLeft >= 0;
          return (
            <div key={inv.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: isOverdue ? 'rgba(201,64,64,0.1)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isOverdue ? 'rgba(201,64,64,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isOverdue ? 'rgba(201,64,64,0.2)' : isSoon ? 'rgba(212,175,55,0.2)' : 'rgba(52,168,106,0.15)' }}>
                {isOverdue
                  ? <AlertCircle className="w-4 h-4" style={{ color: '#C94040' }} />
                  : <Clock className="w-4 h-4" style={{ color: isSoon ? '#D4AF37' : '#34A86A' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{inv.client}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{inv.id} · Förfaller {inv.due}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {inv.amount.toLocaleString('sv-SE')} kr
                </p>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isOverdue ? 'rgba(201,64,64,0.25)' : isSoon ? 'rgba(212,175,55,0.25)' : 'rgba(52,168,106,0.2)',
                    color: isOverdue ? '#C94040' : isSoon ? '#D4AF37' : '#34A86A',
                  }}>
                  {isOverdue ? 'FÖRFALLEN' : `${inv.daysLeft}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}