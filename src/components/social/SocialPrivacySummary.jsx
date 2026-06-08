import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Eye, BarChart2, Ghost, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { dashLabel, dashPill } from '@/lib/appSurface';
import { surface } from '@/lib/designTokens';

const LEVEL_COPY = {
  full: {
    Icon: Eye,
    title: 'Full delning',
    compare: 'I Jämför kan andra se kronor och procent om du publicerar.',
    iconWrap: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25',
  },
  hybrid: {
    Icon: BarChart2,
    title: 'Hybrid',
    compare: 'I Jämför visas bara procent — inga kronbelopp — om du publicerar.',
    iconWrap: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/25',
  },
  ghost: {
    Icon: Ghost,
    title: 'Ghost-läge',
    compare: 'Du kan inte publicera ekonomi i Jämför i Ghost-läge.',
    iconWrap: 'bg-white/10 text-white/55 ring-white/15',
  },
};

export default function SocialPrivacySummary({ privacyLevel, isPublished, username }) {
  const level = LEVEL_COPY[privacyLevel] || LEVEL_COPY.hybrid;
  const Icon = level.Icon;
  const canPublish = privacyLevel !== 'ghost' && username;

  return (
    <div className="space-y-4">
      <div className={`${surface.card} px-4 py-4`}>
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-[var(--anchor-radius-lg)] flex items-center justify-center flex-shrink-0 ring-1 ${level.iconWrap}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="anchor-type-headline">{level.title}</p>
            <p className="anchor-type-body-sm mt-1 leading-relaxed">{level.compare}</p>
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
          className="w-full rounded-full h-11 bg-white/[0.08] text-white/90 ring-1 ring-white/[0.1] font-semibold text-[15px] flex items-center justify-center gap-1 no-underline anchor-pressable min-h-12"
        >
          Publicera i Jämför
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      {isPublished && (
        <span className={dashPill}>
          <Radio className="w-3 h-3 text-emerald-400" />
          Synlig i Jämför
        </span>
      )}
    </div>
  );
}
