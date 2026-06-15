import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { springPop } from '@/lib/motionPresets';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function statusFromFree(free, margin) {
  if (margin <= 0) return { label: 'Sätt upp budget', tone: 'muted' };
  const ratio = free / margin;
  if (ratio >= 0.35) return { label: 'Trygg marginal', tone: 'green' };
  if (ratio >= 0.15) return { label: 'Håll koll', tone: 'amber' };
  return { label: 'Tight månad', tone: 'amber' };
}

/**
 * Framåtblickande hero — "Säkert att spendera" (inte vad du misslyckats med).
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

  const status = statusFromFree(free, margin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPop}
      className={`anchor-premium-hero organic-surface--hero rounded-[24px] overflow-hidden active:scale-[0.995] transition-transform ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(34,217,122,0.16) 0%, rgba(74,122,255,0.08) 55%, rgba(10,15,107,0.2) 100%)',
        boxShadow: 'var(--organic-shadow-lift), var(--organic-shadow-inset)',
      }}
    >
      <div className="px-6 py-10 sm:py-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--copilot-text-muted)]">
          Säkert att spendera
        </p>
        <p className="text-[64px] sm:text-[76px] font-bold text-white tabular-nums leading-none mt-3 tracking-tight">
          {fmt(free)}
          <span className="text-[28px] sm:text-[32px] font-medium text-[var(--copilot-text-secondary)] ml-2">kr</span>
        </p>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, ...springPop }}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[13px] font-semibold"
          style={{
            background: status.tone === 'green'
              ? 'rgba(34,217,122,0.18)'
              : 'rgba(251,191,36,0.14)',
            color: status.tone === 'green' ? '#22d97a' : '#fbbf24',
            boxShadow: 'var(--organic-shadow-soft)',
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          {status.label}
          <span className="text-white/50 font-medium">·</span>
          <span className="text-white/80 font-medium">{fmt(margin)} kr marginal</span>
        </motion.span>
      </div>
    </motion.div>
  );
}
