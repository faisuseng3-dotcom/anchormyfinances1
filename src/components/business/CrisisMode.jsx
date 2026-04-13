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
        className="w-full rounded-3xl p-4 flex items-center gap-3"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(229,62,62,0.1)' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: '#E53E3E' }} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Krissimulatorn</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Simulera om intäkterna dippar</p>
        </div>
        <TrendingDown className="w-4 h-4" style={{ color: '#9AA5B4' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl overflow-hidden"
              style={{ background: '#F4F6F8', maxHeight: '85vh', overflowY: 'auto' }}>

              <div className="px-5 pt-5 pb-4 flex items-center justify-between bg-white"
                style={{ borderBottom: '1px solid #F0F2F5' }}>
                <div>
                  <p className="font-black text-sm" style={{ color: '#1A2332' }}>Krissimulatorn</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>
                    Vad kan du skära om försäljningen stannar?
                  </p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#F4F6F8' }}>
                  <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
                </button>
              </div>

              {/* Live impact */}
              <div className="px-5 py-3 grid grid-cols-3 gap-2 bg-white"
                style={{ borderBottom: '1px solid #F0F2F5' }}>
                <div className="text-center">
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>Burn/mån</p>
                  <p className="text-sm font-black" style={{ color: '#E53E3E' }}>{monthlyBurn.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="text-center">
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>Du sparar</p>
                  <p className="text-sm font-black" style={{ color: '#0D7377' }}>-{totalSaved.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="text-center">
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>Ny Runway</p>
                  <p className="text-sm font-black" style={{ color: '#1A2332' }}>{newRunway} mån</p>
                </div>
              </div>

              <div className="px-5 py-3 space-y-2">
                {CUTS.map((c) => {
                  const selected = cut.includes(c.label);
                  return (
                    <button key={c.label} onClick={() => toggle(c.label)}
                      className="w-full p-4 rounded-2xl text-left transition-all"
                      style={{
                        background: selected ? 'rgba(13,115,119,0.06)' : '#fff',
                        border: `1.5px solid ${selected ? 'rgba(13,115,119,0.25)' : '#F0F2F5'}`,
                      }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: selected ? '#0D7377' : '#F4F6F8', border: selected ? 'none' : '1.5px solid #E8ECF0' }}>
                            {selected && <span className="text-[10px] text-white font-black">✓</span>}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>{c.label}</span>
                        </div>
                        <p className="text-sm font-black" style={{ color: selected ? '#0D7377' : '#E53E3E' }}>
                          {c.amount.toLocaleString('sv-SE')} kr/mån
                        </p>
                      </div>
                      {selected && (
                        <p className="text-xs mt-2 ml-7" style={{ color: '#0D7377' }}>
                          💡 {c.tip}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {cut.length > 0 && (
                <div className="px-5 pb-6">
                  <div className="p-4 rounded-2xl text-center"
                    style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.2)' }}>
                    <p className="text-sm font-black" style={{ color: '#0D7377' }}>
                      {newRunway} månaders runway med dessa åtgärder
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>
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