import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getUpcomingPreview } from '@/lib/planCalendarEngine';
import { mergePlannedEvents } from '@/lib/plannedEventsStorage';
import { dashLabel, dashTimelineDot } from '@/lib/dashboardTheme';

export default function HomeWeekAhead({ profile }) {
  if (!profile?.income) return null;

  const enriched = { ...profile, plannedEvents: mergePlannedEvents(profile) };
  const upcoming = getUpcomingPreview(enriched, 5);
  if (!upcoming.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className={dashLabel}>Kommande</p>
        <Link
          to={createPageUrl('FuturePulse')}
          className="flex items-center gap-0.5 text-[13px] font-medium text-white/45 hover:text-white/75 no-underline"
        >
          Kalender
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="relative pl-4">
        <div className="absolute left-[3px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/40 via-white/10 to-transparent" />
        <ul className="space-y-4">
          {upcoming.map((ev, i) => (
            <li key={`${ev.id}-${i}`} className="flex items-center gap-3 relative">
              <span
                className={`${dashTimelineDot} absolute -left-4 top-2`}
                style={{ background: ev.color || '#5eead4' }}
              />
              <span className="text-[12px] text-white/38 w-12 flex-shrink-0 tabular-nums">{ev.dayLabel}</span>
              <span className="text-[15px] text-white/80 truncate flex-1 font-light">{ev.title}</span>
              {ev.amount !== 0 && (
                <span className="text-[13px] text-white/40 tabular-nums flex-shrink-0">
                  {ev.amount > 0 ? '+' : '−'}
                  {Math.abs(ev.amount).toLocaleString('sv-SE')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
