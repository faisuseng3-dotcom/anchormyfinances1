import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, Clock, Bell, CheckCircle2 } from 'lucide-react';
import InvoiceDetailSheet from '@/components/business/details/InvoiceDetailSheet';

const fmt = (n) => n.toLocaleString('sv-SE');

function InvoiceCard({ inv, onMarkPaid, onRemind, onOpen }) {
  const isOverdue = inv.status === 'overdue';
  const isSoon    = inv.daysLeft <= 7 && inv.daysLeft >= 0 && !isOverdue;

  const cardBg    = isOverdue ? 'rgba(229,62,62,0.05)' : '#fff';
  const cardBorder = isOverdue ? '1.5px solid rgba(229,62,62,0.18)' : '1.5px solid transparent';
  const statusColor = isOverdue ? '#E53E3E' : isSoon ? '#D69E2E' : '#0D7377';
  const statusBg    = isOverdue ? 'rgba(229,62,62,0.1)' : isSoon ? 'rgba(214,158,46,0.1)' : 'rgba(13,115,119,0.1)';
  const statusLabel = isOverdue ? 'Förfallen' : `${inv.daysLeft} dagar`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-3xl p-4"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: isOverdue
          ? '0 4px 16px rgba(229,62,62,0.08)'
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOverdue ? 'rgba(229,62,62,0.12)' : 'rgba(13,115,119,0.08)' }}>
            {isOverdue
              ? <AlertCircle className="w-5 h-5" style={{ color: '#E53E3E' }} />
              : <Clock className="w-5 h-5" style={{ color: isSoon ? '#D69E2E' : '#0D7377' }} />}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{inv.client}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>{inv.id} · Förfaller {inv.due}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-black" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
            {fmt(inv.amount)} kr
          </p>
          <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1"
            style={{ background: statusBg, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onRemind(inv.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-colors"
          style={{
            background: 'rgba(13,115,119,0.08)',
            color: '#0D7377',
            border: '1px solid rgba(13,115,119,0.15)',
          }}
        >
          <Bell className="w-3.5 h-3.5" />
          Påminn
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onMarkPaid(inv.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-colors"
          style={{
            background: 'rgba(61,170,122,0.1)',
            color: '#3DAA7A',
            border: '1px solid rgba(61,170,122,0.2)',
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Markera betald
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onOpen(inv)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ background: '#F4F6F8' }}
        >
          <FileText className="w-4 h-4" style={{ color: '#9AA5B4' }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function InvoiceList({ invoices: initialInvoices }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selected, setSelected] = useState(null);
  const [reminded, setReminded] = useState(new Set());

  const total = invoices.reduce((s, i) => s + i.amount, 0);

  const handleMarkPaid = (id) => setInvoices(prev => prev.filter(inv => inv.id !== id));
  const handleRemind = (id) => setReminded(prev => new Set([...prev, id]));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <FileText className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Utestående fakturor</p>
        </div>
        <p className="text-sm font-black" style={{ color: '#0D7377' }}>{fmt(total)} kr</p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {invoices.map(inv => (
            <InvoiceCard
              key={inv.id}
              inv={inv}
              onMarkPaid={handleMarkPaid}
              onRemind={handleRemind}
              onOpen={setSelected}
            />
          ))}
        </AnimatePresence>
        {invoices.length === 0 && (
          <div className="py-10 text-center rounded-3xl" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-semibold" style={{ color: '#4A5568' }}>Inga utestående fakturor</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <InvoiceDetailSheet
            invoice={selected}
            onClose={() => setSelected(null)}
            onMarkPaid={(id) => { handleMarkPaid(id); setSelected(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}