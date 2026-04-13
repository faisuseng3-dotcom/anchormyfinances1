import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Download, ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';

const EVENTS = [
  {
    id: 1, date: '2026-04-11', time: '14:22',
    vendor: 'Adobe Inc', description: 'Programvara',
    account: '5420', accountLabel: 'Programvaror',
    counterAccount: '1930', counterLabel: 'Företagskonto',
    amount: -699, vat: 139.80, vatRate: 25,
    hasReceipt: true, icon: '🎨', bookedBy: 'Anchor AI', type: 'expense',
  },
  {
    id: 2, date: '2026-04-11', time: '09:15',
    vendor: 'SJ AB', description: 'Resor',
    account: '5800', accountLabel: 'Resekostnader',
    counterAccount: '1930', counterLabel: 'Företagskonto',
    amount: -580, vat: 52.73, vatRate: 10,
    hasReceipt: true, icon: '🚆', bookedBy: 'Anchor AI', type: 'expense',
  },
  {
    id: 3, date: '2026-04-10', time: '12:00',
    vendor: 'Kund: Acme AB', description: 'Inkomst',
    account: '1510', accountLabel: 'Kundfordringar',
    counterAccount: '1930', counterLabel: 'Företagskonto',
    amount: 24500, vat: 0, vatRate: 0,
    hasReceipt: false, icon: '💸', bookedBy: 'Anchor AI', type: 'income',
  },
  {
    id: 4, date: '2026-04-09', time: '18:40',
    vendor: 'Webhallen', description: 'IT-utrustning',
    account: '5410', accountLabel: 'Förbrukningsinventarier',
    counterAccount: '1930', counterLabel: 'Företagskonto',
    amount: -4990, vat: 998, vatRate: 25,
    hasReceipt: false, icon: '💻', bookedBy: 'Anchor AI', type: 'expense',
  },
  {
    id: 5, date: '2026-04-08', time: '20:10',
    vendor: 'Restaurang PM & Vänner', description: 'Representation',
    account: '5900', accountLabel: 'Representation',
    counterAccount: '1930', counterLabel: 'Företagskonto',
    amount: -1840, vat: 220.80, vatRate: 12,
    hasReceipt: false, icon: '🍽️', bookedBy: 'Anchor AI', type: 'expense',
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#F4F6F8' }}
      >
        {/* Modal header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between bg-white"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: '#F4F6F8' }}>
              {event.icon}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#1A2332' }}>{event.vendor}</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>{event.date} · {event.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#F4F6F8' }}>
            <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Details */}
          <div className="rounded-2xl overflow-hidden bg-white">
            {[
              { label: 'Konto', value: `${event.account} — ${event.accountLabel}` },
              { label: 'Motkonto', value: `${event.counterAccount} — ${event.counterLabel}` },
              { label: 'Exkl. moms', value: `${(Math.abs(event.amount) - event.vat).toFixed(0)} kr` },
              { label: `Moms ${event.vatRate}%`, value: `${event.vat.toFixed(0)} kr` },
              { label: 'Totalt', value: `${Math.abs(event.amount).toLocaleString('sv-SE')} kr` },
            ].map((row, i, arr) => (
              <div key={row.label} className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
                <p className="text-xs" style={{ color: '#9AA5B4' }}>{row.label}</p>
                <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* Receipt status */}
          <div className="px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: event.hasReceipt ? 'rgba(13,115,119,0.06)' : '#FFF8F0',
              border: `1px solid ${event.hasReceipt ? 'rgba(13,115,119,0.2)' : '#FFE0B2'}`,
            }}>
            <p className="text-sm font-medium"
              style={{ color: event.hasReceipt ? '#0D7377' : '#B45309' }}>
              {event.hasReceipt ? '✓ Kvitto bifogat' : 'Kvitto saknas — lägg till för att säkra avdraget'}
            </p>
          </div>

          <button onClick={handleDownload}
            className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: '#0D7377', color: '#fff' }}>
            <Download className="w-4 h-4" /> Ladda ner verifikat
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
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Senaste händelser</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Tryck för att se verifikat</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9AA5B4' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Sök leverantör eller kategori…"
              className="w-full h-10 pl-9 pr-3 rounded-2xl text-sm"
              style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }}
            />
          </div>
        </div>

        {/* Event list — Revolut bank-feed style */}
        <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
          {filtered.map(event => (
            <motion.button
              key={event.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(event)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: event.type === 'income' ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}>
                  {event.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{event.vendor}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs" style={{ color: '#9AA5B4' }}>{event.description} · {event.date}</p>
                    {!event.hasReceipt && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#FFF0E0', color: '#D97706' }}>
                        Kvitto saknas
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-sm font-bold"
                  style={{ color: event.amount > 0 ? '#0D7377' : '#1A2332' }}>
                  {event.amount > 0 ? '+' : ''}{event.amount.toLocaleString('sv-SE')} kr
                </p>
                <ChevronRight className="w-4 h-4" style={{ color: '#D0D7E0' }} />
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: '#9AA5B4' }}>Inga matchande händelser</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <VerifikatModal event={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}