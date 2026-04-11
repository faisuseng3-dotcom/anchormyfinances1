import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';

// Swedish tax logic
const ENTITY_CONFIGS = {
  enskild: {
    label: 'Enskild firma',
    vatRate: 0.25,
    // Egenavgifter ~28.97% on profit, prelim skatt ~20% on net
    egnavgifter: 0.2897,
    prelimSkatt: 0.20,
    note: 'Egenavgifter + prelim. F-skatt',
  },
  ab: {
    label: 'Aktiebolag',
    vatRate: 0.25,
    // Bolagsskatt 20.6%, then salary deducted from gross
    bolagsskatt: 0.206,
    arbgivaravgift: 0.3142,
    kommunalskatt: 0.32,
    note: 'Arbetsgivaravgift + kommunalskatt',
  },
};

export default function NetSalaryCalculator({ entityType = 'enskild' }) {
  const [gross, setGross] = useState('');
  const [vatRate, setVatRate] = useState('25');

  const cfg = ENTITY_CONFIGS[entityType] || ENTITY_CONFIGS.enskild;
  const grossNum = parseFloat(gross.replace(/\s/g, '').replace(',', '.')) || 0;
  const vr = parseInt(vatRate) / 100;

  let exVat = grossNum / (1 + vr);
  let vatAmt = grossNum - exVat;
  let net = 0;
  let taxReserve = 0;
  let rows = [];

  if (entityType === 'ab') {
    const bruttoSalary = exVat; // treat as salary basis
    const arbAvg = bruttoSalary * cfg.arbgivaravgift;
    const skatteUnderlag = bruttoSalary - arbAvg * 0; // simplified
    const kommunal = bruttoSalary * cfg.kommunalskatt;
    net = bruttoSalary - kommunal;
    taxReserve = vatAmt + arbAvg + kommunal;
    rows = [
      { label: 'Fakturerat (inkl moms)', value: grossNum, color: '#F0EAD6' },
      { label: `Moms ${vatRate}% → redovisa`, value: -vatAmt, color: '#D4AF37' },
      { label: 'Ex. moms (intäkt AB)', value: exVat, color: '#F0EAD6', sub: true },
      { label: `Arbetsgivaravgift (31.42%)`, value: -(exVat * cfg.arbgivaravgift), color: '#D95F5F' },
      { label: `Kommunalskatt (32%)`, value: -(exVat * cfg.kommunalskatt), color: '#D95F5F' },
      { label: '💰 Netto i fickan', value: exVat * (1 - cfg.arbgivaravgift - cfg.kommunalskatt), color: '#3DAA7A', bold: true },
    ];
    net = exVat * (1 - cfg.arbgivaravgift - cfg.kommunalskatt);
    taxReserve = vatAmt + exVat * (cfg.arbgivaravgift + cfg.kommunalskatt);
  } else {
    const egenavg = exVat * cfg.egnavgifter;
    const prelim = (exVat - egenavg) * cfg.prelimSkatt;
    net = exVat - egenavg - prelim;
    taxReserve = vatAmt + egenavg + prelim;
    rows = [
      { label: 'Fakturerat (inkl moms)', value: grossNum, color: '#F0EAD6' },
      { label: `Moms ${vatRate}% → redovisa`, value: -vatAmt, color: '#D4AF37' },
      { label: 'Ex. moms (intäkt)', value: exVat, color: '#F0EAD6', sub: true },
      { label: 'Egenavgifter (28.97%)', value: -egenavg, color: '#D95F5F' },
      { label: 'Prelim. F-skatt (~20%)', value: -prelim, color: '#D95F5F' },
      { label: '💰 Netto i fickan', value: net, color: '#3DAA7A', bold: true },
    ];
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="px-4 pt-4 pb-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(61,170,122,0.2)', border: '1px solid rgba(61,170,122,0.3)' }}>
          <Wallet className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} />
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>LÖNEBERÄKNAREN</p>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>{cfg.label} · Vad tjänar du netto?</p>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
              style={{ color: 'rgba(155,173,184,0.45)' }}>Fakturerat belopp</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={gross}
                onChange={e => setGross(e.target.value)}
                placeholder="20 000"
                className="w-full h-12 px-3 pr-8 rounded-xl text-xl font-black text-right"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                style={{ color: 'rgba(155,173,184,0.4)' }}>kr</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
              style={{ color: 'rgba(155,173,184,0.45)' }}>Moms</label>
            <select value={vatRate} onChange={e => setVatRate(e.target.value)}
              className="w-full h-12 px-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}>
              <option value="25">25%</option>
              <option value="12">12%</option>
              <option value="6">6%</option>
              <option value="0">0%</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {grossNum > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              {rows.map((row, i) => (
                <div key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{
                    background: row.bold ? 'rgba(61,170,122,0.1)' : row.sub ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                    borderLeft: row.bold ? '3px solid #3DAA7A' : 'none',
                  }}>
                  <p className="text-xs" style={{ color: 'rgba(155,173,184,0.65)', fontWeight: row.bold ? 700 : 400 }}>
                    {row.label}
                  </p>
                  <p className={row.bold ? 'text-base font-black' : 'text-xs font-bold'} style={{ color: row.color }}>
                    {row.value >= 0 ? '' : '− '}
                    {Math.abs(row.value).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
              ))}

              {/* Summary bar */}
              <div className="mt-3 pt-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.45)' }}>Tillgänglig nettolön</p>
                  <p className="text-lg font-black" style={{ color: '#3DAA7A' }}>
                    {Math.max(0, net).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
                <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.45)' }}>Reserverat skatt/moms</p>
                  <p className="text-lg font-black" style={{ color: '#D95F5F' }}>
                    {taxReserve.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}