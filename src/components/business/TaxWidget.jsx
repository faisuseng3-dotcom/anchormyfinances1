import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Wallet } from 'lucide-react';

const TAX_RATE = 0.30;
const VAT_RATE = 0.25;

export default function TaxWidget() {
  const [raw, setRaw] = useState('');

  const amount = parseFloat(raw.replace(/\s/g, '').replace(',', '.')) || 0;
  const vatAmount = amount * VAT_RATE;
  const exVat = amount; // amount is ex-VAT (income)
  const tax = exVat * TAX_RATE;
  const netSalary = exVat - tax;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(75,124,243,0.2)', border: '1px solid rgba(75,124,243,0.3)' }}>
          <Calculator className="w-3.5 h-3.5" style={{ color: '#4B7CF3' }} />
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color: '#4B7CF3' }}>SKATTEKALKYLATOR</p>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Vad har du tjänat idag?</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="0"
            className="w-full h-14 px-4 pr-12 rounded-xl text-2xl font-black text-right"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F0EAD6',
            }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: 'rgba(155,173,184,0.5)' }}>kr</span>
        </div>

        <AnimatePresence>
          {amount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {[
                { label: 'Fakturerat (ex moms)', value: amount, color: '#F0EAD6', bg: 'rgba(255,255,255,0.05)' },
                { label: `Moms att redovisa (25%)`, value: vatAmount, color: '#D4AF37', bg: 'rgba(212,175,55,0.08)', prefix: '+' },
                { label: 'Preliminär skatt (30%)', value: tax, color: '#D95F5F', bg: 'rgba(217,95,95,0.08)', prefix: '−' },
                { label: 'Netto i fickan', value: netSalary, color: '#3DAA7A', bg: 'rgba(61,170,122,0.1)', bold: true, Icon: Wallet },
              ].map(row => (
                <div key={row.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: row.bg }}>
                  <p className="text-xs inline-flex items-center gap-1.5" style={{ color: 'rgba(155,173,184,0.7)', fontWeight: row.bold ? 700 : 400 }}>
                    {row.Icon && <row.Icon className="w-3.5 h-3.5" style={{ color: row.color }} aria-hidden />}
                    {row.label}
                  </p>
                  <p className={`text-sm ${row.bold ? 'font-black' : 'font-bold'}`} style={{ color: row.color }}>
                    {row.prefix || ''}{row.value.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}