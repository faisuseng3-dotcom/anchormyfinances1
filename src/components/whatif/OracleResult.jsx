import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, TrendingDown, TrendingUp, GitBranch } from 'lucide-react';
import OracleImpactChart from './OracleImpactChart';

export default function OracleResult({ result, currentMargin }) {
  if (!result) return null;

  const { summary, simulatedMargin, bufferImpactPct, status, paths, butterflyEffect, stressTest } = result;

  const statusConfig = {
    ok: { color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: '✅ Stabil ekonomi' },
    tight: { color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: '⚠️ Ansträngd' },
    critical: { color: 'text-rose-400', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: '🚨 Akut läge' },
  };
  const sc = statusConfig[status] || statusConfig.tight;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Oracle-analys</p>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.color}`}
          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
          {sc.label}
        </span>
      </div>

      {/* Impact chart */}
      <OracleImpactChart current={currentMargin} simulated={simulatedMargin} />

      {/* CFO summary */}
      <div className="rounded-2xl p-4 space-y-1"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          </div>
          <div>
            <p className="text-xs text-indigo-300 font-semibold mb-1">CFO-Analytikern & Skatte-Strategen</p>
            <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
            {bufferImpactPct > 0 && (
              <p className="text-xs text-amber-400 mt-2">
                📦 Du kommer behöva använda ~{Math.round(bufferImpactPct)}% av din buffert.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Butterfly Effect */}
      {butterflyEffect && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs font-semibold text-purple-400 mb-2">🦋 Fjärilseffekten (3-årsvy)</p>
          <p className="text-sm text-slate-300 leading-relaxed">{butterflyEffect}</p>
        </div>
      )}

      {/* Stress Test */}
      {stressTest && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-semibold text-rose-400 mb-2">🧪 Stress-Test (Worst Case)</p>
          <p className="text-sm text-slate-300 leading-relaxed">{stressTest}</p>
        </div>
      )}

      {/* 3 Paths */}
      {paths && paths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" /> 3 vägar ut
          </p>
          {paths.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-lg flex-shrink-0">{['🅐', '🅑', '🅒'][i]}</span>
              <p className="text-sm text-slate-300 leading-snug">{p}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}