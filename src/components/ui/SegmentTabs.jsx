import React from 'react';

/**
 * iOS-style segmented control — no glass wrapper.
 */
export default function SegmentTabs({ value, onChange, tabs, className = '' }) {
  return (
    <div
      className={`flex p-1 rounded-xl bg-white/[0.08] ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
              active ? 'bg-white text-[#0a1628] shadow-sm' : 'text-white/55 hover:text-white/75'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
