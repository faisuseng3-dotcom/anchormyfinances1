import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Radio, GitBranch } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { dashLabel, dashPill } from '@/lib/appSurface';

export default function GalaxyCompareHero({
  publishedCount = 0,
  exampleCount = 0,
  isPublished = false,
  hasIncome = false,
}) {
  const total = publishedCount + exampleCount;

  return (
    <div className="anchor-premium-hero mb-6 -mt-1">
      <div className="relative z-10 anchor-hero-asymmetric">
        <div className="min-w-0 pr-4">
          <p className={dashLabel}>Jämför</p>
          <p className="anchor-type-headline text-[17px] mt-1">
            Så fördelar andra sin lön
          </p>
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/25">
                <Radio className="w-3 h-3" />
                Synlig
              </span>
            )}
          </div>

          {!hasIncome && (
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              <p className="anchor-type-body-sm leading-relaxed">
                Lägg in inkomst för belopp i kronor och för att kopiera budgetmallar.
              </p>
              <Link
                to={createPageUrl('Settings')}
                className="text-[13px] font-medium text-[var(--color-accent)] mt-2 inline-block no-underline anchor-pressable"
              >
                Inställningar →
              </Link>
            </div>
          )}

          <p className={`${dashLabel} mt-4`}>
            Publicerat = det du valt att dela. Exempel = illustration.
          </p>
        </div>
        <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/20 flex items-center justify-center anchor-elev-1 shrink-0">
          <GitBranch className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
      </div>
    </div>
  );
}
