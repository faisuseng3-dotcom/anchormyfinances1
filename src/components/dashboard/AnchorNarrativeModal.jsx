import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Anchor } from 'lucide-react';

const ALEX_NARRATIVE = {
  intro: 'Alex, din ekonomi är i utmärkt form.',
  points: [
    {
      icon: '💪',
      label: 'Styrka',
      text: 'Du har ovanligt låga fasta kostnader i förhållande till din inkomst. Det är din största superkraft.',
    },
    {
      icon: '📉',
      label: 'Disciplin',
      text: 'Du håller budgeten starkt denna månad. Inga tecken på onödigt "läckage" i vardagen.',
    },
    {
      icon: '💰',
      label: 'Sparande',
      text: 'Du är extremt bra på att spara. Ditt fokus på Japan-resan ger resultat snabbare än väntat.',
    },
  ],
  closing: 'Du har byggt en trygg maskin. Fortsätt prioritera de fasta kostnaderna så lågt som de är nu, så har du total frihet.',
};

export default function AnchorNarrativeModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #080c1a 0%, #0a1020 100%)',
              border: '1px solid rgba(15,222,189,0.18)',
              borderBottom: 'none',
              maxHeight: '85vh',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <div className="px-6 pb-10 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 32px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mt-2 mb-6">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5" style={{ color: '#0FDEBD' }} />
                  <div>
                    <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(15,222,189,0.6)' }}>ANCHOR</p>
                    <p className="text-base font-black" style={{ color: '#fff' }}>Din ekonomi</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>

              {/* Intro */}
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={{ background: 'rgba(15,222,189,0.07)', border: '1px solid rgba(15,222,189,0.15)' }}
              >
                <p className="text-sm font-semibold italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  "{ALEX_NARRATIVE.intro}"
                </p>
              </div>

              {/* Bullet points */}
              <div className="space-y-5 mb-8">
                {ALEX_NARRATIVE.points.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{point.icon}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#0FDEBD' }}>
                        {point.label}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {point.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Closing */}
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>Kort sagt:</span>{' '}
                  {ALEX_NARRATIVE.closing}
                </p>
              </div>

              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-sm font-black tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,222,189,0.18), rgba(13,115,119,0.12))',
                  border: '1px solid rgba(15,222,189,0.30)',
                  color: '#0FDEBD',
                }}
              >
                Jag fattar, tack Anchor! ⚓
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}