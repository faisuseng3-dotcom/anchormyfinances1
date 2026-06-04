import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Eye, BarChart2, Ghost, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorSecondaryButtonClass } from '@/lib/anchorTheme';
import { dashLabel, dashPill, techInset, techInsetBg } from '@/lib/appSurface';

const LEVEL_COPY = {
  full: {
    Icon: Eye,
    title: 'Full delning',
    compare: 'I Jämför kan andra se kronor och procent om du publicerar.',
    color: '#34D399',
  },
  hybrid: {
    Icon: BarChart2,
    title: 'Hybrid',
    compare: 'I Jämför visas bara procent — inga kronbelopp — om du publicerar.',
    color: '#9FB5FF',
  },
  ghost: {
    Icon: Ghost,
    title: 'Ghost-läge',
    compare: 'Du kan inte publicera ekonomi i Jämför i Ghost-läge.',
    color: '#94A3B8',
  },
};

export default function SocialPrivacySummary({ privacyLevel, isPublished, username }) {
  const level = LEVEL_COPY[privacyLevel] || LEVEL_COPY.hybrid;
  const Icon = level.Icon;
  const canPublish = privacyLevel !== 'ghost' && username;

  return (
    <div className="space-y-4">
      <div className={`${techInset} px-4 py-4`}>
        <div className={techInsetBg} />
        <div className="relative z-10 flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ring-inset"
            style={{ background: `${level.color}15`, borderColor: `${level.color}30` }}
          >
            <Icon className="w-5 h-5" style={{ color: level.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-medium text-white">{level.title}</p>
            <p className="text-[13px] text-white/45 mt-1 font-light leading-relaxed">{level.compare}</p>
            {username && (
              <p className={`${dashLabel} mt-2`}>
                @{username}
                {isPublished ? ' · publicerad i Jämför' : ' · inte publicerad'}
              </p>
            )}
          </div>
        </div>
      </div>

      {canPublish && !isPublished && (
        <Link
          to={`${createPageUrl('Galaxy')}?tab=compare`}
          className={`${anchorSecondaryButtonClass} w-full rounded-full h-11 no-underline flex items-center justify-center gap-1`}
        >
          Publicera i Jämför
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      {isPublished && (
        <span className={dashPill}>
          <Radio className="w-3 h-3 text-emerald-400" />
          Synlig i Galaxy
        </span>
      )}
    </div>
  );
}
