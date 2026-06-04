import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { BarChart3, Loader2 } from 'lucide-react';
import { techCta, techCtaGhost, techInset, techInsetBg, dashLabel } from '@/lib/appSurface';

const formatNumber = (value) =>
  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function WeeklySummary() {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await askPersonalAdvisor(
        { scenario: 'weekly_summary' },
        { profile, transactions, isDemoMode },
      );
      setSummary({
        text: [response.summary, response.highlight, response.next_step].filter(Boolean).join(' '),
      });
      base44.analytics.track({ eventName: 'weekly_summary_generated' });
    } catch (error) {
      console.error('Summary error:', error);
    }
    setLoading(false);
  };

  if (summary) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${techInset} p-5`}>
        <div className={techInsetBg} />
        <div className="relative z-10">
          <p className={dashLabel}>Veckan i korthet</p>
          <p className="text-[15px] text-white/70 mt-3 leading-relaxed font-light">{summary.text}</p>
          <button type="button" onClick={() => setSummary(null)} className={`${techCtaGhost} w-full mt-5`}>
            Stäng
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${techInset} p-5`}>
      <div className={techInsetBg} />
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08]">
          <BarChart3 className="w-5 h-5 text-cyan-300/80" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={dashLabel}>Veckosammanfattning</p>
          <p className="text-[14px] text-white/45 mt-1 font-light">Utifrån dina senaste utgifter</p>
          <button
            type="button"
            onClick={generateSummary}
            disabled={loading}
            className={`${techCta} w-full mt-4`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Räknar…
              </>
            ) : (
              'Visa veckan'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
