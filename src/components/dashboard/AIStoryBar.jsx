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
      <div className="flex items-center gap-3 px-5 py-2 overflow-x-auto no-scrollbar">
        {insights.map((ins, i) => {
          const cfg = TYPE_COLORS[ins.type] || TYPE_COLORS.info;
          const Ic = cfg.Icon;
          return (
            <motion.button
              key={ins.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260 }}
              onClick={() => setActiveInsight(ins)}
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              {/* Glowing ring */}
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: cfg.bg,
                  border: `2px solid ${cfg.ring}`,
                  boxShadow: `0 0 12px ${cfg.ring}60, 0 0 24px ${cfg.ring}30`,
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                >
                  <Ic className="w-5 h-5" style={{ color: cfg.ring }} />
                </motion.div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  style={{ border: `1.5px solid ${cfg.ring}` }}
                />
              </div>
              <p className="text-[9px] font-bold tracking-wide text-center max-w-[56px] leading-tight"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
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