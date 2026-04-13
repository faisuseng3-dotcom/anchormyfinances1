import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Clock } from 'lucide-react';

export default function InvoiceList({ invoices }) {
  const total = invoices.reduce((s, i) => s + i.amount, 0);

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
            <FileText className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Utestående fakturor</p>
        </div>
        <p className="text-sm font-black" style={{ color: '#0D7377' }}>
          {total.toLocaleString('sv-SE')} kr
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
        {invoices.map((inv) => {
          const isOverdue = inv.status === 'overdue';
          const isSoon = inv.daysLeft <= 7 && inv.daysLeft >= 0;
          return (
            <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isOverdue ? 'rgba(229,62,62,0.1)' : '#F4F6F8' }}>
                  {isOverdue
                    ? <AlertCircle className="w-4 h-4" style={{ color: '#E53E3E' }} />
                    : <Clock className="w-4 h-4" style={{ color: isSoon ? '#D69E2E' : '#9AA5B4' }} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{inv.client}</p>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>{inv.id} · {inv.due}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
                  {inv.amount.toLocaleString('sv-SE')} kr
                </p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: isOverdue ? 'rgba(229,62,62,0.1)' : isSoon ? 'rgba(214,158,46,0.1)' : 'rgba(13,115,119,0.1)',
                    color: isOverdue ? '#E53E3E' : isSoon ? '#D69E2E' : '#0D7377',
                  }}>
                  {isOverdue ? 'Förfallen' : `${inv.daysLeft}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}