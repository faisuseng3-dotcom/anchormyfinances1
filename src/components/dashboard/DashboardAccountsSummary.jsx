// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buildAccountItems, fmtKr } from '@/components/dashboard/copilot/copilotDashboardUtils';
import { createPageUrl } from '@/utils';

/**
 * Konton som horisontellt scrollbara kort — läsbara som riktiga konton
 * (med mål och progress), inte som en inställningsrad. Densiteten skiljer
 * sig medvetet från transaktionslistan under.
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
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-8 sm:px-8 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
        {items.map((acc) => {
          const pct = acc.goalTarget > 0 ? Math.min(100, (acc.amount / acc.goalTarget) * 100) : null;
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => navigate(createPageUrl('SavingsGoals'))}
              className="shrink-0 w-[160px] text-left rounded-2xl p-4 anchor-pressable"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                scrollSnapAlign: 'start',
              }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block mb-3"
                style={{ background: acc.color }}
                aria-hidden
              />
              <p className="text-[13px] font-medium text-white/70 truncate">{acc.name}</p>
              <p
                className="text-[18px] font-bold tabular-nums mt-1"
                style={{ color: acc.amount < 0 ? '#e2857a' : '#ffffff' }}
              >
                {fmtKr(acc.amount, { signed: acc.amount < 0 })}
              </p>
              {pct != null && (
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
