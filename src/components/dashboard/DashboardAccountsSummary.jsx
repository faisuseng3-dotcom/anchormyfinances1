// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buildAccountItems, fmtKr } from '@/components/dashboard/copilot/copilotDashboardUtils';
import { createPageUrl } from '@/utils';
import { triggerHaptic } from '@/lib/haptics';

const CARD_RADIUS = 16;

// Bakre korten visar bara en smal kant (ingen text) — annars korsar
// etiketterna varandra och blir oläsliga när de skymtar igenom.
const FAN = [
  { z: 3, y: 0, scale: 1 },
  { z: 2, y: 10, scale: 0.96, band: 22 },
  { z: 1, y: 20, scale: 0.92, band: 12 },
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

  if (!items.length) {
    return (
      <section>
        <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Konton</h2>
        <div
          className="rounded-2xl p-5 text-center"
          style={{ border: '1px dashed var(--color-border)' }}
        >
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            Inga konton ännu — lägg till buffert eller sparande i menyn för att se dem här.
          </p>
        </div>
      </section>
    );
  }

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
    <section>
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
                  background: `linear-gradient(135deg, ${acc.color}29, #FFFFFF 70%)`,
                  border: '1px solid var(--color-border)',
                  zIndex: t.z,
                  boxShadow: isFront ? '0 16px 34px -14px rgba(11,18,32,0.28)' : 'none',
                  clipPath: t.band
                    ? `inset(calc(100% - ${t.band}px) 0 0 0 round ${CARD_RADIUS}px)`
                    : undefined,
                }}
                animate={{ y: t.y, scale: t.scale }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block mb-3"
                  style={{ background: acc.color }}
                  aria-hidden
                />
                <p className="text-[13px] font-medium text-[var(--color-text-secondary)] truncate">{acc.name}</p>
                <p
                  className="text-[18px] font-bold tabular-nums mt-1"
                  style={{ color: acc.amount < 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}
                >
                  {fmtKr(acc.amount, { signed: acc.amount < 0 })}
                </p>
                {pct != null && isFront && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
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
                style={{ background: order[0] === i ? 'var(--color-accent)' : 'rgba(11,18,32,0.15)' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
