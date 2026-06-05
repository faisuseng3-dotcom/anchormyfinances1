import React from 'react';
import { motion } from 'framer-motion';
import { Radio, RefreshCw } from 'lucide-react';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { dashLabel, dashSignalLine, techInset, techInsetBg } from '@/lib/appSurface';
import { SkeletonLine } from '@/components/loading/SkeletonBlocks';

export default function PersonalAdvisorPanel({ refreshKey = 0 }) {
  const {
    briefing,
    loading,
    refreshing,
    updatedAtLabel,
    refresh,
    hasProfile,
  } = useDashboardBriefing(refreshKey);

  if (!hasProfile) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${techInset} p-4`}
    >
      <div className={techInsetBg} />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="w-3.5 h-3.5 text-cyan-400/70" />
            <p className={dashLabel}>Din vecka</p>
          </div>
          {updatedAtLabel && !loading && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-white/35">Senast {updatedAtLabel}</span>
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="text-white/40 hover:text-white/70 disabled:opacity-40"
                aria-label="Uppdatera analys"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className={dashSignalLine}>
          {loading && !briefing ? (
            <div className="space-y-2 py-1">
              <SkeletonLine width="w-2/3" className="h-3.5" />
              <SkeletonLine width="w-full" />
            </div>
          ) : briefing && !briefing.needs_profile ? (
            <>
              <h3 className="text-[17px] font-medium text-white leading-snug">{briefing.headline}</h3>
              <p className="text-[14px] text-white/50 mt-2 leading-relaxed font-light">{briefing.message}</p>
            </>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
