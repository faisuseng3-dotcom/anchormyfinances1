import React, { useRef } from 'react';

export default function DayPicker({ value, onChange, label, hint }) {
  const scrollRef = useRef(null);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-slate-300">{label}</p>}
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
                ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', boxShadow: 'var(--anchor-shadow-1)' }
              }
            >
              {d}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}