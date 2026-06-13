import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, CheckCircle2, AlertTriangle, Image, Clock, Check, Wallet, Receipt } from 'lucide-react';

const ENTRY_ICON_MAP = {
  income: Wallet,
  receipt: Receipt,
};

const ACCOUNTS = [
  { code: '5420', label: 'Programvaror & IT' },
  { code: '5800', label: 'Resekostnader' },
  { code: '5900', label: 'Representation' },
  { code: '5410', label: 'Förbrukningsinventarier' },
  { code: '6212', label: 'Mobiltelefon' },
  { code: '5100', label: 'Lokalkostnader' },
  { code: '4000', label: 'Varuinköp' },
  { code: '1930', label: 'Företagskonto' },
  { code: '2641', label: 'Ingående moms 25%' },
  { code: '2640', label: 'Ingående moms 12%' },
  { code: '1510', label: 'Kundfordringar' },
];

export default function LedgerEntryDetail({ entry, onClose }) {
  const [editingLine, setEditingLine] = useState(null);
  const [lines, setLines] = useState(entry.lines);
  const [saved, setSaved] = useState(false);

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleAccountChange = (idx, code) => {
    const acc = ACCOUNTS.find(a => a.code === code);
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, account: code, accountLabel: acc?.label || l.accountLabel } : l));
    setEditingLine(null);
    setSaved(false);
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
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl overflow-hidden"
        style={{ background: '#1A2B3C', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-10"
          style={{ background: '#1A2B3C', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            {(() => { const Icon = ENTRY_ICON_MAP[entry.iconKey] || Receipt; return <Icon className="w-6 h-6" style={{ color: 'rgba(155,173,184,0.8)' }} aria-hidden />; })()}
            <div>
              <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>{entry.vendor}</p>
              <p className="text-xs" style={{ color: 'rgba(155,173,184,0.5)' }}>{entry.date} · Verifikat #{entry.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {entry.synced && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A', boxShadow: 'var(--anchor-shadow-1)' }}>
                <Check className="w-3 h-3 inline mr-0.5" aria-hidden /> Fortnox
              </span>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Double-entry table */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(155,173,184,0.5)' }}>
              Dubbel bokföring
            </p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
              {/* Table header */}
              <div className="grid grid-cols-12 px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="col-span-2 text-[10px] font-bold uppercase" style={{ color: 'rgba(155,173,184,0.5)' }}>Konto</p>
                <p className="col-span-5 text-[10px] font-bold uppercase" style={{ color: 'rgba(155,173,184,0.5)' }}>Benämning</p>
                <p className="col-span-2 text-[10px] font-bold uppercase text-right" style={{ color: 'rgba(155,173,184,0.5)' }}>Debet</p>
                <p className="col-span-2 text-[10px] font-bold uppercase text-right" style={{ color: 'rgba(155,173,184,0.5)' }}>Kredit</p>
                <p className="col-span-1"></p>
              </div>

              {lines.map((line, idx) => (
                <div key={idx}>
                  <div className="grid grid-cols-12 items-center px-3 py-2.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="col-span-2 text-[11px] font-bold" style={{ color: '#4B7CF3' }}>{line.account}</p>
                    <p className="col-span-5 text-[11px]" style={{ color: 'rgba(155,173,184,0.8)' }}>{line.accountLabel}</p>
                    <p className="col-span-2 text-[11px] font-bold text-right" style={{ color: line.debit ? '#F0EAD6' : 'rgba(155,173,184,0.25)' }}>
                      {line.debit ? `${line.debit.toFixed(2)}` : '—'}
                    </p>
                    <p className="col-span-2 text-[11px] font-bold text-right" style={{ color: line.credit ? '#F0EAD6' : 'rgba(155,173,184,0.25)' }}>
                      {line.credit ? `${line.credit.toFixed(2)}` : '—'}
                    </p>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => setEditingLine(editingLine === idx ? null : idx)}>
                        <Edit2 className="w-3 h-3" style={{ color: 'rgba(155,173,184,0.35)' }} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editingLine === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        style={{ background: 'rgba(75,124,243,0.06)', borderBottom: '1px solid rgba(75,124,243,0.2)' }}
                      >
                        <div className="px-3 py-2 grid grid-cols-2 gap-1.5">
                          {ACCOUNTS.map(a => (
                            <button
                              key={a.code}
                              onClick={() => handleAccountChange(idx, a.code)}
                              className="text-[11px] px-2 py-1.5 rounded-lg text-left font-medium"
                              style={{
                                background: line.account === a.code ? 'rgba(75,124,243,0.2)' : 'rgba(255,255,255,0.04)',
                                color: line.account === a.code ? '#4B7CF3' : 'rgba(155,173,184,0.7)',
                                border: line.account === a.code ? '1px solid rgba(75,124,243,0.4)' : '1px solid transparent',
                              }}>
                              {a.code} {a.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Totals */}
              <div className="grid grid-cols-12 px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="col-span-7 text-[11px] font-black uppercase" style={{ color: '#F0EAD6' }}>TOTALT</p>
                <p className="col-span-2 text-[11px] font-black text-right" style={{ color: '#F0EAD6' }}>{totalDebit.toFixed(2)}</p>
                <p className="col-span-2 text-[11px] font-black text-right" style={{ color: '#F0EAD6' }}>{totalCredit.toFixed(2)}</p>
                <div className="col-span-1 flex justify-end">
                  {balanced
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} />
                    : <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#D95F5F' }} />
                  }
                </div>
              </div>
            </div>

            {!balanced && (
              <p className="text-[11px] mt-1.5 text-center" style={{ color: '#D95F5F' }}>
                <AlertTriangle className="w-3 h-3 inline mr-1" aria-hidden /> Debet och Kredit balanserar inte — justera kontona
              </p>
            )}
          </div>

          {/* Save override */}
          {editingLine === null && !saved && (
            <button
              onClick={() => setSaved(true)}
              className="w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A', boxShadow: 'var(--anchor-shadow-1)' }}>
              <Check className="w-3.5 h-3.5" /> Spara ändringar
            </button>
          )}
          {saved && (
            <p className="text-xs text-center inline-flex items-center justify-center gap-1 w-full" style={{ color: '#3DAA7A' }}><Check className="w-3 h-3" aria-hidden /> Ändringar sparade</p>
          )}

          {/* Receipt */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(155,173,184,0.5)' }}>
              Digitalt underlag
            </p>
            <div className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: entry.hasReceipt ? 'rgba(61,170,122,0.07)' : 'rgba(212,175,55,0.07)',
                boxShadow: 'var(--anchor-shadow-1)',
              }}>
              <Image className="w-4 h-4 flex-shrink-0" style={{ color: entry.hasReceipt ? '#3DAA7A' : '#D4AF37' }} />
              <div>
                <p className="text-xs font-medium" style={{ color: entry.hasReceipt ? '#3DAA7A' : '#D4AF37' }}>
                  {entry.hasReceipt
                    ? <span className="inline-flex items-center gap-1"><Check className="w-3 h-3" aria-hidden /> Kvitto bifogat och OCR-läst</span>
                    : <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" aria-hidden /> Kvitto saknas — ladda upp för att låsa bokföringen</span>}
                </p>
                {entry.hasReceipt && (
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(155,173,184,0.45)' }}>
                    Leverantör: {entry.vendor} · Belopp: {Math.abs(entry.amount)} kr · Moms: {entry.vatRate}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(155,173,184,0.5)' }}>
              Audit Trail
            </p>
            <div className="space-y-0">
              {entry.auditLog.map((log, i) => (
                <div key={i} className="flex gap-3 items-start py-2"
                  style={{ borderBottom: i < entry.auditLog.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: 'rgba(155,173,184,0.35)' }} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>{log.time}</p>
                    <p className="text-xs" style={{ color: 'rgba(155,173,184,0.8)' }}>{log.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}