// @ts-nocheck
import React from 'react';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

/** iOS-style segmented control med 48dp touch-targets. */
export default function SegmentTabs({ value, onChange, tabs, className = '' }) {
  return (
    <div
      className={`flex p-1 rounded-[var(--anchor-radius-md)] bg-[var(--color-background-secondary)] shadow-[var(--anchor-shadow-1)] anchor-elev-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <AnchorPressable
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            minTouch={false}
            className={`anchor-btn anchor-btn--compact anchor-btn--rounded flex-1 flex items-center justify-center gap-2 py-2.5 min-h-11 ${
              active
                ? 'bg-white text-[var(--color-text-primary)] anchor-elev-1'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </AnchorPressable>
        );
      })}
    </div>
  );
}
