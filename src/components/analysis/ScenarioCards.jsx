import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Home, AlertTriangle, TrendingDown, Turtle, Rocket, KeyRound, Shield, TrendingUp, Sparkles, SlidersHorizontal, Anchor } from 'lucide-react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function calcScenarios(profile, brusSavings, sliderPct) {
  const income = profile?.income || 28000;
  const savingsGoal = profile?.savingsGoal || 400000;
  const currentSavings = profile?.savingsCurrentBalance || 52000;
  const remaining = Math.max(0, savingsGoal - currentSavings);
  const buffer = profile?.buffer || 15000;

  const monthlySurplus = Math.max(4000, income * 0.18);
  const activeBrus = brusSavings * (sliderPct / 100);

  const yearsA = remaining / (monthlySurplus * 12);
  const yearsB = remaining / ((monthlySurplus + activeBrus) * 12);

  const runwayA_days = Math.round((buffer / income) * 30);
  const runwayB_days = Math.round(((buffer + activeBrus * 6) / income) * 30);

  const wealthA = monthlySurplus * 12 * 20 * 1.5;
  const wealthB = (monthlySurplus + activeBrus) * 12 * 20 * 1.8;
  const lostWealth = wealthB - wealthA;

  const progressA = Math.min(100, (currentSavings / savingsGoal) * 100);
  const progressB = Math.min(100, ((currentSavings + activeBrus * 6) / savingsGoal) * 100);

  const moveInYearA = 2026 + yearsA;
  const moveInYearB = 2026 + yearsB;
  const monthsSaved = Math.round((yearsA - yearsB) * 12);

  return {
    yearsA, yearsB, runwayA_days, runwayB_days,
    wealthA, wealthB, lostWealth,
    progressA, progressB,
    moveInYearA, moveInYearB, monthsSaved,
    savingsGoal, currentSavings,
  };
}

function AlternativkostnadBubble({ brusTotal }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(v => !v)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: 'rgba(233,168,37,0.15)', color: '#B7791F', border: '1px solid rgba(233,168,37,0.3)' }}
      >
        <Info className="w-3 h-3" /> Alternativkostnad
      </button>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-0 top-7 z-50 w-72 rounded-2xl p-4 shadow-xl"
          style={{ background: '#fff', border: '1px solid rgba(233,168,37,0.25)' }}
        >
          <p className="text-[11px] font-black mb-1 flex items-center gap-1" style={{ color: '#B7791F' }}>
            <Anchor className="w-3 h-3" /> Anchor-insikt
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
            Dina <strong>{fmt(brusTotal)} kr</strong> i brus-pengar (kaffe, småköp) varje månad
            växer till <strong>över 2 miljoner kr</strong> på börsen med 8% snittavkastning. 
            Vi visar dig hur du behåller kaffet — men sparar smartare.
          </p>
          <button onClick={() => setShow(false)} className="mt-2 text-[10px] font-bold" style={{ color: '#0D7377' }}>
            Stäng ×
          </button>
        </motion.div>
      )}
    </div>
  );
}

function TurboProgressBar({ pct, color, turbo }) {
  return (
    <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: turbo ? 'linear-gradient(90deg, #0D7377, #0FDEBD)' : '#CBD5E0' }}
      />
      {turbo && pct > 5 && (
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute right-0 top-0 h-full w-3 rounded-full"
          style={{ background: 'rgba(15,222,189,0.6)', filter: 'blur(3px)' }}
        />
      )}
    </div>
  );
}

export default function ScenarioCards({ profile, brusSavings, brusTotal, onSliderChange }) {
  const [sliderPct, setSliderPct] = useState(50);
  const s = calcScenarios(profile, brusSavings, sliderPct);

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setSliderPct(val);
    onSliderChange?.(val);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#8896A5' }}>
          Anchor ser två framtider
        </p>
        <AlternativkostnadBubble brusTotal={brusTotal || brusSavings * 2} />
      </div>

      {/* Split-screen cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scenario A — Långsamma spåret */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(203,213,224,0.18)', border: '1px solid rgba(180,195,210,0.35)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#8896A5' }}>
            Spår A
          </p>
          <p className="text-sm font-black leading-tight mb-3" style={{ color: '#4A5568' }}>
            <span className="inline-flex items-center gap-1"><Turtle className="w-4 h-4" /> Långsamma<br />spåret</span>
          </p>

          <div className="space-y-3">
            <Stat Icon={Home} label="Inflyttning" value={`år ${Math.round(s.moveInYearA)}`} color="#718096" />
            <Stat Icon={AlertTriangle} label="Trygghet" value={`${s.runwayA_days} dagar`} color="#718096" sub="om lönen uteblir" />
            <Stat Icon={TrendingDown} label="Förlusten" value={`${fmt(s.lostWealth)} kr`} color="#E53E3E" sub="kastad i vinden" />
          </div>

          <div className="mt-4">
            <p className="text-[9px] mb-1" style={{ color: '#A0AEC0' }}>
              Mot mål: {s.progressA.toFixed(0)}%
            </p>
            <TurboProgressBar pct={s.progressA} color="#CBD5E0" turbo={false} />
          </div>
        </motion.div>

        {/* Scenario B — Snabbspåret */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'rgba(13,115,119,0.07)',
            border: '1px solid rgba(15,222,189,0.30)',
            boxShadow: '0 0 28px rgba(15,222,189,0.10)',
          }}
        >
          {/* Glow orb */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(15,222,189,0.18) 0%, transparent 70%)' }} />

          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#0FDEBD' }}>
            <span className="inline-flex items-center gap-1">Spår B <Sparkles className="w-3 h-3" /></span>
          </p>
          <p className="text-sm font-black leading-tight mb-3" style={{ color: '#0D7377' }}>
            <span className="inline-flex items-center gap-1"><Rocket className="w-4 h-4" /> Snabbspåret<br />med Anchor</span>
          </p>

          <div className="space-y-3">
            <Stat Icon={KeyRound} label="Inflyttning" value={`år ${Math.round(s.moveInYearB)}`} color="#0D7377"
              sub={s.monthsSaved > 0 ? `${s.monthsSaved} mån tidigare` : ''} />
            <Stat Icon={Shield} label="Trygghet" value={`${s.runwayB_days} dagar`} color="#0D7377" sub="full sinnesro" />
            <Stat Icon={TrendingUp} label="Bonus" value={`+${fmt(s.wealthB - s.wealthA)} kr`} color="#0FDEBD" sub="indexfond 20 år" />
          </div>

          <div className="mt-4">
            <p className="text-[9px] mb-1" style={{ color: '#4A8A8C' }}>
              Mot mål: {s.progressB.toFixed(0)}%
            </p>
            <TurboProgressBar pct={s.progressB} color="#0FDEBD" turbo={true} />
          </div>
        </motion.div>
      </div>

      {/* What-if slider */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <p className="text-xs font-black mb-1" style={{ color: '#1A2332' }}>
          <span className="inline-flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4" /> What-if: Dra ner på Bruset</span>
        </p>
        <p className="text-xs mb-4" style={{ color: '#6B7E96' }}>
          Hur mycket av dina småköp vill du flytta till indexfonden?
        </p>

        <input
          type="range"
          min={10}
          max={90}
          step={10}
          value={sliderPct}
          onChange={handleSlider}
          className="w-full accent-teal-600"
          style={{ accentColor: '#0D7377' }}
        />
        <div className="flex justify-between text-[10px] mt-1" style={{ color: '#A0AEC0' }}>
          <span>20%</span><span>50%</span><span>80%</span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(15,222,189,0.15)' }}>
          <div>
            <p className="text-[10px]" style={{ color: '#6B7E96' }}>Du omdirigerar</p>
            <p className="text-lg font-black" style={{ color: '#0D7377' }}>
              {fmt(brusSavings * sliderPct / 100)} kr/mån
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px]" style={{ color: '#6B7E96' }}>Snabbare till hemmet</p>
            <p className="text-lg font-black" style={{ color: '#0FDEBD' }}>
              {s.monthsSaved > 0 ? `${s.monthsSaved} mån` : '< 1 mån'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ Icon, label, value, color, sub }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide mb-0.5 flex items-center gap-1" style={{ color: '#A0AEC0' }}>
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className="text-xs font-black leading-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-[9px]" style={{ color: '#A0AEC0' }}>{sub}</p>}
    </div>
  );
}