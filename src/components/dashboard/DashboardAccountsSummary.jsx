// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buildAccountItems, fmtKr } from '@/components/dashboard/copilot/copilotDashboardUtils';
import { createPageUrl } from '@/utils';
import { triggerHaptic } from '@/lib/haptics';

const FAN = [
  { rotate: 0, x: 0, y: 0, scale: 1, brightness: 1, z: 3 },
  { rotate: -7, x: -16, y: 10, scale: 0.97, brightness: 0.72, z: 2 },
  { rotate: 8, x: 18, y: 14, scale: 0.94, brightness: 0.55, z: 1 },
];

/**
 * Konton som en fanad kortstapel — tryck på ett bakre kort för att lyfta
 * fram det, tryck på det främre för att öppna det. Ersätter den horisontella
 * radlistan med något som känns som riktiga konton, inte inställningsrader.
 */
export default function DashboardAccountsSummary({ profile }) {
  const navigate = useNavigate();
  const items = buildAccountItems(profile);
  const [order, setOrder] = useState(() => items.map((_, i) => i));

  useEffect(() => {
    setOrder((prev) => (prev.length === items.length ? prev : items.map((_, i) => i)));
  }, [items.length]);

  if (!items.length) return null;

  const bringToFront = (itemIndex) => {
    triggerHaptic('light');
    setOrder((prev) => {
      const pos = prev.indexOf(itemIndex);
      if (pos <= 0) return prev;
      const next = [...prev];
      next.splice(pos, 1);
      next.unshift(itemIndex);
      return next;
    });
  };

  const visibleStack = order.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
    >
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Konton</h2>
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-[230px]" style={{ height: 150 }}>
          {visibleStack.map((itemIndex, stackPos) => {
            const acc = items[itemIndex];
            const t = FAN[stackPos];
            const isFront = stackPos === 0;
            const pct = acc.goalTarget > 0 ? Math.min(100, (acc.amount / acc.goalTarget) * 100) : null;

            return (
              <motion.button
                key={acc.id}
                type="button"
                onClick={() => (isFront ? navigate(createPageUrl('SavingsGoals')) : bringToFront(itemIndex))}
                className="absolute inset-0 text-left rounded-2xl p-4 anchor-pressable"
                style={{
                  background: `linear-gradient(135deg, ${acc.color}29, rgba(255,255,255,0.03) 70%)`,
                  border: '1px solid rgba(255,255,255,0.08)',
                  zIndex: t.z,
                  filter: `brightness(${t.brightness})`,
                  boxShadow: isFront ? '0 16px 34px -14px rgba(0,0,0,0.55)' : 'none',
                }}
                animate={{ rotate: t.rotate, x: t.x, y: t.y, scale: t.scale }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
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
                {pct != null && isFront && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-accent)' }} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        {items.length > 1 && (
          <div className="flex gap-1.5 mt-3" aria-hidden>
            {items.map((acc, i) => (
              <span
                key={acc.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: order[0] === i ? 'var(--color-accent)' : 'rgba(255,255,255,0.18)' }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
