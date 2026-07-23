import React from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function ProToolsHero({ profile }) {
  const income = profile?.income || 0;
  const margin = income > 0 ? getMonthlyMargin(profile) : 0;
  const fixed = getTotalFixedCosts(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl organic-surface overflow-hidden mb-6"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="p-5 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-accent-soft)', boxShadow: 'var(--anchor-shadow-1)' }}
        >
          <Calculator className="w-5 h-5 text-[var(--copilot-accent-blue)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-muted)]">
            Verktyg
          </p>
          <p className="text-[17px] font-bold text-white mt-1 leading-snug">
            Räkna och simulera utifrån din profil
          </p>
          {income > 0 ? (
            <div className="flex gap-6 mt-4 pt-3 border-t ">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Marginal</p>
                <p className="text-[18px] font-bold text-[var(--copilot-accent-green)] tabular-nums">
                  {fmt(margin)} kr
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Fasta</p>
                <p className="text-[18px] font-bold text-white tabular-nums">
                  {fmt(fixed)} kr
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-3">
              Fyll i inkomst under Inställningar för belopp i kronor.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
