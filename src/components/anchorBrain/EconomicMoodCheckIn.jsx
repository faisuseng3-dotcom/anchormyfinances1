import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { MOOD_OPTIONS, moodToToneMode } from '@/lib/anchorBrain';
import { sectionMetaClass, sectionSubtitleClass, anchorPrimaryButtonClass } from '@/lib/anchorTheme';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function EconomicMoodCheckIn({ onComplete }) {
  const [selected, setSelected] = React.useState(null);

  const handleContinue = () => {
    if (!selected) return;
    onComplete({
      sessionMood: selected,
      sessionMoodDate: todayKey(),
      toneMode: moodToToneMode(selected),
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-4"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div>
          <p className={sectionMetaClass}>Först känslan, sedan siffrorna</p>
          <h2 className="text-[17px] font-semibold text-white mt-0.5">
            Hur mår din ekonomi idag?
          </h2>
          <p className={`${sectionSubtitleClass} mt-1`}>
            Stress och pengar hänger ihop — vi anpassar tonen innan du ser belopp.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {MOOD_OPTIONS.map((m) => {
          const on = selected === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={`w-full text-left rounded-xl px-3.5 py-3 border transition-colors ${
                on
                  ? 'border-[#6B9FFF]/50 bg-[#6B9FFF]/12'
                  : 'border-white/[0.08] bg-white/[0.03]'
              }`}
            >
              <p className="text-[15px] font-medium text-white">{m.label}</p>
              <p className="text-[13px] text-white/45 mt-0.5">{m.sub}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={handleContinue}
        className={`${anchorPrimaryButtonClass} w-full mt-4`}
      >
        Fortsätt till min pengometer
      </button>
    </motion.section>
  );
}
