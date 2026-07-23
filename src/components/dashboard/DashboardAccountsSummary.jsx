// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { buildAccountItems, fmtKr } from '@/components/dashboard/copilot/copilotDashboardUtils';
import { createPageUrl } from '@/utils';

/**
 * Kontoöversikt i huvudflödet — samma data som skrivbordssidomenyn, men
 * synlig även på mobil där sidomenyn aldrig visas.
 */
export default function DashboardAccountsSummary({ profile }) {
  const navigate = useNavigate();
  const items = buildAccountItems(profile);

  if (!items.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
    >
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Konton</h2>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {items.map((acc, i) => (
          <button
            key={acc.id}
            type="button"
            onClick={() => navigate(createPageUrl('SavingsGoals'))}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left anchor-pressable"
            style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: acc.color }}
              aria-hidden
            />
            <span className="flex-1 min-w-0 text-[14px] font-medium text-white/85 truncate">
              {acc.name}
            </span>
            <span className="text-[14px] font-semibold tabular-nums" style={{ color: acc.amount < 0 ? '#e2857a' : 'rgba(255,255,255,0.92)' }}>
              {fmtKr(acc.amount, { signed: acc.amount < 0 })}
            </span>
            {acc.interactive && <ChevronRight size={14} className="text-white/20 shrink-0" />}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
