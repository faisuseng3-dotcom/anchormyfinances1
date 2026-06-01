import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { hasAdvisorProfileData } from '@/lib/advisorProfile';
import { buildFallbackBriefing } from '@/lib/economicHealth';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function HomeTodaySection({ refreshKey = 0 }) {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasAdvisorProfileData(profile)) {
      setLoading(false);
      setBriefing(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    askPersonalAdvisor(
      { scenario: 'dashboard_briefing' },
      { profile, transactions, isDemoMode },
    )
      .then((data) => {
        if (cancelled) return;
        if (data?.needs_profile && hasAdvisorProfileData(profile)) {
          setBriefing(buildFallbackBriefing(profile));
        } else if (data && !data.needs_profile) {
          setBriefing(data);
        } else {
          setBriefing(buildFallbackBriefing(profile));
        }
      })
      .catch(() => {
        if (!cancelled) setBriefing(buildFallbackBriefing(profile));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profile, transactions, isDemoMode, refreshKey]);

  if (!hasAdvisorProfileData(profile)) return null;

  const actions = briefing?.actions?.slice(0, 3) || [];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className={sectionMetaClass}>Idag</p>
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Räknar utifrån din profil…
          </div>
        ) : (
          <>
            {briefing?.headline && (
              <h3 className="text-[16px] font-semibold text-white mt-1 leading-snug">
                {briefing.headline}
              </h3>
            )}
            {briefing?.message && (
              <p className={`${sectionSubtitleClass} mt-1.5 leading-relaxed`}>
                {briefing.message}
              </p>
            )}
          </>
        )}
      </div>

      {!loading && actions.length > 0 && (
        <ul className="border-t border-white/[0.06]">
          {actions.map((action, i) => (
            <motion.li
              key={`${action.title}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-4 py-3 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[12px] font-semibold text-white/70 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-white">{action.title}</p>
                  <p className="text-[12px] text-white/50 mt-0.5 leading-relaxed">{action.detail}</p>
                  {action.impact_kr > 0 && (
                    <p className="text-[12px] text-emerald-300/90 mt-1 tabular-nums">
                      +{Math.round(action.impact_kr).toLocaleString('sv-SE')} kr/mån möjlig effekt
                    </p>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
