import React from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { anchorDisplayClass, anchorZoneClass, sectionSubtitleClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function SpendableHero({ profile }) {
  const navigate = useNavigate();
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - expenses);
  const isCritical = safeToSpend < profile.income * 0.05;

  return (
    <div className={`${anchorZoneClass} pt-2 pb-6 text-center relative`}>
      <div className="flex justify-end mb-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/TransactionHistory?tab=insights')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white"
        >
          <Anchor className="w-3.5 h-3.5" />
          Min ekonomi
        </motion.button>
      </div>

      <p className="text-[15px] text-white/55 mb-2">Kvar att spendera</p>

      <motion.p
        key={safeToSpend}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className={anchorDisplayClass}
        style={{
          fontSize: 'clamp(2.75rem, 11vw, 3.5rem)',
          color: isCritical ? '#FF8A9A' : '#fff',
        }}
      >
        {fmt(safeToSpend)}
        <span className="text-[22px] sm:text-[26px] font-medium ml-1.5 text-white/40">kr</span>
      </motion.p>

      <p className={`${sectionSubtitleClass} mt-4 max-w-[280px] mx-auto`}>
        Av {fmt(profile.income)} kr inkomst efter fasta kostnader.
      </p>
    </div>
  );
}
