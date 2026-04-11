import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingDown, Wallet } from 'lucide-react';

// Swedish tax calculation per entity type
function calcBreakdown(grossBalance, vatReserved, entityType) {
  const net = grossBalance - vatReserved;

  if (entityType === 'ab') {
    // Aktiebolag: bolagsskatt 20.6% + arbetsgivaravgift 31.42% on salary
    // Simplified: reserve ~35% of net for taxes
    const bolagsskatt = Math.round(net * 0.206);
    const arbgivaravgift = Math.round(net * 0.12); // on potential salary portion
    const totalTax = bolagsskatt + arbgivaravgift;
    const safeToSpend = Math.max(0, net - totalTax);
    return {
      rows: [
        { label: 'Totalt på banken', amount: grossBalance, color: '#F0EAD6', sign: '' },
        { label: 'Moms-sköld (tillhör staten)', amount: vatReserved, color: '#D4AF37', sign: '−' },
        { label: 'Bolagsskatt 20.6% (reservat)', amount: bolagsskatt, color: '#D95F5F', sign: '−' },
        { label: 'Arbetsgivaravgifter (reservat)', amount: arbgivaravgift, color: '#D95F5F', sign: '−' },
      ],
      safeToSpend,
      label: 'Utdelning / lön tillgänglig',
    };
  } else {
    // Enskild firma: egenavgifter 28.97% + inkomstskatt ~30% on profit
    const egenavgifter = Math.round(net * 0.2897);
    const prelimSkatt = Math.round((net - egenavgifter) * 0.30);
    const totalTax = egenavgifter + prelimSkatt;
    const safeToSpend = Math.max(0, net - totalTax);
    return {
      rows: [
        { label: 'Totalt på banken', amount: grossBalance, color: '#F0EAD6', sign: '' },
        { label: 'Moms-sköld (tillhör staten)', amount: vatReserved, color: '#D4AF37', sign: '−' },
        { label: 'Egenavgifter 28.97%', amount: egenavgifter, color: '#D95F5F', sign: '−' },
        { label: 'Prelim. F-skatt ~30%', amount: prelimSkatt, color: '#D95F5F', sign: '−' },
      ],
      safeToSpend,
      label: 'Nettolön — säkert att föra över',
    };
  }
}

export default function SafeToSpendCard({ grossBalance, vatReserved, entityType = 'enskild' }) {
  const [expanded, setExpanded] = useState(false);
  const breakdown = calcBreakdown(grossBalance, vatReserved, entityType);
  const { safeToSpend, rows, label } = breakdown;
  const pct = Math.round((safeToSpend / grossBalance) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        border: '1.5px solid rgba(61,170,122,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Main balance */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(61,170,122,0.2)' }}>
              <Wallet className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3DAA7A' }}>
              Safe to Spend
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A', border: '1px solid rgba(61,170,122,0.3)' }}>
            {pct}% av saldo
          </span>
        </div>

        <p className="text-4xl font-black mt-2 mb-0.5" style={{ color: '#3DAA7A' }}>
          {safeToSpend.toLocaleString('sv-SE')}
          <span className="text-xl font-normal ml-2" style={{ color: '#9BADB8' }}>kr</span>
        </p>
        <p className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>{label}</p>

        {/* Mini bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden flex gap-0.5"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ width: `${pct}%`, background: '#3DAA7A', borderRadius: 4 }} />
          <div style={{ width: `${Math.round((vatReserved / grossBalance) * 100)}%`, background: '#D4AF37', borderRadius: 4 }} />
          <div style={{ flex: 1, background: '#D95F5F', borderRadius: 4 }} />
        </div>
        <div className="flex gap-4 mt-1.5">
          {[
            { label: 'Ditt', color: '#3DAA7A' },
            { label: 'Moms', color: '#D4AF37' },
            { label: 'Skatt', color: '#D95F5F' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px]" style={{ color: 'rgba(155,173,184,0.5)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable breakdown */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'rgba(155,173,184,0.5)' }}>
          Visa uträkning
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'rgba(155,173,184,0.4)' }} />
          : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(155,173,184,0.4)' }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {rows.map((row, i) => (
                <div key={i} className={`flex items-center justify-between pt-2 ${i < rows.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xs" style={{ color: 'rgba(155,173,184,0.65)' }}>
                    {row.sign && <span style={{ color: '#D95F5F', marginRight: 4 }}>{row.sign}</span>}
                    {row.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: row.color }}>
                    {row.amount.toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))}
              {/* Result line */}
              <div className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'rgba(61,170,122,0.3)' }}>
                <span className="text-xs font-black" style={{ color: '#3DAA7A' }}>= {label}</span>
                <span className="text-base font-black" style={{ color: '#3DAA7A' }}>
                  {safeToSpend.toLocaleString('sv-SE')} kr
                </span>
              </div>
              <p className="text-[10px] pt-1" style={{ color: 'rgba(155,173,184,0.3)' }}>
                Uppskattning. Exakta siffror beror på din totala inkomst och avdrag.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}