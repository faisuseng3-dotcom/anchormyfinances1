import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isAlexMode } from '@/lib/alexMode';
import DebtDashboardCard from './DebtDashboardCard';
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DebtCheck({ profile }) {
  if (!profile) return null;

  // Alex Mode: compact card with click-to-expand full analysis
  if (isAlexMode()) {
    return <DebtDashboardCard />;
  }

  const loans = profile.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const monthlyDebt = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const isDebtFree = totalDebt === 0;

  return (
    <Link to="/Loans">
      <div
        className="mx-4 rounded-[26px] p-5 sm:p-6"
        style={dashboardGlassSurface(
          isDebtFree
            ? { border: '1px solid rgba(120, 200, 180, 0.22)' }
            : { border: '1px solid rgba(255, 120, 130, 0.22)' }
        )}
      >
        <p className={`${dashboardSectionLabelClass} mb-4`}>
          Min skuld-koll
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold leading-none tracking-tight text-white"
              style={{ fontSize: 'clamp(1.75rem, 7vw, 2.25rem)' }}
            >
              {fmt(totalDebt)}
              <span className="text-lg font-medium ml-1 text-white/40">kr</span>
            </p>
            <p className="text-[13px] mt-2 font-medium text-white/55">
              {isDebtFree ? 'Du har inga aktiva lån registrerade' : `${fmt(monthlyDebt)} kr/mån`}
            </p>
          </div>

          <div className="relative flex items-center justify-center shrink-0" style={{ width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={isDebtFree ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="5" />
              <motion.circle
                cx="32" cy="32" r="26" fill="none"
                stroke={isDebtFree ? '#8FD4C8' : '#FF7A85'}
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{ strokeDashoffset: isDebtFree ? 2 * Math.PI * 26 : 2 * Math.PI * 26 * 0.3 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '32px 32px',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg">
              {isDebtFree ? '✓' : '!'}
            </div>
          </div>
        </div>

        {isDebtFree && (
          <p className="text-[11px] mt-4 text-white/40">
            Bra jobbat — du kan lägga till lån när som helst under Lån.
          </p>
        )}
      </div>
    </Link>
  );
}