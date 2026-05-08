import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isAlexMode } from '@/lib/alexMode';
import DebtIntelligenceDashboard from './DebtIntelligenceDashboard';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DebtCheck({ profile }) {
  if (!profile) return null;

  // Alex Mode: always show the intelligence dashboard
  if (isAlexMode()) {
    return <DebtIntelligenceDashboard />;
  }

  const loans = profile.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const monthlyDebt = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const isDebtFree = totalDebt === 0;

  return (
    <Link to="/Loans">
      <div className="mx-4 rounded-3xl p-5"
        style={{
          background: 'rgba(8,12,22,0.95)',
          border: `1px solid ${isDebtFree ? 'rgba(15,222,189,0.18)' : 'rgba(255,68,102,0.18)'}`,
        }}>
        <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
          MIN SKULD-KOLL
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-black leading-none" style={{ fontSize: 36, color: '#fff', letterSpacing: '-0.02em' }}>
              {fmt(totalDebt)}
              <span className="text-lg font-black ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>kr</span>
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: isDebtFree ? '#0FDEBD' : 'rgba(255,68,102,0.8)' }}>
              {isDebtFree ? '🎉 Du är skuldfri!' : `${fmt(monthlyDebt)} kr/mån`}
            </p>
          </div>

          <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={isDebtFree ? 'rgba(15,222,189,0.15)' : 'rgba(255,68,102,0.15)'}
                strokeWidth="6" />
              <motion.circle
                cx="32" cy="32" r="26" fill="none"
                stroke={isDebtFree ? '#0FDEBD' : '#FF4466'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{ strokeDashoffset: isDebtFree ? 2 * Math.PI * 26 : 2 * Math.PI * 26 * 0.3 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '32px 32px',
                  filter: `drop-shadow(0 0 6px ${isDebtFree ? '#0FDEBD' : '#FF4466'})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 20 }}>{isDebtFree ? '✓' : '!'}</span>
            </div>
          </div>
        </div>

        {isDebtFree && (
          <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Inga aktiva lån registrerade. Bra jobbat!
          </p>
        )}
      </div>
    </Link>
  );
}