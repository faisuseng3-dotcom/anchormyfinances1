import React, { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { getDailyMicroWins } from '@/lib/microWins';
import { dashLabel, dashSignalLine } from '@/lib/dashboardTheme';
import { SkeletonLine } from '@/components/loading/SkeletonBlocks';

export default function HomeTodaySection({
  refreshKey = 0,
  toneMode = 'normal',
  profile,
  transactions = [],
}) {
  const {
    briefing,
    loading,
    refreshing,
    updatedAtLabel,
    refresh,
    hasProfile,
  } = useDashboardBriefing(refreshKey);
  const soft = toneMode === 'soft';

  const primaryAction = briefing?.actions?.[0];
  const microWin = useMemo(() => {
    const wins = getDailyMicroWins(profile, transactions);
    return wins[0]?.text || null;
  }, [profile, transactions]);

  if (!hasProfile) return null;

  const showContent = briefing && !briefing.needs_profile;

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className={dashLabel}>Veckobrev</p>
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
            aria-label="Hämta nytt veckobrev"
            title="Hämta nytt veckobrev"
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
            {microWin && !loading && (
              <p className="text-[14px] text-white/60 mt-3 leading-relaxed font-light">
                {microWin}
              </p>
            )}
          </>
        )}
      </div>

      {!loading && primaryAction && !soft && (
        <p className="mt-4 text-[14px] text-white/50 leading-relaxed">
          {primaryAction.detail}{' '}
          <span className="text-white/80 font-medium">{primaryAction.title}</span>
          {primaryAction.impact_kr > 0 && (
            <span className="text-emerald-400/80 tabular-nums">
              {' '}
              (+{Math.round(primaryAction.impact_kr).toLocaleString('sv-SE')} kr/mån)
            </span>
          )}
        </p>
      )}

      {!loading && primaryAction && soft && (
        <p className="mt-4 text-[14px] text-white/55 leading-relaxed font-light">
          {primaryAction.detail}
        </p>
      )}
    </section>
  );
}
