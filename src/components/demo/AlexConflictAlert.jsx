import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';

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
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D69E2E' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#D69E2E' }}>
              Sparmålskollision — Japan vs Macbook
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A5568' }}>
              Din plan att spara <strong>3 000 kr extra/mån</strong> för "Ny Macbook" gör att din
              Safe-to-Spend hamnar under din trygghetsgräns på 4 000 kr.
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(214,158,46,0.04)', borderTop: '1px solid rgba(214,158,46,0.15)' }}>
        <Zap className="w-3 h-3" style={{ color: '#D69E2E' }} />
        <p className="text-[11px] font-semibold" style={{ color: 'rgba(214,158,46,0.85)' }}>
          AI-förslag: Sänk Macbook-målet till 1 500 kr/mån för att behålla trygghetsmarginal
        </p>
      </div>
    </motion.div>
  );
}