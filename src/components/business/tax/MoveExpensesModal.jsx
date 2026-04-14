import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRIVATE_PURCHASES = [
  { id: 1, vendor: 'Kjell & Company', amount: 649, category: 'Kontorsmaterial', date: '8 apr' },
  { id: 2, vendor: 'IKEA', amount: 1299, category: 'Kontorsmöbler', date: '5 apr' },
  { id: 3, vendor: 'Elgiganten', amount: 899, category: 'Elektronik', date: '2 apr' },
  { id: 4, vendor: 'Clas Ohlson', amount: 349, category: 'Kontorsmaterial', date: '29 mar' },
];

export default function MoveExpensesModal({ onClose, onConfirm }) {
  const [selected, setSelected] = useState([1, 2, 3, 4]);
  const [step, setStep] = useState(1); // 1=list, 2=success
  const [loading, setLoading] = useState(false);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const selectedItems = PRIVATE_PURCHASES.filter(p => selected.includes(p.id));
  const totalSaving = Math.round(selectedItems.reduce((s, p) => s + p.amount, 0) * 0.3);
  const totalAmount = selectedItems.reduce((s, p) => s + p.amount, 0);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#0D7377', '#3DAA7A', '#fff'] });
      if (onConfirm) onConfirm(totalSaving);
    }, 900);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#fff', maxHeight: '85vh', overflowY: 'auto' }}>

        {step === 1 ? (
          <>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #F0F2F5' }}>
              <div>
                <p className="text-base font-black" style={{ color: '#1A2332' }}>Flytta privata inköp</p>
                <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>Välj vilka som hör till företaget</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#F4F6F8' }}>
                <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-2">
              {PRIVATE_PURCHASES.map(p => {
                const isSelected = selected.includes(p.id);
                return (
                  <motion.button key={p.id} onClick={() => toggle(p.id)} whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(13,115,119,0.06)' : '#F4F6F8',
                      border: isSelected ? '1.5px solid rgba(13,115,119,0.25)' : '1.5px solid transparent',
                    }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? '#0D7377' : '#E8ECF0' }}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{p.vendor}</p>
                      <p className="text-xs" style={{ color: '#9AA5B4' }}>{p.category} · {p.date}</p>
                    </div>
                    <p className="text-sm font-black" style={{ color: '#1A2332' }}>
                      {p.amount.toLocaleString('sv-SE')} kr
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {selectedItems.length > 0 && (
              <div className="px-5 pb-6 space-y-3">
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,115,119,0.06)' }}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#4A5568' }}>Totalt att flytta</span>
                    <span className="font-bold" style={{ color: '#1A2332' }}>{totalAmount.toLocaleString('sv-SE')} kr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#4A5568' }}>Skatteeffekt (ca 30%)</span>
                    <span className="font-black" style={{ color: '#0D7377' }}>−{totalSaving.toLocaleString('sv-SE')} kr i skatt</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={loading}
                  className="w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#0D7377', color: '#fff', height: 52 }}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Bokför {selectedItems.length} inköp på företaget <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.1)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: '#1A2332' }}>Bokfört!</p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4A5568' }}>
                Du har just sänkt din kommande skatt med{' '}
                <span className="font-black" style={{ color: '#0D7377' }}>
                  {totalSaving.toLocaleString('sv-SE')} kr
                </span>
              </p>
              <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>
                {selectedItems.length} transaktioner flyttade till Business Activity Stream
              </p>
            </div>
            <button onClick={onClose}
              className="mt-2 w-full h-12 rounded-2xl font-bold text-sm"
              style={{ background: '#0D7377', color: '#fff' }}>
              Klart
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}