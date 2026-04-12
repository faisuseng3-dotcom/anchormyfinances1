import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingDown, Scissors } from 'lucide-react';

const CUTS = [
  { label: 'Adobe Creative Cloud', amount: 1095, category: 'Programvara', priority: 'Hög', tip: 'Använd Canva gratis-tiers' },
  { label: 'Slack Pro', amount: 380, category: 'Kommunikation', priority: 'Hög', tip: 'Gratis-planen räcker för <10 pers' },
  { label: 'Kontorslokal', amount: 8500, category: 'Lokal', priority: 'Medium', tip: 'Co-working 2 dgr/vecka = 2 800 kr' },
  { label: 'LinkedIn Premium', amount: 749, category: 'Marknadsföring', priority: 'Låg', tip: 'Pausa under krisperioden' },
  { label: 'Representationsmiddagar', amount: 3200, category: 'Representation', priority: 'Låg', tip: 'Digitala möten istället' },
];

const priorityColor = { 'Hög': '#D95F5F', 'Medium': '#C8923A', 'Låg': '#3DAA7A' };

export default function CrisisMode({ monthlyBurn = 45000 }) {
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState([]);

  const totalSaved = CUTS.filter(c => cut.includes(c.label)).reduce((s, c) => s + c.amount, 0);
  const newBurn = monthlyBurn - totalSaved;
  const newRunway = Math.round((150000 / newBurn) * 10) / 10; // assuming 150k cash

  const toggle = (label) => setCut(c => c.includes(label) ? c.filter(x => x !== label) : [...c, label]);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(217,95,95,0.08)', border: '1px solid rgba(217,95,95,0.3)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(217,95,95,0.15)', border: '1px solid rgba(217,95,95,0.4)' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: '#D95F5F' }} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold" style={{ color: '#D95F5F' }}>CRISIS MODE</p>
          <p className="text-xs" style={{ color: 'rgba(155,173,184,0.55)' }}>Simulera om intäkterna dippar — vad kan du skära?</p>
        </div>
        <TrendingDown className="w-4 h-4" style={{ color: 'rgba(217,95,95,0.5)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl overflow-hidden"
              style={{ background: '#1A2B3C', maxHeight: '85vh', overflowY: 'auto' }}>

              <div className="px-5 pt-5 pb-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="font-black text-sm" style={{ color: '#D95F5F' }}>⚠️ Crisis Mode — Kostnadsanalys</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(155,173,184,0.5)' }}>
                    Bocka av vad du kan skära om försäljningen stannar
                  </p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
                </button>
              </div>

              {/* Live impact */}
              <div className="px-5 py-3 grid grid-cols-3 gap-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(217,95,95,0.05)' }}>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Burn/mån nu</p>
                  <p className="text-sm font-black" style={{ color: '#D95F5F' }}>{monthlyBurn.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Du sparar</p>
                  <p className="text-sm font-black" style={{ color: '#3DAA7A' }}>-{totalSaved.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Ny Runway</p>
                  <p className="text-sm font-black" style={{ color: '#D4AF37' }}>{newRunway} mån</p>
                </div>
              </div>

              <div className="px-5 py-3 space-y-2">
                {CUTS.map((c) => {
                  const selected = cut.includes(c.label);
                  return (
                    <button key={c.label} onClick={() => toggle(c.label)}
                      className="w-full p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? 'rgba(61,170,122,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected ? 'rgba(61,170,122,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: selected ? '#3DAA7A' : 'rgba(255,255,255,0.1)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                            {selected && <span className="text-[10px] text-white font-black">✓</span>}
                          </div>
                          <span className="text-xs font-bold" style={{ color: '#F0EAD6' }}>{c.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black" style={{ color: selected ? '#3DAA7A' : '#D95F5F' }}>
                            {selected ? '-' : ''}{c.amount.toLocaleString('sv-SE')} kr/mån
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: `${priorityColor[c.priority]}20`, color: priorityColor[c.priority] }}>
                            {c.priority}
                          </span>
                        </div>
                      </div>
                      {selected && (
                        <p className="text-[10px] mt-1.5 ml-6" style={{ color: 'rgba(61,170,122,0.8)' }}>
                          💡 {c.tip}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {cut.length > 0 && (
                <div className="px-5 pb-5">
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(61,170,122,0.1)', border: '1px solid rgba(61,170,122,0.3)' }}>
                    <p className="text-sm font-black" style={{ color: '#3DAA7A' }}>
                      Med dessa nedskärningar överlever du {newRunway} månader till
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.5)' }}>
                      Ny månadskostnad: {newBurn.toLocaleString('sv-SE')} kr
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}