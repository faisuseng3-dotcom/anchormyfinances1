import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import LiquidityTooltip from '@/components/business/LiquidityTooltip';

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
    <div className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

      <button onClick={() => setExpanded(v => !v)} className="w-full px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: expanded ? '1px solid #F0F2F5' : 'none' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <Shield className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <div className="text-left">
            <LiquidityTooltip />
            <p className="text-xs" style={{ color: '#9AA5B4' }}>
              {spendable.toLocaleString('sv-SE')} kr disponibelt
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4" style={{ color: '#9AA5B4' }} />
          : <ChevronDown className="w-4 h-4" style={{ color: '#9AA5B4' }} />}
      </button>

      {/* Stacked bar */}
      <div className="px-5 py-3">
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
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
        <div className="flex justify-between mt-2">
          {layers.map((l, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: '#9AA5B4' }}>{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 space-y-2">
          {layers.map((l, i) => (
            <div key={i} className="p-3 rounded-2xl flex items-center justify-between"
              style={{ background: '#F4F6F8' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>{l.label}</p>
              </div>
              <p className="text-sm font-black" style={{ color: '#1A2332' }}>
                {l.amount.toLocaleString('sv-SE')} kr
              </p>
            </div>
          ))}
          <p className="text-xs text-center pt-1" style={{ color: '#9AA5B4' }}>
            Uppskattning baserad på {cfg.label}
          </p>
        </div>
      )}
    </div>
  );
}