import React from 'react';
import { motion } from 'framer-motion';
import { MOOD_OPTIONS, moodToToneMode } from '@/lib/anchorBrain';
import { dashLabel } from '@/lib/dashboardTheme';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function EconomicMoodCheckIn({ onComplete }) {
  const [selected, setSelected] = React.useState(null);

  const handlePick = (id) => {
    setSelected(id);
    onComplete({
      sessionMood: id,
      sessionMoodDate: todayKey(),
      toneMode: moodToToneMode(id),
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6 text-center"
    >
      <p className={dashLabel}>Innan siffrorna</p>
      <h2 className="text-[22px] font-light text-[var(--color-text-primary)] mt-2 tracking-tight">
        Hur känns ekonomin idag?
      </h2>

      <div className="flex flex-wrap justify-center gap-2.5 mt-6">
        {MOOD_OPTIONS.map((m) => {
          const on = selected === m.id;
          return (
            <motion.button
              key={m.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePick(m.id)}
              className={`px-5 py-3 rounded-full text-[14px] font-medium transition-all ${
                on
                  ? 'bg-[var(--color-accent)] text-white shadow-[var(--anchor-shadow-1)]'
                  : 'bg-white text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-background-secondary)]'
              }`}
            >
              {m.label}
            </motion.button>
          );
        })}
      </div>
      <p className="text-[12px] text-[var(--color-text-muted)] mt-4 max-w-[260px] mx-auto">
        Vi anpassar hur mycket som visas — inget skuldbeläggning.
      </p>
    </motion.section>
  );
}
