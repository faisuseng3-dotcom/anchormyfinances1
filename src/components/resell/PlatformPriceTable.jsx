import React from 'react';
import { ExternalLink } from 'lucide-react';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

export default function PlatformPriceTable({ platformPrices = [], recommendedPlatform, result }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-white/45 mb-1">Pris på plattformar</p>
      {platformPrices.map((platform, i) => {
        const isTop = platform.name === recommendedPlatform;
        return (
          <React.Fragment key={platform.name}>
            {i > 0 && <DashboardDivider />}
            <a
              href={platform.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline active:opacity-70"
            >
              <DashboardListRow
                title={platform.name}
                subtitle={platform.reason}
                trailing={
                  <span className="flex items-center gap-1 text-[15px] font-semibold tabular-nums text-white">
                    {platform.estimatedPrice.toLocaleString('sv-SE')} {platform.currency}
                    <ExternalLink className="w-3.5 h-3.5 text-white/30" />
                  </span>
                }
                trailingClassName=""
              />
              {isTop && (
                <p className="text-[12px] text-emerald-300/80 -mt-2 mb-1 pl-12">Rekommenderad</p>
              )}
            </a>
          </React.Fragment>
        );
      })}
      {result?.recommendedPlatformReason && (
        <>
          <DashboardDivider className="my-3" />
          <p className={sectionSubtitleClass}>{result.recommendedPlatformReason}</p>
        </>
      )}
    </div>
  );
}
