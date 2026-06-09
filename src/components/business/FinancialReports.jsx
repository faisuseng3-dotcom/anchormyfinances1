import React, { useState } from 'react';
import { BarChart2, Scale, Receipt, ChevronDown, ChevronUp } from 'lucide-react';

// BAS account class helpers
const accountClass = (code) => {
  const n = parseInt(code);
  if (n >= 1000 && n < 2000) return 'assets';      // Tillgångar
  if (n >= 2000 && n < 3000) return 'liabilities'; // Skulder/Eget kapital
  if (n >= 3000 && n < 4000) return 'revenue';     // Intäkter
  if (n >= 4000 && n < 9000) return 'expense';     // Kostnader
  return 'other';
};

const fmt = (n) => n.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr';

function Section({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#E8ECF0] pt-4">
      <button
        type="button"
        className="w-full flex items-center justify-between pb-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <p className="text-[15px] font-medium text-[#1A2332]">{title}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#9AA5B4]" /> : <ChevronDown className="w-4 h-4 text-[#9AA5B4]" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

export default function FinancialReports({ transactions, isReset }) {
  if (isReset || !transactions?.length) {
    return (
      <div className="py-8 text-center">
        <BarChart2 className="w-8 h-8 mx-auto mb-2 text-[#4A5568]" aria-hidden />
        <p className="text-sm font-bold" style={{ color: '#4A5568' }}>Inga bokförda transaktioner</p>
        <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>Bokför via Arkiv-fliken för att generera rapporter.</p>
      </div>
    );
  }

  // Parse note field to get accountCode and vatRate
  const parseNote = (tx) => {
    const accountMatch = tx.note?.match(/Konto:\s*(\d+)/);
    const vatMatch = tx.note?.match(/Moms:\s*(\d+)%/);
    return {
      accountCode: accountMatch?.[1] || (tx.type === 'income' ? '3000' : '6990'),
      vatRate: vatMatch ? parseInt(vatMatch[1]) : 25,
    };
  };

  // Build aggregates
  let totalRevenue = 0, totalExpense = 0;
  let totalAssets = 0, totalLiabilities = 0;
  let vatIn = 0, vatOut = 0;
  const accountGroups = {};

  transactions.forEach(tx => {
    const { accountCode, vatRate } = parseNote(tx);
    const gross = Math.abs(tx.amount || 0);
    const vat = Math.round((gross / (1 + vatRate / 100)) * (vatRate / 100) * 100) / 100;
    const net = gross - vat;
    const cls = accountClass(accountCode);
    const label = accountCode;

    if (!accountGroups[accountCode]) accountGroups[accountCode] = { code: accountCode, label, cls, total: 0 };

    if (tx.type === 'income') {
      totalRevenue += net;
      vatOut += vat;
      totalAssets += gross;
      accountGroups[accountCode].total += net;
    } else {
      totalExpense += net;
      vatIn += vat;
      accountGroups[accountCode].total += net;
    }
  });

  const netResult = totalRevenue - totalExpense;
  const vatBalance = vatIn - vatOut;

  return (
    <div className="space-y-3">
      {/* Resultaträkning */}
      <Section title="Resultaträkning" icon={BarChart2} color="#0D7377" defaultOpen>
        <div className="space-y-2">
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0F2F5' }}>
            <p className="text-sm" style={{ color: '#4A5568' }}>Intäkter (klass 3)</p>
            <p className="text-sm font-bold" style={{ color: '#0D7377' }}>{fmt(totalRevenue)}</p>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0F2F5' }}>
            <p className="text-sm" style={{ color: '#4A5568' }}>Kostnader (klass 4–8)</p>
            <p className="text-sm font-bold" style={{ color: '#E53E3E' }}>−{fmt(totalExpense)}</p>
          </div>
          <div className="flex justify-between py-2 rounded-xl px-3"
            style={{ background: netResult >= 0 ? 'rgba(13,115,119,0.08)' : 'rgba(229,62,62,0.08)' }}>
            <p className="text-sm font-black" style={{ color: '#1A2332' }}>Rörelseresultat</p>
            <p className="text-sm font-black" style={{ color: netResult >= 0 ? '#0D7377' : '#E53E3E' }}>
              {netResult >= 0 ? '' : '−'}{fmt(Math.abs(netResult))}
            </p>
          </div>
        </div>
      </Section>

      {/* Balansräkning */}
      <Section title="Balansräkning" icon={Scale} color="#4B7CF3">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: '#9AA5B4' }}>Tillgångar (klass 1)</p>
          <div className="flex justify-between py-1.5">
            <p className="text-sm" style={{ color: '#4A5568' }}>1930 Företagskonto</p>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{fmt(totalAssets)}</p>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F0F2F5' }}>
            <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: '#9AA5B4' }}>Eget kapital & skulder (klass 2)</p>
            <div className="flex justify-between py-1.5">
              <p className="text-sm" style={{ color: '#4A5568' }}>2640/2641 Ingående moms</p>
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{fmt(vatIn)}</p>
            </div>
            <div className="flex justify-between py-1.5">
              <p className="text-sm" style={{ color: '#4A5568' }}>Eget kapital (resultat)</p>
              <p className="text-sm font-bold" style={{ color: netResult >= 0 ? '#0D7377' : '#E53E3E' }}>
                {fmt(netResult)}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Momsrapport */}
      <Section title="Momsrapport" icon={Receipt} color="#D69E2E">
        <div className="space-y-2">
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0F2F5' }}>
            <p className="text-sm" style={{ color: '#4A5568' }}>Utgående moms (försäljning)</p>
            <p className="text-sm font-bold" style={{ color: '#E53E3E' }}>{fmt(vatOut)}</p>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0F2F5' }}>
            <p className="text-sm" style={{ color: '#4A5568' }}>Ingående moms (inköp)</p>
            <p className="text-sm font-bold" style={{ color: '#0D7377' }}>{fmt(vatIn)}</p>
          </div>
          <div className="flex justify-between py-2 px-3 rounded-xl"
            style={{ background: vatBalance >= 0 ? 'rgba(13,115,119,0.08)' : 'rgba(229,62,62,0.08)' }}>
            <p className="text-sm font-black" style={{ color: '#1A2332' }}>
              {vatBalance >= 0 ? 'Momsåterbäring' : 'Att betala till Skatteverket'}
            </p>
            <p className="text-sm font-black" style={{ color: vatBalance >= 0 ? '#0D7377' : '#E53E3E' }}>
              {fmt(Math.abs(vatBalance))}
            </p>
          </div>
        </div>
      </Section>

      {/* Kontoöversikt (Huvudbok summary) */}
      <Section title="Kontosaldo (Huvudbok)" icon={BarChart2} color="#9AA5B4">
        <div className="space-y-1">
          {Object.values(accountGroups).sort((a, b) => a.code.localeCompare(b.code)).map(g => (
            <div key={g.code} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #F8FAFB' }}>
              <p className="text-xs" style={{ color: '#4A5568' }}>
                <span className="font-bold" style={{ color: '#0D7377' }}>{g.code}</span>
              </p>
              <p className="text-xs font-semibold" style={{ color: '#1A2332' }}>{fmt(g.total)}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}