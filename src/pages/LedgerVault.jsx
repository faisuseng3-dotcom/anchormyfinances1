import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Search, BookOpen, Download } from 'lucide-react';
import LedgerEntryDetail from '@/components/business/LedgerEntryDetail';
import { base44 } from '@/api/base44Client';

// Convert a Transaction entity record into a ledger entry format
const toEntry = (tx, idx) => {
  const noteMatch = tx.note?.match(/Konto:\s*(\d+)\s*—\s*(.+?)(?:\.|$)/);
  const vatMatch = tx.note?.match(/Moms:\s*(\d+)%/);
  const accountCode = noteMatch?.[1] || (tx.type === 'income' ? '3000' : '6990');
  const accountName = noteMatch?.[2]?.trim() || (tx.type === 'income' ? 'Försäljning' : 'Diverse kostnader');
  const vatRate = vatMatch ? parseInt(vatMatch[1]) : 25;
  const gross = Math.abs(tx.amount || 0);
  const vat = Math.round((gross / (1 + vatRate / 100)) * (vatRate / 100) * 100) / 100;
  const net = parseFloat((gross - vat).toFixed(2));
  const vatAccount = vatRate === 25 ? '2641' : vatRate === 12 ? '2640' : vatRate === 6 ? '2645' : null;
  const isIncome = tx.type === 'income';
  const verNum = String(idx + 1).padStart(4, '0');

  const lines = isIncome
    ? [
        { account: '1930', accountLabel: 'Företagskonto', debit: gross, credit: null },
        { account: accountCode, accountLabel: accountName, debit: null, credit: net },
        ...(vat > 0 && vatAccount ? [{ account: '2610', accountLabel: 'Utgående moms', debit: null, credit: vat }] : []),
      ]
    : [
        { account: accountCode, accountLabel: accountName, debit: net, credit: null },
        ...(vat > 0 && vatAccount ? [{ account: vatAccount, accountLabel: `Ingående moms ${vatRate}%`, debit: vat, credit: null }] : []),
        { account: '1930', accountLabel: 'Företagskonto', debit: null, credit: gross },
      ];

  return {
    id: `V-${verNum}`,
    icon: isIncome ? '💰' : '🧾',
    vendor: tx.vendor || tx.label,
    description: tx.label,
    date: tx.created_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    amount: tx.amount,
    vatRate,
    hasReceipt: false,
    status: 'booked',
    synced: false,
    aiAgent: tx.aiAgent,
    lines,
    auditLog: [
      { time: tx.created_date?.slice(0, 16)?.replace('T', ' ') || '', text: `Bokförd via ${tx.aiAgent || 'Manuell'}. ${tx.aiNote || ''}` },
    ],
  };
};

const statusConfig = {
  booked: { icon: CheckCircle2, color: '#3DAA7A', label: 'Bokförd', bg: 'rgba(61,170,122,0.12)' },
  pending: { icon: Clock, color: '#D4AF37', label: 'Väntar', bg: 'rgba(212,175,55,0.12)' },
  error: { icon: AlertTriangle, color: '#D95F5F', label: 'Fel', bg: 'rgba(217,95,95,0.12)' },
};

const exportSIE = (ents) => {
  const now = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const companyName = localStorage.getItem('anchor_biz_company') || 'Mitt Företag AB';
  let sie = `#FLAGGA 0\n#PROGRAM "Anchor Business" 2.0\n#GEN ${now}\n#FNAMN "${companyName}"\n#RAR 0 ${now.slice(0,4)}0101 ${now.slice(0,4)}1231\n\n`;
  ents.forEach(e => {
    const verNr = e.id.replace(/\D/g, '') || '1';
    sie += `#VER "A" ${verNr} ${(e.date || '').replace(/-/g,'')} "${e.description || e.vendor}"\n{\n`;
    (e.lines || []).forEach(l => {
      const amt = l.debit != null ? l.debit.toFixed(2) : (-(l.credit || 0)).toFixed(2);
      sie += `  #TRANS ${l.account} {} ${amt}\n`;
    });
    sie += `}\n`;
  });
  const blob = new Blob([sie], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `anchor_sie_${now}.se`; a.click();
  URL.revokeObjectURL(url);
};

const exportCSV = (ents) => {
  const rows = ['Verifikat,Datum,Leverantör,Beskrivning,Belopp,Moms%,Status'];
  ents.forEach(e => {
    rows.push(`${e.id},${e.date},"${e.vendor}","${e.description}",${e.amount},${e.vatRate || 0},${e.status}`);
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `anchor_ledger_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export default function LedgerVault() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [entries, setEntries] = useState([]);
  const isReset = localStorage.getItem('anchor_biz_reset') === 'true';

  useEffect(() => {
    if (isReset) { setEntries([]); return; }
    base44.entities.Transaction.list('-created_date', 100).then(txs => {
      setEntries((txs || []).filter(t => t.aiAgent).map((t, i) => toEntry(t, i)));
    }).catch(() => setEntries([]));
  }, [isReset]);

  // Reset sync
  useEffect(() => {
    const handler = () => setEntries([]);
    window.addEventListener('anchor:biz_reset', handler);
    return () => window.removeEventListener('anchor:biz_reset', handler);
  }, []);

  const sourceEntries = entries;

  const filtered = sourceEntries.filter(e =>
    e.vendor.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const bookedCount = sourceEntries.filter(e => e.status === 'booked').length;
  const pendingCount = sourceEntries.filter(e => e.status === 'pending').length;

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
        <div className="flex gap-2">
          <button onClick={() => exportCSV(sourceEntries)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold"
            style={{ background: 'rgba(75,124,243,0.12)', color: '#4B7CF3', border: '1px solid rgba(75,124,243,0.3)' }}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => exportSIE(sourceEntries)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold"
            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Download className="w-3.5 h-3.5" /> SIE
          </button>
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
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-base font-bold mb-1" style={{ color: 'rgba(155,173,184,0.7)' }}>
              {isReset ? 'Inga verifikat än' : 'Inga verifikat hittades'}
            </p>
            {isReset && (
              <p className="text-sm" style={{ color: 'rgba(155,173,184,0.4)' }}>
                Bokför transaktioner via Arkiv-fliken för att se dem här.
              </p>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <LedgerEntryDetail entry={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}