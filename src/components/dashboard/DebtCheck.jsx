import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { PuzzleIcon, ChevronRight } from 'lucide-react';
import { isAlexMode } from '@/lib/alexMode';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// Incomplete loan = registered but missing rate or monthlyPayment
function isIncompleteLoan(loan) {
  return !loan.interestRate || !loan.monthlyPayment;
}

export default function DebtCheck({ profile }) {
  const navigate = useNavigate();
  if (!profile) return null;

  const alexActive = isAlexMode();
  const loans = profile.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const monthlyDebt = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const isDebtFree = totalDebt === 0;
  const hasIncomplete = loans.some(isIncompleteLoan);

  // In Alex Mode: show incomplete CSN empty-state
  if (alexActive && (isDebtFree || hasIncomplete)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 rounded-3xl p-5"
        style={{
          background: 'rgba(8,12,22,0.95)',
          border: '1px solid rgba(233,168,37,0.25)',
        }}
      >
        <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
          SKULD-KOLL
        </p>

        {/* Puzzle illustration */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(233,168,37,0.12)', border: '1px solid rgba(233,168,37,0.25)' }}>
            <PuzzleIcon className="w-6 h-6" style={{ color: '#E9A825' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black leading-snug mb-1" style={{ color: '#fff' }}>
              Alex, vi ser din skuld men behöver din hjälp att analysera den.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Du har en registrerad skuld på <strong style={{ color: '#E9A825' }}>180 000 kr</strong> med en månadskostnad på <strong style={{ color: '#E9A825' }}>850 kr</strong>, men för att bygga din Framtids-tidsmaskin saknar vi ränta och återbetalningstid.
            </p>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/Settings?prefill=csn')}
          className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(233,168,37,0.15), rgba(233,168,37,0.08))',
            border: '1px solid rgba(233,168,37,0.35)',
          }}
        >
          <span className="text-sm font-black" style={{ color: '#E9A825' }}>
            🔑 Slutför registrering av lån
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: '#E9A825' }} />
        </motion.button>
      </motion.div>
    );
  }

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