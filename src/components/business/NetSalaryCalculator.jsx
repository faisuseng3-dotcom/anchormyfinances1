import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';

// Swedish tax logic
const ENTITY_CONFIGS = {
  enskild: {
    label: 'Enskild firma',
    vatRate: 0.25,
    // Egenavgifter ~28.97% on profit, prelim skatt 30% on net after egenavgifter
    egnavgifter: 0.2897,
    prelimSkatt: 0.30,
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
      { label: 'Netto i fickan', value: exVat * (1 - cfg.arbgivaravgift - cfg.kommunalskatt), color: '#3DAA7A', bold: true },
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
      { label: 'Netto i fickan', value: net, color: '#3DAA7A', bold: true },
    ];
  }

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

      <div className="px-5 pt-4 pb-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(13,115,119,0.1)' }}>
          <Wallet className="w-4 h-4" style={{ color: '#0D7377' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Löneberäknaren</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>{cfg.label} · Vad tjänar du netto?</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#9AA5B4' }}>Fakturerat belopp</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={gross}
                onChange={e => setGross(e.target.value)}
                placeholder="20 000"
                className="w-full h-11 px-3 pr-8 rounded-2xl text-lg font-black text-right"
                style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9AA5B4' }}>kr</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#9AA5B4' }}>Moms</label>
            <select value={vatRate} onChange={e => setVatRate(e.target.value)}
              className="w-full h-11 px-2 rounded-2xl text-sm font-bold"
              style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0', color: '#1A2332' }}>
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl"
                  style={{
                    background: row.bold ? 'rgba(13,115,119,0.06)' : '#F4F6F8',
                    borderLeft: row.bold ? '3px solid #0D7377' : 'none',
                  }}>
                  <p className="text-xs" style={{ color: '#4A5568', fontWeight: row.bold ? 700 : 400 }}>
                    {row.label}
                  </p>
                  <p className={row.bold ? 'text-base font-black' : 'text-xs font-bold'}
                    style={{ color: row.bold ? '#0D7377' : row.value < 0 ? '#E53E3E' : '#1A2332' }}>
                    {row.value >= 0 ? '' : '− '}
                    {Math.abs(row.value).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
              ))}

              <div className="mt-2 pt-3 grid grid-cols-2 gap-3"
                style={{ borderTop: '1px solid #F0F2F5' }}>
                <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(13,115,119,0.06)' }}>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>Nettolön</p>
                  <p className="text-lg font-black" style={{ color: '#0D7377' }}>
                    {Math.max(0, net).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
                <div className="text-center p-3 rounded-2xl" style={{ background: '#F4F6F8' }}>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>Skatt/moms</p>
                  <p className="text-lg font-black" style={{ color: '#E53E3E' }}>
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