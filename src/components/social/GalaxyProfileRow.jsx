// @ts-nocheck
import React from 'react';
import { DashboardListRow } from '@/components/dashboard/DashboardChrome';
import { cn } from '@/lib/utils';
import { formatMatchLabel } from '@/lib/galaxyProfiles';
import ProfileAvatar from './ProfileAvatar';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

function BudgetMiniBar({ items = [] }) {
  const segments = items.filter((i) => (i.pct || 0) > 0).slice(0, 5);
  if (!segments.length) return null;

  return (
    <div
      className="flex h-2 w-[72px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[var(--color-border)]"
      aria-hidden
    >
      {segments.map((item) => (
        <div
          key={item.key || item.label}
          style={{
            width: `${Math.max(item.pct, 4)}%`,
            background: item.color || 'var(--color-accent)',
          }}
        />
      ))}
    </div>
  );
}

export default function GalaxyProfileRow({
  profile,
  subtitle,
  onOpen,
  matchScore: score = 0,
  showMatch = false,
}) {
  const matchLabel = showMatch && score > 0 ? formatMatchLabel(score) : null;
  const items = profile.finance?.items || profile.economy_snapshot?.items || [];
  const savingsLabel = `${profile.savings_rate ?? 0} % sparar`;
  const badge = profile.isOwn ? 'Du' : profile.isDemo ? 'Exempel' : null;
  const subtitleLine = [badge, subtitle].filter(Boolean).join(' · ');

  return (
    <AnchorPressable
      type="button"
      onClick={() => onOpen(profile)}
      className="w-full text-left rounded-[var(--anchor-radius-md)]"
      minTouch={false}
    >
      <DashboardListRow
        leading={<ProfileAvatar profile={profile} size={44} />}
        title={profile.display_name}
        subtitle={subtitleLine}
        trailing={
          <div className="flex flex-col items-end gap-1.5 max-w-[46%]">
            {matchLabel && (
              <span className="text-[11px] font-semibold text-[var(--color-accent)] tabular-nums">
                {matchLabel}
              </span>
            )}
            <div className="flex items-center gap-2">
              <BudgetMiniBar items={items} />
              <span
                className={cn(
                  'text-[13px] font-medium tabular-nums text-right truncate',
                  profile.highlight ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                )}
              >
                {profile.highlight || savingsLabel}
              </span>
            </div>
          </div>
        }
        trailingClassName=""
      />
    </AnchorPressable>
  );
}
