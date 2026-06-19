// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateDashboardInsights } from '@/lib/dashboardInsights';

export default function DashboardDiscoveries({ profile, transactions }) {
  const items = useMemo(
    () => generateDashboardInsights(profile, transactions),
    [profile, transactions],
  );

  if (!items.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="pt-2"
    >
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Anchor har upptäckt</h2>
      <ul className="space-y-3">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-3 text-[15px] text-white/75 leading-snug">
            <span className="text-white/30 shrink-0 mt-0.5" aria-hidden>•</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
