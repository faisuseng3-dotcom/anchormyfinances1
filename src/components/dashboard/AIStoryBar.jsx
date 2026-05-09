import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertTriangle, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';
import InsightDetailModal from './InsightDetailModal';

const TYPE_COLORS = {
  danger:  { ring: '#FF4466', bg: 'rgba(255,68,102,0.2)',  Icon: AlertCircle },
  warning: { ring: '#F6AD55', bg: 'rgba(246,173,85,0.2)',  Icon: AlertTriangle },
  info:    { ring: '#0FDEBD', bg: 'rgba(15,222,189,0.15)', Icon: Info },
  success: { ring: '#A78BFA', bg: 'rgba(167,139,250,0.2)', Icon: TrendingUp },
};

/**
 * AIStoryBar — horisontell "story-bar" med glödande cirklar som expanderar till djupa insikter.
 */
export default function AIStoryBar({ profile, transactions }) {
  const [activeInsight, setActiveInsight] = useState(null);

  const insights = useMemo(() => runInsightEngine(profile, transactions), [profile, transactions]);

  if (!insights.length) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-2 overflow-x-auto no-scrollbar">
        {insights.map((ins, i) => {
          const cfg = TYPE_COLORS[ins.type] || TYPE_COLORS.info;
          const Ic = cfg.Icon;
          return (
            <motion.button
              key={ins.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 280 }}
              onClick={() => setActiveInsight(ins)}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <Ic className="w-5 h-5" style={{ color: cfg.ring }} />
              </div>
              <p
                className="text-[10px] font-medium text-center max-w-[64px] leading-tight text-white/50"
              >
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