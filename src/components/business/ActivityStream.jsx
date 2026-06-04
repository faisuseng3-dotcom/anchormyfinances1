import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Download,
  Palette,
  Train,
  ArrowDownLeft,
  Monitor,
  UtensilsCrossed,
  FileWarning,
} from 'lucide-react';
import { BusinessDivider, bizMetaClass, bizSubtitleClass } from '@/components/business/BusinessChrome';

const EVENT_ICON_MAP = {
  software: { Icon: Palette, bg: 'rgba(13,115,119,0.12)', color: '#0D7377' },
  travel: { Icon: Train, bg: 'rgba(13,115,119,0.12)', color: '#0D7377' },
  income: { Icon: ArrowDownLeft, bg: 'rgba(13,115,119,0.15)', color: '#0D7377' },
  equipment: { Icon: Monitor, bg: '#EEF1F4', color: '#6B7A8C' },
  dining: { Icon: UtensilsCrossed, bg: '#EEF1F4', color: '#6B7A8C' },
};

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
    iconKey: 'software',
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
    iconKey: 'travel',
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
    iconKey: 'income',
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
    iconKey: 'equipment',
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
    iconKey: 'dining',
    bookedBy: 'Anchor AI',
    type: 'expense',
  },
];

function EventAvatar({ iconKey, type }) {
  const meta = EVENT_ICON_MAP[iconKey] || EVENT_ICON_MAP.equipment;
  const { Icon, bg, color } = meta;
  const isIncome = type === 'income';

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E8ECF0]"
      style={{
        background: isIncome ? 'rgba(13,115,119,0.12)' : bg,
      }}
    >
      <Icon className="w-5 h-5" style={{ color: isIncome ? '#0D7377' : color }} />
    </div>
  );
}

function ReceiptBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md">
      <FileWarning className="w-3 h-3" />
      Kvitto saknas
    </span>
  );
}

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A2332]/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl overflow-hidden bg-[#F4F6F8] shadow-[0_-8px_32px_rgba(26,35,50,0.12)]"
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between bg-white border-b border-[#E8ECF0]">
          <div className="flex items-center gap-3 min-w-0">
            <EventAvatar iconKey={event.iconKey} type={event.type} />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#1A2332] truncate">{event.vendor}</p>
              <p className={`${bizMetaClass} truncate`}>
                {event.description} · {event.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4F6F8] flex items-center justify-center shrink-0"
            aria-label="Stäng"
          >
            <X className="w-4 h-4 text-[#6B7A8C]" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 bg-white">
          {!event.hasReceipt && (
            <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] px-3 py-2.5 flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-[#B45309] shrink-0" />
              <p className="text-[13px] text-[#92400E]">Kvitto saknas — komplettera innan deklaration.</p>
            </div>
          )}
          {[
            ['Konto', `${event.account} — ${event.accountLabel}`],
            ['Motkonto', `${event.counterAccount} — ${event.counterLabel}`],
            ['Belopp', `${event.amount.toLocaleString('sv-SE')} kr`],
            ['Moms', `${event.vatRate}% (${event.vat.toFixed(2)} kr)`],
            ['Bokfört av', event.bookedBy],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-4 text-[14px]">
              <span className="text-[#9AA5B4] shrink-0">{label}</span>
              <span className="font-medium text-[#1A2332] text-right">{val}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full h-11 rounded-xl font-semibold text-[14px] text-white bg-[#0D7377] flex items-center justify-center gap-2 active:opacity-90"
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
      <p className={`${bizSubtitleClass} mb-3`}>Tryck för att se verifikat</p>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA5B4]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök leverantör eller kategori…"
          className="w-full h-11 pl-10 pr-3 rounded-xl text-[15px] bg-white border border-[#E8ECF0] text-[#1A2332] placeholder:text-[#9AA5B4] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
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
              <EventAvatar iconKey={event.iconKey} type={event.type} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[#1A2332] truncate">{event.vendor}</p>
                <p className={`${bizMetaClass} mt-0.5 truncate`}>
                  {event.description} · {event.date}
                </p>
                {!event.hasReceipt && (
                  <div className="mt-1.5">
                    <ReceiptBadge />
                  </div>
                )}
              </div>
              <p
                className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${
                  event.amount > 0 ? 'text-[#0D7377]' : 'text-[#1A2332]'
                }`}
              >
                {event.amount > 0 ? '+' : ''}
                {event.amount.toLocaleString('sv-SE')} kr
              </p>
            </button>
          </React.Fragment>
        ))}
        {filtered.length === 0 && (
          <p className="text-[14px] text-center py-10 text-[#9AA5B4]">Inga matchande händelser</p>
        )}
      </div>

      <AnimatePresence>
        {selected && <VerifikatModal event={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
