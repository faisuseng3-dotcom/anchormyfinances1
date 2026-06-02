import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Radio, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function GalaxyCompareHero({
  publishedCount = 0,
  exampleCount = 0,
  isPublished = false,
  hasIncome = false,
}) {
  const total = publishedCount + exampleCount;

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-4 space-y-3 -mt-2 mb-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-white leading-snug">Jämför fördelningar</p>
          <p className={`${sectionSubtitleClass} mt-1`}>
            Se hur andra delar lönen — kopiera en mall till din egen månadsbudget.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-white/[0.06] text-white/70 border border-white/[0.08]">
          <Users className="w-3 h-3" />
          {total} profiler
        </span>
        {publishedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-emerald-500/10 text-emerald-200/90 border border-emerald-500/20">
            {publishedCount} publicerade
          </span>
        )}
        {isPublished && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#6B9FFF]/12 text-[#B8C9FF] border border-[#6B9FFF]/25">
            <Radio className="w-3 h-3" />
            Du är synlig
          </span>
        )}
      </div>

      {!hasIncome && (
        <div className="rounded-xl px-3 py-2.5 border border-amber-400/20 bg-amber-400/10 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-200/90 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] text-amber-100/95 leading-snug">
              Lägg in månadsinkomst för att se belopp i kronor och kopiera budgeter.
            </p>
            <Link
              to={createPageUrl('Settings')}
              className="text-[13px] font-semibold text-white mt-1 inline-block no-underline hover:text-white/90"
            >
              Gå till inställningar →
            </Link>
          </div>
        </div>
      )}

      <p className={sectionMetaClass}>
        Exempelprofiler är illustrationer. Publicerade visar bara det användaren valt att dela.
      </p>
    </div>
  );
}
