import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const TAX_RATE = 0.32; // kommunalskatt approximation
const OCR_NR = '863 419 25';
const BANK_ACCOUNT = '6001-837 492 851';

export default function PensionSliderModal({ onClose, onConfirm }) {
  const [amount, setAmount] = useState(3000);
  const [step, setStep] = useState(1); // 1=slider, 2=success
  const [copied, setCopied] = useState(false);

  const yearlySaving = Math.round(amount * 12 * TAX_RATE);
  const monthlySaving = Math.round(amount * TAX_RATE);

  const handleActivate = () => {
    setStep(2);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#0D7377', '#3DAA7A', '#fff'] });
    if (onConfirm) onConfirm(yearlySaving);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${amount} kr/mån till konto ${BANK_ACCOUNT}, OCR: ${OCR_NR}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pct = ((amount - 500) / (10000 - 500)) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#fff' }}>

        {step === 1 ? (
          <>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #F0F2F5' }}>
              <div>
                <p className="text-base font-black" style={{ color: '#1A2332' }}>Tjänstepension</p>
                <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>Dra för att se skatteeffekten live</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#F4F6F8' }}>
                <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
              </button>
            </div>

            <div className="px-5 py-6 space-y-6">
              {/* Live saving display */}
              <motion.div key={amount} initial={{ scale: 0.97 }} animate={{ scale: 1 }}
                className="p-5 rounded-3xl text-center"
                style={{ background: 'linear-gradient(145deg, #0D7377, #074f52)' }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Du sparar i skatt</p>
                <p className="font-black mt-1" style={{ fontSize: 44, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
                  {monthlySaving.toLocaleString('sv-SE')}
                  <span className="text-lg font-medium ml-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>kr/mån</span>
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  = {yearlySaving.toLocaleString('sv-SE')} kr per år
                </p>
              </motion.div>

              {/* Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: '#9AA5B4' }}>Månatlig insättning</span>
                  <span className="text-sm font-black" style={{ color: '#1A2332' }}>
                    {amount.toLocaleString('sv-SE')} kr
                  </span>
                </div>
                <div className="relative">
                  <input type="range" min={500} max={10000} step={100}
                    value={amount} onChange={e => setAmount(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #0D7377 ${pct}%, #E8ECF0 ${pct}%)`,
                      WebkitAppearance: 'none',
                    }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: '#9AA5B4' }}>500 kr</span>
                  <span className="text-xs" style={{ color: '#9AA5B4' }}>10 000 kr</span>
                </div>
              </div>

              {/* Visual bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs" style={{ color: '#9AA5B4' }}>
                  <span>Insättning</span>
                  <span>Skatteeffekt</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  <div className="rounded-full" style={{ width: `${100 - pct * 0.32}%`, background: '#E8ECF0', transition: 'width 0.2s' }} />
                  <div className="rounded-full" style={{ width: `${pct * 0.32}%`, background: '#0D7377', transition: 'width 0.2s' }} />
                </div>
              </div>

              {/* OCR info */}
              <div className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#4A5568' }}>Betaluppgifter</p>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#9AA5B4' }}>Konto</span>
                  <span className="font-mono font-bold" style={{ color: '#1A2332' }}>{BANK_ACCOUNT}</span>
                </div>
                <div className="flex justify-between text-xs mb-3">
                  <span style={{ color: '#9AA5B4' }}>OCR-nummer</span>
                  <span className="font-mono font-bold" style={{ color: '#1A2332' }}>{OCR_NR}</span>
                </div>
                <button onClick={handleCopy}
                  className="w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: copied ? 'rgba(13,115,119,0.1)' : '#ECEEF1', color: copied ? '#0D7377' : '#4A5568' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Kopierat!' : 'Kopiera betaluppgifter'}
                </button>
              </div>

              <button onClick={handleActivate}
                className="w-full h-12 rounded-2xl font-bold text-sm"
                style={{ background: '#0D7377', color: '#fff' }}>
                Skapa stående överföring — {amount.toLocaleString('sv-SE')} kr/mån
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.1)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: '#1A2332' }}>Pension aktiverad!</p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4A5568' }}>
                Du sparar{' '}
                <span className="font-black" style={{ color: '#0D7377' }}>
                  {yearlySaving.toLocaleString('sv-SE')} kr/år
                </span>{' '}
                i skatt genom din tjänstepension.
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