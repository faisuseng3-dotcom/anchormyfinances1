import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';
import InsightDetailModal from './InsightDetailModal';
import { anchorZoneClass } from '@/lib/anchorTheme';

const TYPE_COLORS = {
  danger: { ring: '#FF6B7A', Icon: AlertCircle },
  warning: { ring: '#F6AD55', Icon: AlertTriangle },
  info: { ring: '#34D9BE', Icon: Info },
  success: { ring: '#A78BFA', Icon: TrendingUp },
};

export default function AIStoryBar({ profile, transactions }) {
  const [activeInsight, setActiveInsight] = useState(null);

  const insights = useMemo(() => runInsightEngine(profile, transactions), [profile, transactions]);

  if (!insights.length) return null;

  return (
    <>
      <div className={`${anchorZoneClass} flex gap-4 overflow-x-auto no-scrollbar py-2`}>
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
              className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[56px]"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Ic className="w-5 h-5" style={{ color: cfg.ring }} />
              </div>
              <p className="text-[11px] font-medium text-center text-white/45 max-w-[64px] leading-tight line-clamp-2">
                {ins.title.split(' ').slice(0, 2).join(' ')}
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

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </>
  );
}
