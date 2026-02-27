import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const MONTHS = [
  { key: '2025-09', label: 'Sep', year: '2025' },
  { key: '2025-10', label: 'Okt', year: '2025' },
  { key: '2025-11', label: 'Nov', year: '2025' },
  { key: '2025-12', label: 'Dec', year: '2025' },
  { key: '2026-01', label: 'Jan', year: '2026' },
  { key: '2026-02', label: 'Feb', year: '2026' },
];

const CURRENT = '2026-02';

export default function TimeMachine({ selectedMonth, onSelectMonth }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 80, behavior: 'smooth' });
    }
  };

  const isHistoric = selectedMonth && selectedMonth !== CURRENT;

  return (
    <div className="space-y-2">
      {isHistoric && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300 font-medium">Historisk vy – simulerade data för {MONTHS.find(m => m.key === selectedMonth)?.label} {MONTHS.find(m => m.key === selectedMonth)?.year}</span>
          <button
            onClick={() => onSelectMonth(CURRENT)}
            className="ml-auto text-xs text-amber-400 underline hover:text-amber-200"
          >
            Tillbaka till nu
          </button>
        </motion.div>
      )}

      <div className="relative flex items-center gap-2">
        <button onClick={() => scroll(-1)} className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1" style={{ scrollbarWidth: 'none' }}>
          {MONTHS.map((m) => {
            const isSelected = (selectedMonth || CURRENT) === m.key;
            const isCurrent = m.key === CURRENT;
            return (
              <motion.button
                key={m.key}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectMonth(m.key)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all relative"
                style={isSelected
                  ? { background: isCurrent ? 'rgba(99,102,241,0.25)' : 'rgba(245,158,11,0.18)', border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.5)' : 'rgba(245,158,11,0.4)'}` }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                <span className={`text-xs font-bold ${isSelected ? (isCurrent ? 'text-indigo-300' : 'text-amber-300') : 'text-slate-400'}`}>
                  {m.label}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>{m.year}</span>
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <button onClick={() => scroll(1)} className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}