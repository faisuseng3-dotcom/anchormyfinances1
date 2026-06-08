// @ts-nocheck
import React from 'react';
import { ChevronDown } from 'lucide-react';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

/** Hopfällbar inställningspanel med elevation och 48dp trigger. */
export default function SettingsPanel({ icon: Icon, title, subtitle, open, onToggle, children }) {
  return (
    <div className="anchor-settings-panel">
      <AnchorPressable
        type="button"
        onClick={onToggle}
        minTouch={false}
        className="anchor-settings-panel-trigger"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-[var(--color-accent)] shrink-0" />}
          <span>
            <span className="block text-[14px] font-medium text-white/85">{title}</span>
            {subtitle && (
              <span className="block text-[12px] text-white/45 mt-0.5">{subtitle}</span>
            )}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/35 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </AnchorPressable>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">{children}</div>
      )}
    </div>
  );
}

export function SettingsRowIcon({ icon: Icon, muted = false }) {
  return (
    <div
      className={`w-11 h-11 rounded-[var(--anchor-radius-lg)] flex items-center justify-center anchor-elev-1 ${
        muted
          ? 'bg-white/[0.05] ring-1 ring-white/[0.08]'
          : 'bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/20'
      }`}
    >
      <Icon className={`w-5 h-5 ${muted ? 'text-white/55' : 'text-[var(--color-accent)]'}`} />
    </div>
  );
}
