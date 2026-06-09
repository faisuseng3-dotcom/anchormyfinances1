// @ts-nocheck
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, CheckCircle2, Camera, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ACCOUNTS = [
  { code: '5420', label: 'Programvaror & IT' },
  { code: '5800', label: 'Resekostnader' },
  { code: '5900', label: 'Representation' },
  { code: '5410', label: 'Förbrukningsinventarier' },
  { code: '3000', label: 'Försäljning / Intäkter' },
  { code: '4000', label: 'Varuinköp' },
  { code: '5100', label: 'Lokalkostnader' },
  { code: '6212', label: 'Mobiltelefon' },
];

export default function ManualTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState('expense');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('25');
  const [account, setAccount] = useState('5420');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setReceiptUrl(file_url);
    setUploading(false);
  };

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const vatAmt = parsedAmount * (parseInt(vatRate) / 100);

  const handleSave = () => {
    if (!vendor || !parsedAmount) return;
    onAdd?.({
      vendor,
      amount: type === 'expense' ? -parsedAmount : parsedAmount,
      vatRate: parseInt(vatRate),
      vat: vatAmt,
      account,
      accountLabel: ACCOUNTS.find(a => a.code === account)?.label || '',
      note,
      type,
      receiptUrl,
      date: new Date().toLocaleDateString('sv-SE'),
      context: 'BUSINESS',
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <p className="font-bold text-sm" style={{ color: '#1A2332' }}>Ny transaktion</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#F4F6F8' }}>
            <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Type toggle */}
          <div className="flex gap-2">
            {[{ id: 'expense', label: 'Utgift', Icon: ArrowUpRight }, { id: 'income', label: 'Inkomst', Icon: ArrowDownLeft }].map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setAccount(t.id === 'income' ? '3000' : '5420'); }}
                className="flex-1 h-10 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5"
                style={{
                  background: type === t.id ? (t.id === 'expense' ? 'rgba(217,95,95,0.08)' : 'rgba(13,115,119,0.08)') : '#F4F6F8',
                  color: type === t.id ? (t.id === 'expense' ? '#E53E3E' : '#0D7377') : '#9AA5B4',
                  border: type === t.id ? `1.5px solid ${t.id === 'expense' ? 'rgba(229,62,62,0.3)' : 'rgba(13,115,119,0.3)'}` : '1.5px solid #F0F2F5',
                }}>
                <t.Icon className="w-3.5 h-3.5" aria-hidden /> {t.label}
              </button>
            ))}
          </div>

          {/* Vendor */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: '#9AA5B4' }}>Leverantör / Kund</label>
            <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="t.ex. Adobe Inc"
              className="w-full h-11 px-3 rounded-2xl text-sm"
              style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }} />
          </div>

          {/* Amount + VAT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: '#9AA5B4' }}>Belopp (inkl moms)</label>
              <div className="relative">
                <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-3 pr-8 rounded-2xl text-sm font-bold"
                  style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9AA5B4' }}>kr</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: '#9AA5B4' }}>Momssats</label>
              <select value={vatRate} onChange={e => setVatRate(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl text-sm font-bold"
                style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }}>
                <option value="25">25%</option>
                <option value="12">12%</option>
                <option value="6">6%</option>
                <option value="0">0%</option>
              </select>
            </div>
          </div>

          {/* VAT preview */}
          {parsedAmount > 0 && (
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 rounded-2xl text-center"
                style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                <p className="text-[10px]" style={{ color: '#9AA5B4' }}>Exkl. moms</p>
                <p className="text-sm font-black" style={{ color: '#0D7377' }}>
                  {(parsedAmount - vatAmt).toFixed(0)} kr
                </p>
              </div>
              <div className="flex-1 p-2.5 rounded-2xl text-center"
                style={{ background: '#F4F6F8', border: '1px solid #E8ECF0' }}>
                <p className="text-[10px]" style={{ color: '#9AA5B4' }}>Moms {vatRate}%</p>
                <p className="text-sm font-black" style={{ color: '#1A2332' }}>
                  {vatAmt.toFixed(0)} kr
                </p>
              </div>
            </div>
          )}

          {/* Account */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: '#9AA5B4' }}>Bokföringskonto</label>
            <select value={account} onChange={e => setAccount(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl text-sm font-bold"
              style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }}>
              {ACCOUNTS.map(a => (
                <option key={a.code} value={a.code}>{a.code} — {a.label}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: '#9AA5B4' }}>Anteckning (valfri)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="t.ex. Affärsresa kund X"
              className="w-full h-11 px-3 rounded-2xl text-sm"
              style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }} />
          </div>

          {/* Receipt upload */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: '#9AA5B4' }}>Underlag / Kvitto</label>
            {receiptUrl ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.2)' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#0D7377' }} />
                <p className="text-xs font-bold inline-flex items-center gap-1" style={{ color: '#0D7377' }}><Check className="w-3.5 h-3.5" aria-hidden /> Kvitto bifogat</p>
                <button onClick={() => setReceiptUrl(null)} className="ml-auto text-[10px]" style={{ color: '#9AA5B4' }}>Ta bort</button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
                style={{ background: '#F4F6F8', border: '1.5px dashed #D0D7E0', color: '#9AA5B4' }}>
                {uploading ? <span>Laddar upp…</span> : <><Camera className="w-3.5 h-3.5" /> Fota eller ladda upp kvitto</>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={handleReceiptUpload} />
          </div>

          <button onClick={handleSave}
            className="w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
            style={{
              background: saved ? 'rgba(13,115,119,0.1)' : '#0D7377',
              color: saved ? '#0D7377' : '#FFFFFF',
            }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Sparad!</> : <><Plus className="w-4 h-4" /> Bokför transaktion</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}