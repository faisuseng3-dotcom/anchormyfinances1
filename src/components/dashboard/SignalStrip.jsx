import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';
import InsightDetailModal from './InsightDetailModal';
import { dashRail, dashLabel } from '@/lib/appSurface';

const TYPE_COLORS = {
  danger: { ring: '#FF6B7A', Icon: AlertCircle },
  warning: { ring: '#F6AD55', Icon: AlertTriangle },
  info: { ring: '#34D9BE', Icon: Info },
  success: { ring: '#A78BFA', Icon: TrendingUp },
};

/** Tidigare AIStoryBar — regelbaserade signaler, ingen AI-badge. */
export default function SignalStrip({ profile, transactions }) {
  const [activeInsight, setActiveInsight] = useState(null);
  const insights = useMemo(() => runInsightEngine(profile, transactions), [profile, transactions]);

  if (!insights.length) return null;

  return (
    <>
      <p className={`${dashLabel} mb-2`}>Signaler</p>
      <div className={`${dashRail} pb-2`}>
        {insights.map((ins, i) => {
          const cfg = TYPE_COLORS[ins.type] || TYPE_COLORS.info;
          const Ic = cfg.Icon;
          return (
            <motion.button
              key={ins.id}
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActiveInsight(ins)}
              className="snap-center flex-shrink-0 flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ring-inset ring-white/[0.1]"
                style={{ background: `${cfg.ring}18` }}
              >
                <Ic className="w-5 h-5" style={{ color: cfg.ring }} />
              </div>
              <p className="text-[11px] font-medium text-center text-white/50 max-w-[76px] leading-tight line-clamp-2">
                {ins.title}
              </p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeInsight && (
          <InsightDetailModal
            insight={activeInsight}
            transactions={transactions}
            profile={profile}
            onClose={() => setActiveInsight(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
