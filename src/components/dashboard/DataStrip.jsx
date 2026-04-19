import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DataStrip({ profile }) {
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const loans = (profile.loans || []).reduce((s, l) => s + (l.totalAmount || 0), 0);
  const loanMonthly = (profile.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const marginPct = profile.income > 0 ? Math.round((monthlyMargin / profile.income) * 100) : 0;
  const debtRatio = profile.income > 0 ? Math.min(100, Math.round((loanMonthly / profile.income) * 100)) : 0;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(10,12,22,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Scanner sweep animation */}
      <div className="relative overflow-hidden h-1">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-1/3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(15,222,189,0.6), transparent)' }}
        />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          SCANNER — MARGINALA &amp; LÅN
        </p>

        {/* Marginal row */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] font-black tracking-wider" style={{ color: '#0FDEBD' }}>MARGINAL</span>
            <span className="text-base font-black" style={{ color: '#fff' }}>{fmt(monthlyMargin)} kr</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${marginPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0D7377, #0FDEBD)',
                boxShadow: '0 0 8px rgba(15,222,189,0.5)',
              }}
            />
          </div>
          <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {marginPct}% av inkomsten
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

        {/* Debt row */}
        <Link to="/Loans">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[10px] font-black tracking-wider" style={{ color: '#FF4466' }}>SKULDER</span>
              <span className="text-base font-black" style={{ color: '#fff' }}>{fmt(loans)} kr</span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${debtRatio}%` }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #8B0000, #FF4466)',
                  boxShadow: '0 0 8px rgba(255,68,102,0.5)',
                }}
              />
            </div>
            <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {fmt(loanMonthly)} kr/mån · {debtRatio}% av inkomst
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}