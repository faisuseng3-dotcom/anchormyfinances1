import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Radio } from 'lucide-react';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { dashLabel, dashSignalLine } from '@/lib/dashboardTheme';

export default function HomeTodaySection({ refreshKey = 0, toneMode = 'normal' }) {
  const { briefing, loading, hasProfile } = useDashboardBriefing(refreshKey);
  const soft = toneMode === 'soft';

  if (!hasProfile) return null;

  const actions = briefing?.actions?.slice(0, soft ? 1 : 3) || [];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-3.5 h-3.5 text-cyan-400/70" />
        <p className={dashLabel}>Din vecka</p>
      </div>

      <div className={dashSignalLine}>
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-white/45 text-sm font-light">
            <Loader2 className="w-4 h-4 animate-spin" />
            Tittar på din ekonomi…
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
