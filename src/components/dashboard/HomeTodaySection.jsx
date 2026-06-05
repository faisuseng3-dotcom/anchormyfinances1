import React from 'react';
import { motion } from 'framer-motion';
import { Radio, RefreshCw } from 'lucide-react';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { dashLabel, dashSignalLine } from '@/lib/dashboardTheme';
import { SkeletonLine } from '@/components/loading/SkeletonBlocks';

export default function HomeTodaySection({ refreshKey = 0, toneMode = 'normal' }) {
  const {
    briefing,
    loading,
    refreshing,
    updatedAtLabel,
    refresh,
    hasProfile,
  } = useDashboardBriefing(refreshKey);
  const soft = toneMode === 'soft';

  if (!hasProfile) return null;

  const actions = briefing?.actions?.slice(0, soft ? 1 : 3) || [];
  const showContent = briefing && !briefing.needs_profile;

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
          <p className={dashLabel}>Din vecka</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {updatedAtLabel && !loading && (
            <span className="text-[11px] text-white/35 tabular-nums">
              Senast {updatedAtLabel}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 disabled:opacity-40"
            aria-label="Uppdatera analys"
            title="Kör ny analys"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className={dashSignalLine}>
        {loading && !showContent ? (
          <div className="space-y-2 py-1">
            <SkeletonLine width="w-3/4" className="h-4" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-5/6" />
          </div>
        ) : (
          <>
            {briefing?.headline && (
              <h3 className="text-[18px] font-medium text-white leading-snug tracking-tight">
                {briefing.headline}
              </h3>
            )}
            {briefing?.message && (
              <p className="text-[14px] text-white/50 mt-2 leading-relaxed font-light">
                {briefing.message}
              </p>
            )}
          </>
        )}
      </div>

      {!loading && actions.length > 0 && (
        <ul className="mt-5 space-y-3">
          {actions.map((action, i) => (
            <motion.li
              key={`${action.title}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-3 items-start"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/80 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-white/90">{action.title}</p>
                <p className="text-[12px] text-white/45 mt-0.5 leading-relaxed">{action.detail}</p>
                {action.impact_kr > 0 && (
                  <p className="text-[12px] text-emerald-400/80 mt-1 tabular-nums">
                    +{Math.round(action.impact_kr).toLocaleString('sv-SE')} kr/mån
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
