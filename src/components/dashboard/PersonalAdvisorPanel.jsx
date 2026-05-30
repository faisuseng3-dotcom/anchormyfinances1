import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { hasAdvisorProfileData } from '@/lib/advisorProfile';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function PersonalAdvisorPanel({ refreshKey = 0 }) {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasAdvisorProfileData(profile)) {
      setLoading(false);
      setBriefing(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    askPersonalAdvisor(
      { scenario: 'dashboard_briefing' },
      { profile, transactions, isDemoMode },
    )
      .then((data) => {
        if (!cancelled) {
          if (data?.needs_profile && hasAdvisorProfileData(profile)) {
            setError('Kunde inte hämta personligt råd just nu.');
            setBriefing(null);
          } else {
            setBriefing(data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError('Kunde inte hämta personligt råd just nu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profile, transactions, isDemoMode, refreshKey]);

  if (!hasAdvisorProfileData(profile)) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 border border-white/[0.08]"
      style={{
        background: 'linear-gradient(145deg, rgba(13,115,119,0.12) 0%, rgba(75,124,243,0.08) 100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#9AE6B4]" />
        <p className={sectionMetaClass}>Din personliga rådgivare</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3 text-white/50 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyserar din ekonomi…
        </div>
      )}

      {!loading && error && (
        <p className={`${sectionSubtitleClass} text-white/55`}>{error}</p>
      )}

      {!loading && briefing && !error && !briefing.needs_profile && (
        <>
          <h3 className="text-[17px] font-bold text-white mb-1.5 leading-snug">
            {briefing.headline}
          </h3>
          <p className={`${sectionSubtitleClass} leading-relaxed mb-3`}>
            {briefing.message}
          </p>

          {briefing.actions?.length > 0 && (
            <ul className="space-y-2">
              {briefing.actions.slice(0, 3).map((action, i) => (
                <li
                  key={i}
                  className="rounded-xl px-3 py-2.5 bg-white/[0.04] border border-white/[0.06]"
                >
                  <p className="text-[14px] font-semibold text-white">{action.title}</p>
                  <p className="text-[12px] text-white/55 mt-0.5">{action.detail}</p>
                  {action.impact_kr > 0 && (
                    <p className="text-[12px] text-emerald-300/90 mt-1">
                      Uppskattad effekt: {Math.round(action.impact_kr).toLocaleString('sv-SE')} kr
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </motion.section>
  );
}
