import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

// Swedish tax rates by entity type
const TAX_RATES = {
  enskild: {
    label: 'Enskild firma',
    egenavgifter: 0.2897,
    prelimSkatt: 0.20,
    totalRate: 0.4897, // combined reserve rate on profit
    vatRate: 0.20, // of total VAT-exclusive income
  },
  ab: {
    label: 'Aktiebolag',
    bolagsskatt: 0.206,
    arbgivaravgift: 0.3142,
    totalRate: 0.35,
    vatRate: 0.20,
  },
};

export default function LiquidityGauge({ totalBalance, vatReserved, grossIncome, entityType = 'enskild' }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TAX_RATES[entityType] || TAX_RATES.enskild;

  // Tax reserve: estimated on net income (gross - vat)
  const netIncome = grossIncome - vatReserved;
  const taxReserve = Math.round(netIncome * cfg.totalRate * 0.4); // conservative ~40% of total tax
  const spendable = totalBalance - vatReserved - taxReserve;

  const layers = [
    {
      label: 'Disponibelt — dina pengar',
      amount: spendable,
      color: '#3DAA7A',
      bg: 'rgba(61,170,122,0.15)',
      border: 'rgba(61,170,122,0.3)',
      pct: Math.round((spendable / totalBalance) * 100),
      desc: 'Fritt kapital att använda för verksamheten eller löneuttag',
    },
    {
      label: 'Moms att redovisa',
      amount: vatReserved,
      color: '#D4AF37',
      bg: 'rgba(212,175,55,0.12)',
      border: 'rgba(212,175,55,0.3)',
      pct: Math.round((vatReserved / totalBalance) * 100),
      desc: 'Ägs av staten. Betalas vid momsdeklarationen.',
    },
    {
      label: `Prelim. ${cfg.label === 'Aktiebolag' ? 'bolagsskatt' : 'F-skatt + egenavgifter'}`,
      amount: taxReserve,
      color: '#D95F5F',
      bg: 'rgba(217,95,95,0.12)',
      border: 'rgba(217,95,95,0.3)',
      pct: Math.round((taxReserve / totalBalance) * 100),
      desc: cfg.label === 'Aktiebolag'
        ? `Bolagsskatt 20.6% + arbetsgivaravgifter (uppskattning)`
        : `Egenavgifter 28.97% + prelim. F-skatt 20% (uppskattning)`,
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <button onClick={() => setExpanded(v => !v)} className="w-full px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(61,170,122,0.2)', border: '1px solid rgba(61,170,122,0.3)' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>LIKVIDITETSSKIKTEN</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>
              {spendable.toLocaleString('sv-SE')} kr disponibelt av {totalBalance.toLocaleString('sv-SE')} kr totalt
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)' }} />
          : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)' }} />}
      </button>

      {/* Stacked bar — always visible */}
      <div className="px-4 py-3">
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {layers.map((l, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${l.pct}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
              style={{ background: l.color, minWidth: 4 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {layers.map((l, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px]" style={{ color: 'rgba(155,173,184,0.5)' }}>{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {layers.map((l, i) => (
            <div key={i} className="p-3 rounded-xl"
              style={{ background: l.bg, border: `1px solid ${l.border}` }}>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-bold" style={{ color: l.color }}>{l.label}</p>
                <p className="text-sm font-black" style={{ color: l.color }}>
                  {l.amount.toLocaleString('sv-SE')} kr
                </p>
              </div>
              <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.55)' }}>{l.desc}</p>
            </div>
          ))}

          <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-center" style={{ color: 'rgba(155,173,184,0.35)' }}>
              Skatteuppskattning baseras på {cfg.label}. Rådfråga revisor för exakta siffror.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}