import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Eye, BarChart2, Ghost, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  anchorSecondaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';

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
      <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${level.color}18`, border: `1px solid ${level.color}35` }}
          >
            <Icon className="w-5 h-5" style={{ color: level.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={sectionTitleClass}>{level.title}</p>
            <p className={`${sectionSubtitleClass} mt-1`}>{level.compare}</p>
          </div>
        </div>

        {isPublished && (
          <p className={`${sectionMetaClass} mt-3 flex items-center gap-1.5 text-emerald-200/90`}>
            <Radio className="w-3.5 h-3.5" />
            Din ekonomi är publicerad i Jämför
          </p>
        )}
      </div>

      <Link
        to={`${createPageUrl('Galaxy')}`}
        className={`${anchorSecondaryButtonClass} w-full no-underline h-12 text-[14px]`}
      >
        {canPublish
          ? isPublished
            ? 'Hantera publicering i Jämför'
            : 'Publicera i Jämför'
          : 'Öppna Jämför'}
        <ChevronRight className="w-4 h-4" />
      </Link>

      {!username && (
        <p className={sectionMetaClass}>
          Sätt @användarnamn under Profil innan du publicerar i Jämför.
        </p>
      )}
    </div>
  );
}
