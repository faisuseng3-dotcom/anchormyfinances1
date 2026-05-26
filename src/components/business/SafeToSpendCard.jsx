import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calcAccountTaxBreakdown } from '@/lib/businessTaxEngine';

export default function SafeToSpendCard({ grossBalance, vatReserved, entityType = 'enskild' }) {
  const [expanded, setExpanded] = useState(false);
  const breakdown = calcAccountTaxBreakdown(grossBalance, vatReserved, entityType);
  const { yours: safeToSpend, rows, transferLabel: label } = breakdown;
  const pct = Math.round((safeToSpend / grossBalance) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0D7377 0%, #085f63 60%, #074f52 100%)',
        boxShadow: '0 16px 48px rgba(13,115,119,0.35)',
      }}
    >
      <div className="px-6 pt-7 pb-6">
        <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Ditt att röra dig med
        </p>
        <p
          className="font-black mt-1 mb-1 leading-none"
          style={{ fontSize: 52, color: '#ffffff', letterSpacing: '-2px' }}
        >
          {safeToSpend.toLocaleString('sv-SE')}
          <span className="text-2xl font-semibold ml-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            kr
          </span>
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {label}
        </p>

        <div className="flex gap-2 mt-4">
          {[
            { label: 'Ditt', amount: safeToSpend, color: 'rgba(255,255,255,0.25)' },
            { label: 'Moms', amount: vatReserved, color: 'rgba(212,175,55,0.35)' },
            { label: 'Skatt', amount: grossBalance - vatReserved - safeToSpend, color: 'rgba(217,95,95,0.35)' },
          ].map((l) => (
            <div
              key={l.label}
              className="flex-1 rounded-2xl px-3 py-2 text-center"
              style={{ background: l.color }}
            >
              <p className="text-[10px] font-semibold text-white/60">{l.label}</p>
              <p className="text-xs font-black text-white">{l.amount.toLocaleString('sv-SE')}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-4 h-1.5 rounded-full overflow-hidden flex"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <div style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
          <div
            style={{
              width: `${Math.round((vatReserved / grossBalance) * 100)}%`,
              background: 'rgba(212,175,55,0.7)',
              borderRadius: 4,
            }}
          />
          <div style={{ flex: 1, background: 'rgba(217,95,95,0.5)', borderRadius: 4 }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Visa uträkning
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" style={{ color: 'rgba(155,173,184,0.4)' }} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(155,173,184,0.4)' }} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-4 space-y-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {rows.map((row, i) => (
                <div
                  key={row.key || i}
                  className={`flex items-center justify-between pt-2 ${i < rows.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-xs" style={{ color: 'rgba(155,173,184,0.65)' }}>
                    {row.sign && row.sign !== '=' && (
                      <span style={{ color: '#D95F5F', marginRight: 4 }}>{row.sign}</span>
                    )}
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: row.highlight ? '#3DAA7A' : 'rgba(240,234,214,0.9)' }}
                  >
                    {row.amount.toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))}
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
