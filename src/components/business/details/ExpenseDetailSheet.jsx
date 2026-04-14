import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pencil, Plus, CheckCircle2, Receipt } from 'lucide-react';

const ACCOUNT_MAP = {
  'Programvara': { code: '5420', label: 'Programvaror och licenser' },
  'Resor': { code: '5800', label: 'Resekostnader' },
  'Kontorsmaterial': { code: '5460', label: 'Förbrukningsinventarier' },
  'Marknadsföring': { code: '5900', label: 'Reklam och PR' },
  'Telefon': { code: '5210', label: 'Telefon och porto' },
  'default': { code: '5990', label: 'Övriga externa kostnader' },
};

export default function ExpenseDetailSheet({ transaction, onClose }) {
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState(transaction.category || 'Programvara');
  const [hasReceipt] = useState(!!transaction.receipt);

  const account = ACCOUNT_MAP[editCategory] || ACCOUNT_MAP.default;
  const absAmount = Math.abs(transaction.amount);
  const vatRate = 0.25;
  const net = Math.round(absAmount / (1 + vatRate));
  const vat = absAmount - net;
  const taxSaving = Math.round(net * 0.30);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#fff', maxHeight: '88vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: '#F4F6F8' }}>
              <Receipt className="w-5 h-5" style={{ color: '#9AA5B4' }} />
            </div>
            <div>
              <p className="text-base font-black" style={{ color: '#1A2332' }}>{transaction.label}</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>{transaction.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(v => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: editing ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}>
              <Pencil className="w-3.5 h-3.5" style={{ color: editing ? '#0D7377' : '#9AA5B4' }} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#F4F6F8' }}>
              <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Tax saving hero */}
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(13,115,119,0.06)' }}>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Detta inköp sänker din skatt med</p>
            <p className="text-3xl font-black mt-1" style={{ color: '#0D7377', letterSpacing: '-1px' }}>
              −{taxSaving.toLocaleString('sv-SE')} kr
            </p>
          </div>

          {/* Moms-split */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F2F5' }}>
            <div className="px-4 py-2.5" style={{ background: '#F4F6F8', borderBottom: '1px solid #F0F2F5' }}>
              <p className="text-xs font-bold" style={{ color: '#4A5568' }}>Moms-specifikation (25%)</p>
            </div>
            {[
              { label: 'Brutto (totalt)', value: absAmount, bold: false },
              { label: 'Netto (exkl. moms)', value: net, bold: false },
              { label: 'Moms 25%', value: vat, bold: false, accent: '#D4AF37' },
              { label: 'Avdragsgillt netto', value: net, bold: true, accent: '#0D7377' },
            ].map(row => (
              <div key={row.label} className="px-4 py-2.5 flex justify-between items-center"
                style={{ borderBottom: '1px solid #F0F2F5' }}>
                <span className="text-xs" style={{ color: '#9AA5B4' }}>{row.label}</span>
                <span className="text-sm font-black"
                  style={{ color: row.accent || '#1A2332' }}>
                  {row.value.toLocaleString('sv-SE')} kr
                </span>
              </div>
            ))}
          </div>

          {/* Konto */}
          <div className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#9AA5B4' }}>Bokföringskonto</p>
            {editing ? (
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-sm font-bold"
                style={{ background: '#fff', border: '1.5px solid #0D7377', color: '#1A2332' }}>
                {Object.keys(ACCOUNT_MAP).filter(k => k !== 'default').map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black" style={{ color: '#1A2332' }}>
                    {account.code} — {account.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>{editCategory}</p>
                </div>
                {transaction.deductible && (
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#0D7377' }} />
                )}
              </div>
            )}
          </div>

          {/* Receipt preview */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#9AA5B4' }}>Kvitto</p>
            {hasReceipt ? (
              <div className="w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0' }}>
                <img src={transaction.receipt} alt="Kvitto"
                  className="w-full h-full object-cover rounded-2xl" />
              </div>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full h-20 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold text-sm"
                style={{ background: '#F4F6F8', border: '2px dashed #E8ECF0', color: '#9AA5B4' }}>
                <Plus className="w-5 h-5" />
                Lägg till kvitto
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}