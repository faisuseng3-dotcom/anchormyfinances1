import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, X, Download, FileText, Image, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const EVENTS = [
  {
    id: 1,
    date: '2026-04-11',
    time: '14:22',
    vendor: 'Adobe Inc',
    description: 'Inköp av programvara',
    account: '5420',
    accountLabel: 'Programvaror',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -699,
    vat: 139.80,
    vatRate: 25,
    hasReceipt: true,
    icon: '🎨',
    bookedBy: 'Anchor AI',
    type: 'expense',
  },
  {
    id: 2,
    date: '2026-04-11',
    time: '09:15',
    vendor: 'SJ AB',
    description: 'Tågresa Stockholm–Göteborg',
    account: '5800',
    accountLabel: 'Resekostnader',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -580,
    vat: 52.73,
    vatRate: 10,
    hasReceipt: true,
    icon: '🚆',
    bookedBy: 'Anchor AI',
    type: 'expense',
  },
  {
    id: 3,
    date: '2026-04-10',
    time: '12:00',
    vendor: 'Kund: Acme AB',
    description: 'Faktura #2024-18 betald',
    account: '1510',
    accountLabel: 'Kundfordringar',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: 24500,
    vat: 0,
    vatRate: 0,
    hasReceipt: false,
    icon: '💸',
    bookedBy: 'Anchor AI',
    type: 'income',
  },
  {
    id: 4,
    date: '2026-04-09',
    time: '18:40',
    vendor: 'Webhallen',
    description: 'IT-utrustning (kvitto saknas)',
    account: '5410',
    accountLabel: 'Förbrukningsinventarier',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -4990,
    vat: 998,
    vatRate: 25,
    hasReceipt: false,
    icon: '💻',
    bookedBy: 'Anchor AI',
    type: 'expense',
  },
  {
    id: 5,
    date: '2026-04-08',
    time: '20:10',
    vendor: 'Restaurang PM & Vänner',
    description: 'Representation — kundlunch',
    account: '5900',
    accountLabel: 'Representation',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -1840,
    vat: 220.80,
    vatRate: 12,
    hasReceipt: false,
    icon: '🍽️',
    bookedBy: 'Anchor AI',
    type: 'expense',
  },
];

function VerifikatModal({ event, onClose }) {
  const handleDownload = () => {
    const content = `VERIFIKAT — Bokfört via Anchor AI\n${'='.repeat(40)}\nHändelse: ${event.description}\nLeverantör: ${event.vendor}\nDatum: ${event.date} ${event.time}\n\nKonto: ${event.account} (${event.accountLabel})\nMotkonto: ${event.counterAccount} (${event.counterLabel})\nBelopp: ${Math.abs(event.amount).toLocaleString('sv-SE')} kr\nMoms ${event.vatRate}%: ${event.vat.toFixed(2)} kr\n\nBokfört av: ${event.bookedBy}\n${'='.repeat(40)}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifikat_${event.id}_${event.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl overflow-hidden"
        style={{ background: '#1A2B3C', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{event.icon}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>{event.description}</p>
              <p className="text-xs" style={{ color: 'rgba(155,173,184,0.5)' }}>{event.date} {event.time} · {event.bookedBy}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Accounting entry */}
          <div className="space-y-2">
            {[
              { label: 'Konto', value: `${event.account} — ${event.accountLabel}` },
              { label: 'Motkonto', value: `${event.counterAccount} — ${event.counterLabel}` },
              { label: 'Belopp exkl. moms', value: `${(Math.abs(event.amount) - event.vat).toFixed(2)} kr` },
              { label: `Moms (${event.vatRate}% ingående)`, value: `${event.vat.toFixed(2)} kr` },
              { label: 'Totalt', value: `${Math.abs(event.amount).toLocaleString('sv-SE')} kr` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs" style={{ color: 'rgba(155,173,184,0.55)' }}>{row.label}</p>
                <p className="text-xs font-bold" style={{ color: '#F0EAD6' }}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* Receipt */}
          <div className="p-3 rounded-xl flex items-center gap-3"
            style={{
              background: event.hasReceipt ? 'rgba(61,170,122,0.08)' : 'rgba(212,175,55,0.08)',
              border: `1px solid ${event.hasReceipt ? 'rgba(61,170,122,0.2)' : 'rgba(212,175,55,0.25)'}`,
            }}>
            <Image className="w-4 h-4 flex-shrink-0" style={{ color: event.hasReceipt ? '#3DAA7A' : '#D4AF37' }} />
            <p className="text-xs font-medium" style={{ color: event.hasReceipt ? '#3DAA7A' : '#D4AF37' }}>
              {event.hasReceipt ? '✓ Digitalt kvitto bifogat' : '⚠ Kvitto saknas — bokföringen kan ifrågasättas'}
            </p>
          </div>

          <button onClick={handleDownload}
            className="w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            style={{ background: 'rgba(75,124,243,0.15)', color: '#4B7CF3', border: '1px solid rgba(75,124,243,0.3)' }}>
            <Download className="w-3.5 h-3.5" /> Ladda ner som PDF-verifikation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ActivityStream() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = EVENTS.filter(e =>
    e.vendor.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.accountLabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(75,124,243,0.2)', border: '1px solid rgba(75,124,243,0.35)' }}>
              <Activity className="w-3.5 h-3.5" style={{ color: '#4B7CF3' }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#4B7CF3' }}>ACTIVITY STREAM</p>
              <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.55)' }}>Tryck för att se verifikat</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(155,173,184,0.4)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Sök händelse, konto, leverantör…'
              className="w-full h-9 pl-8 pr-3 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Events */}
        <div className="px-4 pb-4 pt-2 space-y-1.5">
          {filtered.map(event => (
            <motion.button
              key={event.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(event)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-lg w-8 text-center flex-shrink-0">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: '#F0EAD6' }}>{event.vendor}</p>
                <p className="text-[11px] truncate" style={{ color: 'rgba(155,173,184,0.55)' }}>
                  Konto {event.account} · {event.date}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black" style={{ color: event.amount < 0 ? '#D95F5F' : '#3DAA7A' }}>
                  {event.amount < 0 ? '−' : '+'}{Math.abs(event.amount).toLocaleString('sv-SE')} kr
                </p>
                {!event.hasReceipt && (
                  <span className="text-[10px]" style={{ color: '#D4AF37' }}>⚠ saknar kvitto</span>
                )}
              </div>
              <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(155,173,184,0.3)' }} />
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: 'rgba(155,173,184,0.4)' }}>Inga matchande händelser</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <VerifikatModal event={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}