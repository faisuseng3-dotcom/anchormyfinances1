import React, { useRef } from 'react';

export default function DayPicker({ value, onChange, label, hint }) {
  const scrollRef = useRef(null);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {days.map((d) => {
          const isSelected = value === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className="flex-shrink-0 w-10 h-10 rounded-xl text-sm font-semibold transition-all"
              style={isSelected
                ? { background: 'var(--color-accent)', color: '#fff' }
                : { background: '#FFFFFF', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
              }
            >
              {d}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}