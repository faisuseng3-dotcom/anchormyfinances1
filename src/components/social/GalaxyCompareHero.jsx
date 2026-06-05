import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Radio } from 'lucide-react';
import { createPageUrl } from '@/utils';
import TechHero from '@/components/ui/TechHero';
import { dashLabel, dashPill } from '@/lib/appSurface';

export default function GalaxyCompareHero({
  publishedCount = 0,
  exampleCount = 0,
  isPublished = false,
  hasIncome = false,
}) {
  const total = publishedCount + exampleCount;

  return (
    <TechHero label="Jämför" title="Så fördelar andra sin lön" accent="violet">
      <div className="flex flex-wrap gap-2 mt-4">
        <span className={dashPill}>
          <Users className="w-3 h-3" />
          {total} profiler
        </span>
        {publishedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-emerald-500/12 text-emerald-200/90 ring-1 ring-emerald-500/25">
            {publishedCount} live
          </span>
        )}
        {isPublished && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-violet-500/15 text-violet-200/90 ring-1 ring-violet-400/25">
            <Radio className="w-3 h-3" />
            Synlig
          </span>
        )}
      </div>

      {!hasIncome && (
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <p className="text-[14px] text-white/55 font-light leading-relaxed">
            Lägg in inkomst för belopp i kronor och för att kopiera budgetmallar.
          </p>
          <Link
            to={createPageUrl('Settings')}
            className="text-[13px] font-medium text-cyan-300/90 mt-2 inline-block no-underline"
          >
            Inställningar →
          </Link>
        </div>
      )}

      <p className={`${dashLabel} mt-4`}>
        Publicerat = det du valt att dela. Exempel = illustration.
      </p>
    </TechHero>
  );
}
