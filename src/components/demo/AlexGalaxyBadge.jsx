import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock } from 'lucide-react';

/**
 * Visar Alex Galaxy-status och nästa låsta achievement.
 * Används på Galaxy-sidan när Alex Mode är aktivt.
 */
export default function AlexGalaxyBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(96,165,250,0.08))', border: '1.5px solid rgba(167,139,250,0.3)' }}
    >
      {/* Current level */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>GALAXY NIVÅ</p>
          <p className="text-base font-black" style={{ color: '#a78bfa' }}>Star Cadet ⭐</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>XP</p>
          <p className="text-sm font-bold text-white">2 850</p>
        </div>
      </div>

      {/* Next achievement */}
      <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <div className="flex-1">
          <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Snart där! — <span style={{ color: '#a78bfa' }}>Buffert-kungen</span> 👑
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Spara 500 kr till för att låsa upp denna achievement
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-12 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full" style={{ width: '90%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)' }} />
        </div>
      </div>
    </motion.div>
  );
}