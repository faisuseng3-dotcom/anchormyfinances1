// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { buildActionScenarios } from '@/lib/actionScenarios';

export default function ScenarioCompare({ profile, transactions }) {
  const scenarios = useMemo(
    () => buildActionScenarios(profile, transactions),
    [profile, transactions],
  );

  if (!scenarios.length) return null;

  const maxBalance = Math.max(...scenarios.map((s) => s.balance), 1);
  const best = scenarios.reduce((a, b) => (b.balance > a.balance ? b : a), scenarios[0]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[15px] font-semibold text-white">Vad händer om du ändrar något?</p>
        <p className="text-[13px] text-white/45 mt-1">Saldo om 30 dagar — tre tydliga scenarier.</p>
      </div>

      <div className="space-y-3">
        {scenarios.map((s, i) => {
          const pct = Math.max(8, (s.balance / maxBalance) * 100);
          const isBest = s.id === best.id && s.delta > 0;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl px-4 py-4"
              style={{
                background: isBest ? 'rgba(79,174,130,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isBest ? 'rgba(79,174,130,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="anchor-card-title">
                    Scenario {String.fromCharCode(65 + i)}
                  </h3>
                  <p className="text-[14px] font-medium text-white mt-0.5">{s.label}</p>
                  {s.hint && <p className="text-[12px] text-white/40 mt-0.5">{s.hint}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-white/35">Saldo om 30 dagar</p>
                  <p className="text-[22px] font-bold text-white tabular-nums leading-tight mt-0.5">
                    {s.balanceLabel}
                  </p>
                  {s.delta > 0 && (
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#4fae82' }}>
                      +{s.delta.toLocaleString('sv-SE')} kr
                    </p>
                  )}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: s.accent }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
