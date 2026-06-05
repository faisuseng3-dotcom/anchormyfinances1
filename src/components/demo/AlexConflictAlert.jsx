import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Zap } from 'lucide-react';

/**
 * Visar en aktiv konflikt-varning specifik för Alex Mode:
 * "Ny Macbook"-sparmålet krockar med Japan-resan och Safe-to-Spend.
 */
export default function AlexConflictAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ border: '1.5px solid rgba(214, 158, 46, 0.35)' }}
    >
      <div className="px-4 py-3" style={{ background: 'rgba(214,158,46,0.08)' }}>
        <div className="flex items-start gap-3">
          <Anchor className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D69E2E' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#D69E2E' }}>
              ⚓ Anchor
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A5568' }}>
              Jag ser att ditt nya sparmål för "Ny Macbook" krockar med din planerade hyra. Med 3 000 kr/mån extra hamnar din Safe-to-Spend under trygghetsgränsen.
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(214,158,46,0.04)', borderTop: '1px solid rgba(214,158,46,0.15)' }}>
        <Zap className="w-3 h-3" style={{ color: '#D69E2E' }} />
        <p className="text-[11px] font-semibold" style={{ color: 'rgba(214,158,46,0.85)' }}>
          Anchor rekommenderar: Sänk Macbook-målet till 1 500 kr/mån för att behålla trygghetsmarginalen
        </p>
      </div>
    </motion.div>
  );
}