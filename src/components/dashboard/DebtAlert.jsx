import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function DebtAlert({ profile }) {
  const loans = profile?.loans || [];
  if (loans.length === 0) return null;

  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const monthlyInterest = loans.reduce((s, l) => s + ((l.totalAmount || 0) * ((l.interestRate || 0) / 100 / 12)), 0);

  if (totalDebt === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Skuld på radar</p>
            <p className="text-rose-300 text-xs mt-0.5 leading-relaxed">
              Din skuld på <span className="font-bold text-white">{fmt(totalDebt)} kr</span> kostar dig just nu{' '}
              <span className="font-bold text-rose-300">{fmt(monthlyInterest)} kr/mån</span> i ränta.
            </p>
          </div>
        </div>
        <Link to={createPageUrl('Loans')}>
          <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-sm font-medium transition-colors">
            Ja, hjälp mig sänka kostnaden!
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}