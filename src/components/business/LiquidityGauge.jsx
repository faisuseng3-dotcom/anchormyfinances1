import React, { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import LiquidityTooltip from '@/components/business/LiquidityTooltip';
import { BusinessDivider } from '@/components/business/BusinessChrome';

const TAX_RATES = {
  enskild: {
    label: 'Enskild firma',
    egenavgifter: 0.2897,
    prelimSkatt: 0.2,
    totalRate: 0.4897,
    vatRate: 0.2,
  },
  ab: {
    label: 'Aktiebolag',
    bolagsskatt: 0.206,
    arbgivaravgift: 0.3142,
    totalRate: 0.35,
    vatRate: 0.2,
  },
};

export default function LiquidityGauge({ totalBalance, vatReserved, grossIncome, entityType = 'enskild' }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TAX_RATES[entityType] || TAX_RATES.enskild;

  const netIncome = grossIncome - vatReserved;
  const taxReserve = Math.round(netIncome * cfg.totalRate * 0.4);
  const spendable = totalBalance - vatReserved - taxReserve;

  const layers = [
    {
      label: 'Disponibelt — dina pengar',
      amount: spendable,
      color: '#3DAA7A',
      pct: Math.round((spendable / totalBalance) * 100),
    },
    {
      label: 'Moms att redovisa',
      amount: vatReserved,
      color: '#D4AF37',
      pct: Math.round((vatReserved / totalBalance) * 100),
    },
    {
      label: `Prelim. ${cfg.label === 'Aktiebolag' ? 'bolagsskatt' : 'F-skatt + egenavgifter'}`,
      amount: taxReserve,
      color: '#D95F5F',
      pct: Math.round((taxReserve / totalBalance) * 100),
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0D7377]/10">
          <Shield className="w-4 h-4 text-[#0D7377]" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <LiquidityTooltip />
          <p className="text-[13px] text-[#9AA5B4] tabular-nums">{spendable.toLocaleString('sv-SE')} kr disponibelt</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#9AA5B4]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#9AA5B4]" />
        )}
      </button>

      <div className="pt-2 pb-1">
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
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
              <span className="text-[12px] text-[#9AA5B4]">{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="pt-2 pb-1">
          {layers.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <BusinessDivider />}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <p className="text-[13px] text-[#4A5568] truncate">{l.label}</p>
                </div>
                <p className="text-[15px] font-semibold text-[#1A2332] tabular-nums flex-shrink-0 ml-2">
                  {l.amount.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </Fragment>
          ))}
          <p className="text-[12px] text-center pt-2 text-[#9AA5B4]">Uppskattning baserad på {cfg.label}</p>
        </div>
      )}
    </div>
  );
}
