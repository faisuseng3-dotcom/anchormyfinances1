import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

export default function SafeToSpendWidget({ profile }) {
  if (!profile) return null;

  const totalFixedCosts = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixedCosts;
  const monthlyExpenseSum = (profile.monthlyExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - monthlyExpenseSum);
  const usedPercent = Math.min(100, monthlyMargin > 0 ? Math.round((monthlyExpenseSum / monthlyMargin) * 100) : 100);
  const isLow = safeToSpend < monthlyMargin * 0.2;
  const isCritical = usedPercent >= 90;

  const statusColor = isCritical ? 'var(--color-danger)' : isLow ? 'var(--color-warning)' : 'var(--color-success)';
  const statusLabel = isCritical ? 'Knappt om' : isLow ? 'Lite kvar' : 'Bra koll';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'var(--color-card)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-medium tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Kvar att spendera
          </p>
          <motion.p
            key={safeToSpend}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {safeToSpend.toLocaleString('sv-SE')} <span className="text-2xl font-semibold" style={{ color: 'var(--color-text-muted)' }}>kr</span>
          </motion.p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Denna månad, efter fasta utgifter
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: statusColor }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>Använt {usedPercent}%</span>
          <span>Marginal: {monthlyMargin.toLocaleString('sv-SE')} kr</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 pt-4 grid grid-cols-3 gap-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)' }} className="mb-1">Inkomst</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{profile.income.toLocaleString('sv-SE')} kr</p>
        </div>
        <div>
          <p style={{ color: 'var(--color-text-muted)' }} className="mb-1">Fasta</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalFixedCosts.toLocaleString('sv-SE')} kr</p>
        </div>
        <div>
          <p style={{ color: 'var(--color-text-muted)' }} className="mb-1">Buffert</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{(profile.buffer || 0).toLocaleString('sv-SE')} kr</p>
        </div>
      </div>

      {/* Contextual message */}
      {isCritical && (
        <div className="mt-4 px-4 py-3 rounded-xl text-xs leading-relaxed" style={{ background: `${statusColor}12`, color: 'var(--color-text-secondary)', border: `1px solid ${statusColor}22` }}>
          Du är på {usedPercent}% av din månadsmarginal. Undvik onödiga köp de närmaste dagarna.
        </div>
      )}
      {!isLow && monthlyExpenseSum < monthlyMargin * 0.3 && (
        <div className="mt-4 px-4 py-3 rounded-xl text-xs leading-relaxed" style={{ background: `${statusColor}12`, color: 'var(--color-text-secondary)', border: `1px solid ${statusColor}22` }}>
          Bra kontroll. Du har använt under 30% av din marginal hittills denna månad.
        </div>
      )}
    </motion.div>
  );
}