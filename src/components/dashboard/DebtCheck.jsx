import React from 'react';
import { motion } from 'framer-motion';
import { isAlexMode } from '@/lib/alexMode';
import DebtDashboardCard from './DebtDashboardCard';
import { DashboardDivider, DashboardListRow, DashboardSection } from './DashboardChrome';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DebtCheck({ profile }) {
  if (!profile) return null;

  if (isAlexMode()) {
    return <DebtDashboardCard />;
  }

  const loans = profile.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const monthlyDebt = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const isDebtFree = totalDebt === 0;

  return (
    <DashboardSection title="Skuld">
      <DashboardListRow
          href="/Loans"
          leading={
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: isDebtFree ? 'rgba(143,212,200,0.15)' : 'rgba(255,122,133,0.12)',
                color: isDebtFree ? '#8FD4C8' : '#FF9AA5',
              }}
            >
              {isDebtFree ? '✓' : '!'}
            </div>
          }
          title={isDebtFree ? 'Inga registrerade lån' : 'Total skuld'}
          subtitle={isDebtFree ? 'Lägg till under Lån vid behov' : `${fmt(monthlyDebt)} kr per månad`}
          trailing={`${fmt(totalDebt)} kr`}
        />
      {!isDebtFree && (
        <>
          <DashboardDivider className="my-1" />
          <div className="py-2">
            <div className="relative h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7A85] to-[#FF9AA5]"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </>
      )}
    </DashboardSection>
  );
}
