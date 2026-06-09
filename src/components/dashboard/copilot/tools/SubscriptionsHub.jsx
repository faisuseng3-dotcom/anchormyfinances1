// @ts-nocheck
import React, { useMemo } from 'react';
import { Lightbulb, CalendarClock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSubscriptionTotal, fmtKr } from '../copilotDashboardUtils';
import {
  getUnusedStreamingSubs,
  getWeeklyActiveSubs,
  getUpcomingSubscriptions,
} from './subscriptionUtils';
import { staggerItem } from '@/lib/motionPresets';
import CopilotToolShell from './CopilotToolShell';

function SubCard({ sub, index, variant = 'active' }) {
  const tint = variant === 'upcoming' ? '#4fc3f7' : '#a78bfa';
  return (
    <motion.div
      {...staggerItem(index)}
      className="rounded-2xl organic-surface p-4 flex items-center gap-3"
      style={{ background: `rgba(255,255,255,${0.05 + (index % 2) * 0.02})` }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-[15px] font-bold text-white"
        style={{ background: `${tint}22`, border: `1px solid ${tint}40` }}
      >
        {(sub.name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{sub.name}</p>
        <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5">
          {variant === 'upcoming' && sub.nextDate
            ? `Dras ${sub.nextDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}`
            : sub.category || 'Abonnemang'}
        </p>
      </div>
      <p className="text-[14px] font-semibold text-white tabular-nums shrink-0">
        {fmtKr(sub.amount || 0)}
      </p>
    </motion.div>
  );
}

export default function SubscriptionsHub({ profile, transactions }) {
  const total = getSubscriptionTotal(profile);
  const weeklyActive = useMemo(
    () => getWeeklyActiveSubs(profile, transactions),
    [profile, transactions],
  );
  const upcoming = useMemo(() => getUpcomingSubscriptions(profile, 6), [profile]);
  const unused = useMemo(
    () => getUnusedStreamingSubs(profile, transactions),
    [profile, transactions],
  );

  return (
    <CopilotToolShell
      title="Prenumerationer"
      subtitle="Se dina tysta utgifter och optimera det som inte ger värde."
    >
      <div
        className="rounded-2xl organic-surface p-6 mb-8"
        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.16) 0%, rgba(74,122,255,0.1) 100%)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)]">
          Tysta utgifter
        </p>
        <p className="text-[36px] font-bold text-white tabular-nums leading-none mt-2">
          {fmtKr(total)}
          <span className="text-[16px] font-medium text-[var(--copilot-text-secondary)] ml-2">/mån</span>
        </p>
        {unused.length > 0 && (
          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-4 flex items-start gap-2 leading-relaxed">
            <Lightbulb className="w-4 h-4 text-[var(--copilot-accent-green)] shrink-0 mt-0.5" />
            <span>
              Tips: Du har {unused.length} strömningstjänst{unused.length > 1 ? 'er' : ''} du inte
              använt på 14 dagar. Vill du optimera?
            </span>
          </p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Aktiviteter denna vecka
        </h2>
        <div className="space-y-2">
          {weeklyActive.length === 0 ? (
            <p className="text-[13px] text-[var(--copilot-text-muted)] py-4">Inga aktiviteter registrerade.</p>
          ) : (
            weeklyActive.map((sub, i) => <SubCard key={sub.name} sub={sub} index={i} variant="active" />)
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-3 flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5" />
          Kommande dragningar
        </h2>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-[var(--copilot-text-muted)] py-4">Inga kommande dragningar.</p>
          ) : (
            upcoming.map((sub, i) => <SubCard key={`${sub.name}-${i}`} sub={sub} index={i} variant="upcoming" />)
          )}
        </div>
      </section>
    </CopilotToolShell>
  );
}
