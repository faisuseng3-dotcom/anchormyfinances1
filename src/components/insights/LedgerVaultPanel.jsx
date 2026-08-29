import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Search, Download } from 'lucide-react';
import LedgerEntryDetail from '@/components/business/LedgerEntryDetail';
import { base44 } from '@/api/base44Client';

const toEntry = (tx, idx) => {
  const noteMatch = tx.note?.match(/Konto:\s*(\d+)\s*—\s*(.+?)(?:\.|$)/);
  const vatMatch = tx.note?.match(/Moms:\s*(\d+)%/);
  const accountCode = noteMatch?.[1] || (tx.type === 'income' ? '3000' : '6990');
  const accountName = noteMatch?.[2]?.trim() || (tx.type === 'income' ? 'Försäljning' : 'Diverse kostnader');
  const vatRate = vatMatch ? parseInt(vatMatch[1], 10) : 25;
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
    iconKey: isIncome ? 'income' : 'receipt',
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
  booked: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Bokförd', bg: 'var(--color-success-soft)' },
  pending: { icon: Clock, color: 'var(--color-warning)', label: 'Väntar', bg: 'var(--color-warning-soft)' },
  error: { icon: AlertTriangle, color: 'var(--color-danger)', label: 'Fel', bg: 'var(--color-danger-soft)' },
};

function exportCSV(ents) {
  const rows = [['ID', 'Datum', 'Leverantör', 'Belopp', 'Status']];
  ents.forEach((e) => rows.push([e.id, e.date, e.vendor, e.amount, e.status]));
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anchor_verifikat_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Företagsverifikat — inbäddad i Historik (business). */
export default function LedgerVaultPanel() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [entries, setEntries] = useState([]);
  const isReset = localStorage.getItem('anchor_biz_reset') === 'true';

  useEffect(() => {
    if (isReset) {
      setEntries([]);
      return;
    }
    base44.entities.Transaction.filter({ context: 'BUSINESS' }, '-created_date', 200)
      .then((txs) => setEntries((txs || []).map((t, i) => toEntry(t, i))))
      .catch(() => setEntries([]));
  }, [isReset]);

  useEffect(() => {
    const handler = () => setEntries([]);
    window.addEventListener('anchor:biz_reset', handler);
    return () => window.removeEventListener('anchor:biz_reset', handler);
  }, []);

  const filtered = entries.filter((e) =>
    e.vendor.toLowerCase().includes(search.toLowerCase())
    || e.description.toLowerCase().includes(search.toLowerCase())
    || e.id.toLowerCase().includes(search.toLowerCase()),
  );

  const bookedCount = entries.filter((e) => e.status === 'booked').length;
  const pendingCount = entries.filter((e) => e.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--color-text-muted)]">Företagets bokföringsunderlag</p>
        <button
          type="button"
          onClick={() => exportCSV(entries)}
          className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold bg-[rgba(37,99,235,0.12)] text-[var(--color-accent)] border border-[rgba(37,99,235,0.3)]"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <p className="text-[11px] text-[var(--color-text-muted)]">Bokförda</p>
          <p className="text-2xl font-black text-emerald-400">{bookedCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <p className="text-[11px] text-[var(--color-text-muted)]">Väntar underlag</p>
          <p className="text-2xl font-black text-amber-300">{pendingCount}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök verifikat, leverantör…"
          className="w-full h-11 pl-10 pr-4 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      <div className="space-y-1.5">
        {filtered.map((entry, i) => {
          const s = statusConfig[entry.status];
          const StatusIcon = s.icon;
          return (
            <motion.button
              key={entry.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(entry)}
              className="w-full rounded-xl p-3 text-left bg-white border border-[var(--color-border)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-[var(--color-text-primary)]">{entry.vendor}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{entry.id} · {entry.date}</p>
                </div>
                <p className={`text-xs font-black tabular-nums ${entry.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {entry.amount < 0 ? '−' : '+'}{Math.abs(entry.amount).toLocaleString('sv-SE')} kr
                </p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: s.bg }}>
                  <StatusIcon className="w-3 h-3" style={{ color: s.color }} />
                </div>
              </div>
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-[14px] text-[var(--color-text-muted)] py-12">
            {isReset ? 'Inga verifikat än — bokför via företagsarkivet.' : 'Inga verifikat hittades.'}
          </p>
        )}
      </div>

      <AnimatePresence>
        {selected && <LedgerEntryDetail entry={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
