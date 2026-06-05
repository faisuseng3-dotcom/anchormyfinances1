import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';
import { createPageUrl } from '@/utils';

/**
 * Proaktiv förhandsvisning — samma budskap som push-notisen.
 */
export default function ProactiveWeekBanner({ profile }) {
  const alert = useMemo(() => getNextWeekFixedExpenses(profile, 7), [profile]);

  if (!alert || alert.count < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl px-4 py-3.5 flex items-start gap-3 ring-1 ${
        alert.urgency === 'high'
          ? 'bg-amber-400/10 ring-amber-400/25'
          : 'bg-cyan-400/8 ring-cyan-400/20'
      }`}
    >
      <CalendarClock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.urgency === 'high' ? 'text-amber-200' : 'text-cyan-300/90'}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] text-white/90 leading-relaxed">
          Nästa vecka: {alert.inAppLine} Se till att du har{' '}
          <span className="font-medium tabular-nums text-white">{alert.totalKr.toLocaleString('sv-SE')} kr</span>
          {' '}på kontot.
        </p>
        <Link
          to={createPageUrl('FuturePulse')}
          className="inline-block text-[13px] text-cyan-300/85 hover:text-cyan-200 mt-2 no-underline"
        >
          Se i Din Framtid →
        </Link>
      </div>
    </motion.div>
  );
}
