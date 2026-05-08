import React from 'react';
import { motion } from 'framer-motion';

export default function ScenarioCards({ profile, brusSavings }) {
  const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

  const income = profile?.income || 28000;
  const savingsGoal = profile?.savingsGoal || 400000;
  const currentSavings = profile?.savingsCurrentBalance || 52000;
  const remaining = savingsGoal - currentSavings;

  // Monthly surplus estimate
  const monthlySurplus = Math.max(4000, income * 0.18);
  const yearsA = remaining / (monthlySurplus * 12);
  const yearsB = remaining / ((monthlySurplus + brusSavings) * 12);

  const runwayA = income > 0 ? (profile?.buffer || 12000) / income : 0;
  const runwayB = runwayA + brusSavings / income;

  // 20 år förmögenhet (enkel ränta-på-ränta)
  const wealthA = monthlySurplus * 12 * 20 * 1.5;
  const wealthB = (monthlySurplus + brusSavings) * 12 * 20 * 1.8;

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-widest px-1" style={{ color: '#8896A5' }}>
        Anchor ser två framtider
      </p>

      {/* Scenario A */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(203,213,224,0.15)', border: '1px solid rgba(203,213,224,0.40)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">😐</span>
          <p className="text-sm font-black" style={{ color: '#4A5568' }}>Scenario A — Status Quo</p>
        </div>
        <div className="space-y-2">
          <Row label="Kontantinsats klar om" value={`${yearsA.toFixed(1)} år`} color="#4A5568" />
          <Row label="Runway (månader utan lön)" value={`${runwayA.toFixed(1)} mån`} color="#4A5568" />
          <Row label="Alternativkostnad (20 år)" value={`${fmt(wealthA)} kr`} color="#4A5568" />
        </div>
      </motion.div>

      {/* Scenario B */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(15,222,189,0.06)', border: '1px solid rgba(15,222,189,0.25)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🚀</span>
          <p className="text-sm font-black" style={{ color: '#0D7377' }}>Scenario B — Anchor-justering</p>
        </div>
        <div className="space-y-2">
          <Row
            label="Kontantinsats klar om"
            value={`${yearsB.toFixed(1)} år`}
            diff={`${((yearsA - yearsB) * 12).toFixed(0)} mån snabbare`}
            color="#0D7377"
          />
          <Row
            label="Runway inom 6 månader"
            value={`${runwayB.toFixed(1)} mån`}
            diff="+bättre krockkudde"
            color="#0D7377"
          />
          <Row
            label="Förmögenhet vid 55 (indexfond)"
            value={`${fmt(wealthB)} kr`}
            diff={`+${fmt(wealthB - wealthA)} kr extra`}
            color="#0D7377"
          />
        </div>
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(15,222,189,0.15)' }}>
          <p className="text-xs italic" style={{ color: '#4A8A8C' }}>
            📌 Alternativkostnaden av Brus-pengarna, investerade i en global indexfond med 8% snittavkastning.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, diff, color }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs" style={{ color: '#6B7E96' }}>{label}</p>
      <div className="text-right">
        <p className="text-sm font-black" style={{ color }}>{value}</p>
        {diff && <p className="text-[10px] font-bold" style={{ color: '#0FDEBD' }}>{diff}</p>}
      </div>
    </div>
  );
}