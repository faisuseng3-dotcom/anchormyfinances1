import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Download, ChevronRight } from 'lucide-react';
import { BusinessDivider } from '@/components/business/BusinessChrome';

const EVENTS = [
  {
    id: 1,
    date: '2026-04-11',
    time: '14:22',
    vendor: 'Adobe Inc',
    description: 'Programvara',
    account: '5420',
    accountLabel: 'Programvaror',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -699,
    vat: 139.8,
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
    description: 'Resor',
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
    description: 'Inkomst',
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
    description: 'IT-utrustning',
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
    description: 'Representation',
    account: '5900',
    accountLabel: 'Representation',
    counterAccount: '1930',
    counterLabel: 'Företagskonto',
    amount: -1840,
    vat: 220.8,
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl overflow-hidden bg-[#F4F6F8]"
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between bg-white border-b border-[#E8ECF0]">
          <div className="flex items-center gap-3">
            <span className="text-xl">{event.icon}</span>
            <div>
              <p className="text-[15px] font-medium text-[#1A2332]">{event.vendor}</p>
              <p className="text-[13px] text-[#9AA5B4]">{event.description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F6F8] flex items-center justify-center">
            <X className="w-4 h-4 text-[#9AA5B4]" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 bg-white">
          {[
            ['Konto', `${event.account} — ${event.accountLabel}`],
            ['Motkonto', `${event.counterAccount} — ${event.counterLabel}`],
            ['Belopp', `${event.amount.toLocaleString('sv-SE')} kr`],
            ['Moms', `${event.vatRate}% (${event.vat.toFixed(2)} kr)`],
            ['Bokfört av', event.bookedBy],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-[14px]">
              <span className="text-[#9AA5B4]">{label}</span>
              <span className="font-medium text-[#1A2332]">{val}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full h-11 rounded-xl font-semibold text-[14px] text-white bg-[#0D7377] flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Ladda ner verifikat
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ActivityStream() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = EVENTS.filter(
    (e) =>
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <p className="text-[14px] text-[#9AA5B4] mb-3">Tryck för att se verifikat</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA5B4]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök leverantör eller kategori…"
          className="w-full h-11 pl-9 pr-3 rounded-xl text-[15px] bg-[#F0F2F5] border-0 text-[#1A2332] placeholder:text-[#9AA5B4]"
        />
      </div>

      <div>
        {filtered.map((event, i) => (
          <React.Fragment key={event.id}>
            {i > 0 && <BusinessDivider />}
            <button
              type="button"
              onClick={() => setSelected(event)}
              className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: event.type === 'income' ? 'rgba(13,115,119,0.12)' : '#F0F2F5' }}
              >
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[#1A2332] truncate">{event.vendor}</p>
                <p className="text-[13px] text-[#9AA5B4] truncate">
                  {event.description} · {event.date}
                  {!event.hasReceipt && ' · Kvitto saknas'}
                </p>
              </div>
              <p
                className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${event.amount > 0 ? 'text-[#0D7377]' : 'text-[#1A2332]'}`}
              >
                {event.amount > 0 ? '+' : ''}
                {event.amount.toLocaleString('sv-SE')} kr
              </p>
              <ChevronRight className="w-4 h-4 text-[#D0D7E0] flex-shrink-0 ml-1" />
            </button>
          </React.Fragment>
        ))}
        {filtered.length === 0 && (
          <p className="text-[14px] text-center py-8 text-[#9AA5B4]">Inga matchande händelser</p>
        )}
      </div>

      <AnimatePresence>
        {selected && <VerifikatModal event={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
