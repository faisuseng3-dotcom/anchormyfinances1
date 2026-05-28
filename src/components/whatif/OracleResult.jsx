import React from 'react';
import { motion } from 'framer-motion';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import OracleImpactChart from './OracleImpactChart';

const STATUS_LABEL = {
  ok: { label: 'Det går ihop', color: 'text-emerald-300/90' },
  tight: { label: 'Trångt', color: 'text-amber-300/90' },
  critical: { label: 'Under noll', color: 'text-rose-300/90' },
};

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function OracleResult({ result, currentMargin }) {
  if (!result) return null;

  const { summary, simulatedMargin, bufferImpactPct, status, paths, butterflyEffect, stressTest } =
    result;
  const sc = STATUS_LABEL[status] || STATUS_LABEL.tight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pt-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={`text-[15px] font-semibold ${sc.color}`}>{sc.label}</p>
        <p className={sectionMetaClass}>
          Ny marginal: {fmt(simulatedMargin)} kr/mån
        </p>
      </div>

      <OracleImpactChart current={currentMargin} simulated={simulatedMargin} />

      <div>
        <p className="text-[15px] text-white/85 leading-relaxed">{summary}</p>
        {bufferImpactPct > 0 && (
          <p className={`${sectionSubtitleClass} mt-2`}>
            Du kan behöva använda cirka {Math.round(bufferImpactPct)} % av bufferten.
          </p>
        )}
      </div>

      {butterflyEffect && (
        <>
          <DashboardDivider />
          <div>
            <p className="text-[13px] font-medium text-white/45 mb-1">På sikt</p>
            <p className="text-[14px] text-white/70 leading-relaxed">{butterflyEffect}</p>
          </div>
        </>
      )}

      {stressTest && (
        <>
          <DashboardDivider />
          <div>
            <p className="text-[13px] font-medium text-white/45 mb-1">Om det blir dyrare (+20 %)</p>
            <p className="text-[14px] text-white/70 leading-relaxed">{stressTest}</p>
          </div>
        </>
      )}

      {paths?.length > 0 && (
        <>
          <DashboardDivider />
          <div>
            <p className="text-[13px] font-medium text-white/45 mb-3">Möjliga vägar</p>
            <ul className="space-y-3">
              {paths.map((p, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-white/75 leading-relaxed">
                  <span className="text-white/35 tabular-nums shrink-0">{i + 1}.</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </motion.div>
  );
}
