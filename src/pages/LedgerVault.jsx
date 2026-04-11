import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Search, BookOpen } from 'lucide-react';
import LedgerEntryDetail from '@/components/business/LedgerEntryDetail';

const LEDGER_ENTRIES = [
  {
    id: 'A-0051',
    icon: '🎨',
    vendor: 'Adobe Inc',
    description: 'Inköp av programvara (Adobe CC)',
    date: '2026-04-11',
    amount: -699,
    vatRate: 25,
    hasReceipt: true,
    status: 'booked',
    synced: true,
    lines: [
      { account: '5420', accountLabel: 'Programvaror & IT', debit: 559.20, credit: null },
      { account: '2641', accountLabel: 'Ingående moms 25%', debit: 139.80, credit: null },
      { account: '1930', accountLabel: 'Företagskonto', debit: null, credit: 699.00 },
    ],
    auditLog: [
      { time: '2026-04-11 14:22', text: 'Transaktion identifierad via Bank-API.' },
      { time: '2026-04-11 14:23', text: 'Kvitto matchat via AI (Sannolikhet: 99%).' },
      { time: '2026-04-11 15:10', text: 'Affärshändelse godkänd av användare via Swipe.' },
      { time: '2026-04-11 15:11', text: 'Synkroniserad till Fortnox. Verifikat A-0051 skapat.' },
    ],
  },
  {
    id: 'A-0050',
    icon: '🚆',
    vendor: 'SJ AB',
    description: 'Tågresa Stockholm–Göteborg',
    date: '2026-04-11',
    amount: -580,
    vatRate: 10,
    hasReceipt: true,
    status: 'booked',
    synced: true,
    lines: [
      { account: '5800', accountLabel: 'Resekostnader', debit: 527.27, credit: null },
      { account: '2640', accountLabel: 'Ingående moms 12%', debit: 52.73, credit: null },
      { account: '1930', accountLabel: 'Företagskonto', debit: null, credit: 580.00 },
    ],
    auditLog: [
      { time: '2026-04-11 09:15', text: 'Transaktion identifierad via Bank-API.' },
      { time: '2026-04-11 09:16', text: 'Kvitto matchat via AI (Sannolikhet: 97%).' },
      { time: '2026-04-11 10:30', text: 'Affärshändelse godkänd av användare via Swipe.' },
    ],
  },
  {
    id: 'A-0049',
    icon: '💸',
    vendor: 'Kund: Acme AB',
    description: 'Faktura #2024-18 betald',
    date: '2026-04-10',
    amount: 24500,
    vatRate: 0,
    hasReceipt: false,
    status: 'booked',
    synced: false,
    lines: [
      { account: '1930', accountLabel: 'Företagskonto', debit: 24500, credit: null },
      { account: '1510', accountLabel: 'Kundfordringar', debit: null, credit: 24500 },
    ],
    auditLog: [
      { time: '2026-04-10 12:00', text: 'Inbetalning identifierad via Bank-API.' },
      { time: '2026-04-10 12:01', text: 'Matchad mot faktura #2024-18 (Acme AB) via AI.' },
      { time: '2026-04-10 12:05', text: 'Kundfordring bokförd som betald.' },
    ],
  },
  {
    id: 'A-0048',
    icon: '💻',
    vendor: 'Webhallen',
    description: 'IT-utrustning',
    date: '2026-04-09',
    amount: -4990,
    vatRate: 25,
    hasReceipt: false,
    status: 'pending',
    synced: false,
    lines: [
      { account: '5410', accountLabel: 'Förbrukningsinventarier', debit: 3992, credit: null },
      { account: '2641', accountLabel: 'Ingående moms 25%', debit: 998, credit: null },
      { account: '1930', accountLabel: 'Företagskonto', debit: null, credit: 4990 },
    ],
    auditLog: [
      { time: '2026-04-09 18:40', text: 'Transaktion identifierad via Bank-API.' },
      { time: '2026-04-09 18:40', text: 'AI förslag: Konto 5410. Kvitto saknas — bokföring pausad.' },
    ],
  },
  {
    id: 'A-0047',
    icon: '🍽️',
    vendor: 'Restaurang PM & Vänner',
    description: 'Representation — kundlunch',
    date: '2026-04-08',
    amount: -1840,
    vatRate: 12,
    hasReceipt: false,
    status: 'pending',
    synced: false,
    lines: [
      { account: '5900', accountLabel: 'Representation', debit: 1619.20, credit: null },
      { account: '2640', accountLabel: 'Ingående moms 12%', debit: 220.80, credit: null },
      { account: '1930', accountLabel: 'Företagskonto', debit: null, credit: 1840 },
    ],
    auditLog: [
      { time: '2026-04-08 20:10', text: 'Transaktion identifierad via Bank-API.' },
      { time: '2026-04-08 20:11', text: 'AI kategoriserade som Representation. Kvitto krävs enligt Skatteverket.' },
    ],
  },
];

const statusConfig = {
  booked: { icon: CheckCircle2, color: '#3DAA7A', label: 'Bokförd', bg: 'rgba(61,170,122,0.12)' },
  pending: { icon: Clock, color: '#D4AF37', label: 'Väntar', bg: 'rgba(212,175,55,0.12)' },
  error: { icon: AlertTriangle, color: '#D95F5F', label: 'Fel', bg: 'rgba(217,95,95,0.12)' },
};

export default function LedgerVault() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = LEDGER_ENTRIES.filter(e =>
    e.vendor.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const bookedCount = LEDGER_ENTRIES.filter(e => e.status === 'booked').length;
  const pendingCount = LEDGER_ENTRIES.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/BusinessDashboard">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-surface)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: '#D4AF37' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>The Ledger Vault</p>
            </div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: '#F0EAD6' }}>Bokföring & Arkiv</h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl"
          style={{ background: 'rgba(61,170,122,0.08)', border: '1px solid rgba(61,170,122,0.2)' }}>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>Bokförda</p>
          <p className="text-2xl font-black" style={{ color: '#3DAA7A' }}>{bookedCount}</p>
        </div>
        <div className="p-3 rounded-xl"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>Väntar underlag</p>
          <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{pendingCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'rgba(155,173,184,0.4)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sök verifikat, leverantör, belopp…"
            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="px-5 mb-2">
        <div className="grid grid-cols-12 px-3">
          <p className="col-span-1 text-[10px] font-bold uppercase" style={{ color: 'rgba(155,173,184,0.4)' }}></p>
          <p className="col-span-5 text-[10px] font-bold uppercase" style={{ color: 'rgba(155,173,184,0.4)' }}>Händelse</p>
          <p className="col-span-3 text-[10px] font-bold uppercase text-right" style={{ color: 'rgba(155,173,184,0.4)' }}>Belopp</p>
          <p className="col-span-3 text-[10px] font-bold uppercase text-right" style={{ color: 'rgba(155,173,184,0.4)' }}>Status</p>
        </div>
      </div>

      {/* Entries */}
      <div className="px-5 space-y-1.5">
        {filtered.map((entry, i) => {
          const s = statusConfig[entry.status];
          const StatusIcon = s.icon;
          return (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(entry)}
              className="w-full rounded-xl p-3 text-left"
              style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="grid grid-cols-12 items-center gap-1">
                <span className="col-span-1 text-lg">{entry.icon}</span>
                <div className="col-span-5 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: '#F0EAD6' }}>{entry.vendor}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] truncate" style={{ color: 'rgba(155,173,184,0.5)' }}>
                      {entry.id} · {entry.date}
                    </p>
                    {entry.synced && (
                      <span className="text-[9px] px-1 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A' }}>Fortnox</span>
                    )}
                  </div>
                </div>
                <p className="col-span-3 text-xs font-black text-right"
                  style={{ color: entry.amount < 0 ? '#D95F5F' : '#3DAA7A' }}>
                  {entry.amount < 0 ? '−' : '+'}{Math.abs(entry.amount).toLocaleString('sv-SE')} kr
                </p>
                <div className="col-span-3 flex items-center justify-end gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: s.bg }}>
                    <StatusIcon className="w-3 h-3" style={{ color: s.color }} />
                    <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm" style={{ color: 'rgba(155,173,184,0.5)' }}>Inga verifikat hittades</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <LedgerEntryDetail entry={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}