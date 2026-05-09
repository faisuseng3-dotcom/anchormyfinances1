import React from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function SpendableHero({ profile }) {
  const navigate = useNavigate();
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - expenses);

  const isCritical = safeToSpend < profile.income * 0.05;
  const accent = isCritical ? '#FF5A6B' : '#B8C9FF';

  return (
    <div
      className="mx-4 mt-4 rounded-[28px] relative overflow-hidden"
      style={dashboardGlassSurface(
        isCritical
          ? { border: '1px solid rgba(255,90,107,0.28)' }
          : undefined
      )}
    >
      {/* Soft highlight — no harsh neon pulse */}
      <div
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${accent}22 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 px-5 sm:px-6 pt-6 pb-5 text-center">
        {/* Header row with "min ekonomi" button in Alex Mode */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <p className={dashboardSectionLabelClass}>Pengar att spendera</p>
          {profile._alexMode && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/AnchorAnalysis')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              <Anchor className="w-3.5 h-3.5 opacity-80" />
              Min ekonomi
            </motion.button>
          )}
        </div>

        <motion.p
          key={safeToSpend}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260 }}
          className="font-semibold leading-none tracking-tight text-white"
          style={{ fontSize: 'clamp(2.25rem, 9vw, 3.15rem)' }}
        >
          {fmt(safeToSpend)}
          <span className="text-xl sm:text-2xl font-medium ml-1 text-white/45">kr</span>
        </motion.p>

        {/* Kvar badge */}
        <div className="mt-3 flex justify-center">
          <span
            className="px-3.5 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.88)',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Kvar att spendera
          </span>
        </div>

        {/* Sub-line */}
        <p className="mt-3 text-[13px] leading-relaxed text-white/50">
          Av {fmt(profile.income)} kr i inkomst, efter att räkningarna är betalda.
        </p>
      </div>

    </div>
  );
}