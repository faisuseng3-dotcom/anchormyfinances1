import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Home, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEDUCTION = 4000; // kr/år schablon hyresrätt
const TAX_SAVING = Math.round(DEDUCTION * 0.32); // ~1 280 kr

export default function HomeOfficeModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1=question, 2=confirm, 3=success
  const [housingType, setHousingType] = useState('hyresrätt');

  const deduction = housingType === 'hyresrätt' ? 4000 : 6000;
  const saving = Math.round(deduction * 0.32);

  const handleYes = () => setStep(2);

  const handleConfirm = () => {
    setStep(3);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#0D7377', '#3DAA7A', '#fff'] });
    if (onConfirm) onConfirm(saving);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#fff' }}>

        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.1)' }}>
              <Home className="w-4 h-4" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-base font-black" style={{ color: '#1A2332' }}>Hemmakontor-avdrag</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>Schablonreglerna (Skatteverket)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#F4F6F8' }}>
            <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
          </button>
        </div>

        {step === 1 && (
          <div className="px-5 py-6 space-y-5">
            <div className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#1A2332' }}>
                Arbetar du minst 10 timmar i veckan hemifrån?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#9AA5B4' }}>
                Skatteverket tillåter avdrag för arbetsrum i bostaden om du regelbundet jobbar hemifrån och det sker i tjänsten.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: '#9AA5B4' }}>Din boendeform</p>
              {['hyresrätt', 'bostadsrätt/villa'].map(type => (
                <button key={type} onClick={() => setHousingType(type)}
                  className="w-full p-3.5 rounded-2xl flex items-center justify-between transition-all"
                  style={{
                    background: housingType === type ? 'rgba(13,115,119,0.06)' : '#F4F6F8',
                    border: housingType === type ? '1.5px solid rgba(13,115,119,0.25)' : '1.5px solid transparent',
                  }}>
                  <span className="text-sm font-semibold capitalize" style={{ color: '#1A2332' }}>{type}</span>
                  {housingType === type && (
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#0D7377' }} />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,115,119,0.06)' }}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#4A5568' }}>Schablonavdrag</span>
                <span className="font-bold" style={{ color: '#1A2332' }}>{deduction.toLocaleString('sv-SE')} kr/år</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: '#4A5568' }}>Skatteeffekt</span>
                <span className="font-black" style={{ color: '#0D7377' }}>−{saving.toLocaleString('sv-SE')} kr i skatt</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={onClose}
                className="h-12 rounded-2xl font-bold text-sm"
                style={{ background: '#F4F6F8', color: '#9AA5B4' }}>
                Nej, inte riktigt
              </button>
              <button onClick={handleYes}
                className="h-12 rounded-2xl font-bold text-sm"
                style={{ background: '#0D7377', color: '#fff' }}>
                Ja, aktivera
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-5 py-6 space-y-4">
            <div className="p-4 rounded-2xl space-y-2" style={{ background: '#F4F6F8' }}>
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Bekräfta avdraget</p>
              <p className="text-xs leading-relaxed" style={{ color: '#9AA5B4' }}>
                Anchor lägger till ett schablonavdrag på {deduction.toLocaleString('sv-SE')} kr i din årsprognos. Din skattbar vinst minskar och "Skatt att betala" sjunker direkt med ca {saving.toLocaleString('sv-SE')} kr.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 p-4 rounded-2xl text-center" style={{ background: 'rgba(13,115,119,0.06)' }}>
                <p className="text-xs" style={{ color: '#9AA5B4' }}>Ditt nya skatteestimatet minskar med</p>
                <p className="text-2xl font-black mt-1" style={{ color: '#0D7377' }}>
                  −{saving.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
            <button onClick={handleConfirm}
              className="w-full h-12 rounded-2xl font-bold text-sm"
              style={{ background: '#0D7377', color: '#fff' }}>
              Lägg till i prognosen
            </button>
          </div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.1)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: '#1A2332' }}>Avdrag aktiverat!</p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4A5568' }}>
                Din skatteprognos har sänkts med{' '}
                <span className="font-black" style={{ color: '#0D7377' }}>{saving.toLocaleString('sv-SE')} kr</span>.
                Hemmakontor-avdraget är nu med i alla beräkningar.
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