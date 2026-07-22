import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Heart, TrendingUp, Camera, Brain } from 'lucide-react';

const STEPS = [
  {
    id: 'safe-to-spend',
    targetId: 'walkthrough-safe-to-spend',
    Icon: Heart,
    title: 'Ditt ekonomiska lugn',
    text: 'Sluta gissa. Här ser du exakt hur mycket du kan spendera idag utan att sabba din budget eller dina sparmål. Lago har redan räknat bort räkningar och buffert.',
  },
  {
    id: 'forecast',
    targetId: 'walkthrough-forecast',
    Icon: TrendingUp,
    title: 'Din tidsmaskin',
    text: 'Här ser du hur dina val idag bygger din förmögenhet över tid. Testa att ändra din marginal så ser du hur grafen skjuter i höjden!',
  },
  {
    id: 'resell',
    targetId: 'walkthrough-resell',
    Icon: Camera,
    title: 'Tjäna pengar direkt',
    text: 'Har du prylar som ligger och skräpar? Fota dem! Lago hittar bästa priset på marknaden och visar hur försäljningen påverkar din 5-årsprognos.',
  },
  {
    id: 'simulator',
    targetId: 'walkthrough-simulator',
    Icon: Brain,
    title: 'Testa framtiden',
    text: 'Ska du köpa en ny bil eller börja plugga? Simulatorn låter dig testa "Tänk om"-scenarier innan du tar beslutet. Lago räknar ut konsekvenserna åt dig.',
  },
];

export default function OnboardingWalkthrough({ onFinish }) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, side: 'bottom' });
  const rafRef = useRef(null);

  const currentStep = STEPS[step];

  const updateSpotlight = () => {
    const el = document.getElementById(currentStep.targetId);
    if (!el) { setSpotlightRect(null); return; }

    const rect = el.getBoundingClientRect();
    const pad = 12;
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const viewH = window.innerHeight;
    const spaceBelow = viewH - (rect.bottom + pad);
    const tooltipH = 180;
    if (spaceBelow > tooltipH + 16) {
      setTooltipPos({ top: rect.bottom + pad + 8, side: 'bottom' });
    } else {
      setTooltipPos({ top: rect.top - pad - tooltipH - 8, side: 'top' });
    }
  };

  useEffect(() => {
    // Scroll element into view, then measure
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Wait for scroll to finish before measuring
      const t = setTimeout(() => {
        updateSpotlight();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    const onScroll = () => updateSpotlight();
    const onResize = () => updateSpotlight();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [step]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onFinish();
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark overlay with cutout via SVG clip */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ display: 'block' }}
        onClick={next}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={20}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.78)"
          mask="url(#spotlight-mask)"
        />
        {/* Glow ring around spotlight */}
        {spotlightRect && (
          <rect
            x={spotlightRect.left}
            y={spotlightRect.top}
            width={spotlightRect.width}
            height={spotlightRect.height}
            rx={20}
            fill="none"
            stroke="rgba(99,102,241,0.7)"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Skip button */}
      <button
        onClick={onFinish}
        className="absolute top-12 right-5 z-10 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-400 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}
      >
        <X className="w-3.5 h-3.5" />
        Hoppa över
      </button>

      {/* Step dots */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              background: i === step ? '#6366f1' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        {spotlightRect && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: tooltipPos.side === 'bottom' ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="absolute pointer-events-auto mx-4"
            style={{
              top: tooltipPos.top,
              left: 16,
              right: 16,
              background: 'linear-gradient(135deg, rgba(26,34,51,0.98), rgba(15,23,42,0.98))',
              boxShadow: 'var(--anchor-shadow-1)',
              borderRadius: 24,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
              padding: '20px 20px 18px',
            }}
          >
            {/* Step counter */}
            <p className="text-xs text-indigo-400 font-semibold tracking-wider mb-2 uppercase">
              Steg {step + 1} av {STEPS.length}
            </p>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <currentStep.Icon className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{currentStep.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{currentStep.text}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-600">Tryck var som helst för att gå vidare</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={next}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: isLast
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isLast
                    ? '0 4px 15px rgba(16,185,129,0.3)'
                    : '0 4px 15px rgba(99,102,241,0.3)',
                }}
              >
                {isLast ? (
                  <><Check className="w-4 h-4" /> Klar!</>
                ) : (
                  <>Nästa <ChevronRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}