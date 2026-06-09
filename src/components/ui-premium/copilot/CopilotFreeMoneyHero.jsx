import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useFreeMoney } from '@/hooks/useFreeMoney';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Framåtblickande hero — "Dina fria pengar" (inte vad du misslyckats med).
 * Synkas globalt via useFreeMoney / React Query.
 */
export default function CopilotFreeMoneyHero({
  previewAmount = null,
  isExpensePreview = true,
  className = '',
}) {
  const { freeMoney: baseFree, margin } = useFreeMoney();

  const free = previewAmount != null && isExpensePreview
    ? Math.max(0, baseFree - Math.abs(Number(previewAmount) || 0))
    : previewAmount != null && !isExpensePreview
      ? baseFree + Math.abs(Number(previewAmount) || 0)
      : baseFree;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`anchor-premium-hero organic-surface--hero rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(34,217,122,0.14) 0%, rgba(74,122,255,0.1) 100%)',
      }}
    >
      <div className="p-5 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(34,217,122,0.18)', boxShadow: 'var(--anchor-shadow-1)' }}
        >
          <Wallet className="w-5 h-5 text-[var(--copilot-accent-green)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-muted)]">
            Dina fria pengar
          </p>
          <p className="text-[32px] sm:text-[36px] font-bold text-white tabular-nums leading-none mt-1 tracking-tight">
            {fmt(free)}
            <span className="text-[18px] font-medium text-[var(--copilot-text-secondary)] ml-1">kr</span>
          </p>
          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2 leading-relaxed">
            Kvar att leva på denna månad — av {fmt(margin)} kr marginal.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
