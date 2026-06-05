import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Radio } from 'lucide-react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { hasAdvisorProfileData } from '@/lib/advisorProfile';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { dashLabel, dashSignalLine, techInset, techInsetBg } from '@/lib/appSurface';

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

    askPersonalAdvisor({ scenario: 'dashboard_briefing' }, { profile, transactions, isDemoMode })
      .then((data) => {
        if (!cancelled) {
          if (data?.needs_profile && hasAdvisorProfileData(profile)) {
            setError('Kunde inte hämta signal just nu.');
            setBriefing(null);
          } else {
            setBriefing(data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError('Kunde inte hämta signal just nu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile, transactions, isDemoMode, refreshKey]);

  if (!hasAdvisorProfileData(profile)) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${techInset} p-4`}
    >
      <div className={techInsetBg} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400/70" />
          <p className={dashLabel}>Din vecka</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-3 text-white/45 text-sm font-light">
            <Loader2 className="w-4 h-4 animate-spin" />
            Tittar på din ekonomi…
          </div>
        )}

        {!loading && error && <p className="text-[14px] text-white/50 font-light">{error}</p>}

        {!loading && briefing && !error && !briefing.needs_profile && (
          <div className={dashSignalLine}>
            <h3 className="text-[17px] font-medium text-white leading-snug">{briefing.headline}</h3>
            <p className="text-[14px] text-white/50 mt-2 leading-relaxed font-light">{briefing.message}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
