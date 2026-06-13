import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Zap, CheckCircle2, ScanLine, FileText, BarChart3 } from 'lucide-react';

const STEPS = [
  { text: 'Läser av 142 transaktioner...', duration: 900 },
  { text: 'Identifierar återkommande utgifter...', duration: 800 },
  { text: 'Klassificerar kostnader mot BAS-kontoplanen...', duration: 1000 },
  { text: 'Matchar kvitton mot Skatteverkets regler...', duration: 900 },
  { text: 'Beräknar momsunderlag och avdragsrätt...', duration: 800 },
  { text: 'Klart! Vi hittade 4 200 kr i potentiella skatteavdrag.', duration: 0, done: true },
];

const DEMO_FILES = [
  { name: 'kontoutdrag_mars_2026.pdf', size: '148 KB', Icon: FileText },
  { name: 'bokforing_q1_2026.csv', size: '32 KB', Icon: BarChart3 },
];

export default function MagicImport({ onClose, onComplete }) {
  const [phase, setPhase] = useState('upload'); // upload | processing | done
  const [stepIdx, setStepIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const startProcessing = () => {
    setPhase('processing');
    let i = 0;
    const run = () => {
      if (i >= STEPS.length - 1) {
        setStepIdx(STEPS.length - 1);
        setTimeout(() => setPhase('done'), 600);
        return;
      }
      setStepIdx(i);
      setTimeout(() => { i++; run(); }, STEPS[i].duration);
    };
    run();
  };

  const handleComplete = () => {
    localStorage.setItem('anchor_imported', 'true');
    onComplete?.();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        className="w-full max-w-md rounded-t-2xl overflow-hidden"
        style={{ background: '#0F1724', boxShadow: 'var(--anchor-shadow-1)', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.2)', boxShadow: 'var(--anchor-shadow-1)' }}>
              <ScanLine className="w-4 h-4" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>Magic Import</p>
              <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Vi strukturerar din ekonomiavdelning</p>
            </div>
          </div>
          {phase !== 'processing' && (
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
            </button>
          )}
        </div>

        <div className="px-5 py-5">

          {/* UPLOAD PHASE */}
          <AnimatePresence mode="wait">
            {phase === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-base font-bold text-center leading-snug" style={{ color: '#F0EAD6' }}>
                  Ladda upp ditt kontoutdrag så bygger Anchor din ekonomiavdelning på 5 sekunder.
                </p>

                {/* Drag & drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); startProcessing(); }}
                  className="cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-3 py-10 transition-all"
                  style={{
                    border: `2px dashed ${dragOver ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.3)'}`,
                    background: dragOver ? 'rgba(212,175,55,0.07)' : 'rgba(212,175,55,0.03)',
                  }}>
                  <input ref={inputRef} type="file" accept=".pdf,.csv,.xlsx" className="hidden" onChange={startProcessing} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.15)', boxShadow: 'var(--anchor-shadow-1)' }}>
                    <Upload className="w-6 h-6" style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>Dra & släpp din fil här</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.5)' }}>PDF, CSV eller Excel · Krypterat & säkert</p>
                  </div>
                </div>

                {/* Demo files */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-center"
                    style={{ color: 'rgba(155,173,184,0.4)' }}>
                    Eller testa med en demofil
                  </p>
                  <div className="space-y-2">
                    {DEMO_FILES.map(f => (
                      <button key={f.name} onClick={startProcessing}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                        style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'var(--anchor-shadow-1)' }}>
                        <f.Icon className="w-5 h-5" style={{ color: '#D4AF37' }} aria-hidden />
                        <div>
                          <p className="text-xs font-bold" style={{ color: '#F0EAD6' }}>{f.name}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.45)' }}>{f.size}</p>
                        </div>
                        <div className="ml-auto">
                          <div className="px-3 py-1.5 rounded-full text-[11px] font-bold"
                            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', boxShadow: 'var(--anchor-shadow-1)' }}>
                            Använd →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROCESSING PHASE */}
            {phase === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-6 space-y-6">
                {/* Animated orb */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid transparent', borderTopColor: '#D4AF37', borderRightColor: 'rgba(212,175,55,0.3)' }}
                    />
                    <div className="absolute inset-2 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.1)' }}>
                      <Zap className="w-6 h-6" style={{ color: '#D4AF37' }} />
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {STEPS.map((step, i) => {
                    const active = i === stepIdx;
                    const done = i < stepIdx;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= stepIdx ? 1 : 0.25, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: done || step.done ? 'rgba(61,170,122,0.2)' : active ? 'rgba(212,175,55,0.2)' : 'transparent',
                            boxShadow: 'var(--anchor-shadow-1)',
                          }}>
                          {(done || (step.done && active)) ? (
                            <CheckCircle2 className="w-3 h-3" style={{ color: '#3DAA7A' }} />
                          ) : active ? (
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                              className="w-2 h-2 rounded-full" style={{ background: '#D4AF37' }} />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(155,173,184,0.2)' }} />
                          )}
                        </div>
                        <p className="text-sm"
                          style={{ color: step.done && active ? '#3DAA7A' : active ? '#F0EAD6' : done ? 'rgba(155,173,184,0.6)' : 'rgba(155,173,184,0.25)' }}>
                          {step.text}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DONE PHASE */}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-4 space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(61,170,122,0.15)', border: '2px solid rgba(61,170,122,0.4)' }}>
                    <CheckCircle2 className="w-10 h-10" style={{ color: '#3DAA7A' }} />
                  </div>
                </div>

                <div>
                  <p className="text-xl font-black" style={{ color: '#F0EAD6' }}>Importen är klar!</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(155,173,184,0.6)' }}>142 transaktioner analyserade</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Bokförda', value: '138', color: '#3DAA7A' },
                    { label: 'Granskas', value: '4', color: '#D4AF37' },
                    { label: 'Skatteavdrag', value: '4 200 kr', color: '#4B7CF3' },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'var(--anchor-shadow-1)' }}>
                      <p className="text-base font-black" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(155,173,184,0.5)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <button onClick={handleComplete}
                  className="w-full h-12 rounded-xl font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #C8923A)', color: '#0F1724' }}>
                  Öppna din dashboard →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}