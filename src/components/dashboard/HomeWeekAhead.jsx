import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getUpcomingPreview } from '@/lib/planCalendarEngine';
import { mergePlannedEvents } from '@/lib/plannedEventsStorage';
import { anchorZoneClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function HomeWeekAhead({ profile }) {
  if (!profile?.income) return null;

  const enriched = { ...profile, plannedEvents: mergePlannedEvents(profile) };
  const upcoming = getUpcomingPreview(enriched, 4);
  if (!upcoming.length) return null;

  return (
    <div className={anchorZoneClass}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[15px] font-semibold text-white">Denna vecka</p>
        <Link
          to={createPageUrl('FuturePulse')}
          className="flex items-center gap-0.5 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors no-underline"
        >
          Planera
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.05]">
        {upcoming.map((ev, i) => (
          <div key={`${ev.id}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: ev.color || '#6B9FFF' }}
            />
            <span className="text-[12px] text-white/40 w-14 flex-shrink-0 tabular-nums">{ev.dayLabel}</span>
            <span className="text-[14px] text-white/85 truncate flex-1">{ev.title}</span>
            {ev.amount !== 0 && (
              <span className="text-[13px] text-white/45 tabular-nums flex-shrink-0">
                {ev.amount > 0 ? '+' : '−'}
                {Math.abs(ev.amount).toLocaleString('sv-SE')}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className={`${sectionSubtitleClass} mt-2`}>
        Abonnemang och det du planerat visas automatiskt i kalendern.
      </p>
    </div>
  );
}
