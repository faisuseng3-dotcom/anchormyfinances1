/**
 * MarginMaxerAlexView — Alex Mode djupanalys av abonnemang
 * Förinläst mock-data, stapelgraf, Anchor-insikt, toggle-optimering.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const ALEX_SUBS = [
  { id: 'netflix',  name: 'Netflix',           emoji: '🎮', amount: 149, category: 'Streaming',   warn: false },
  { id: 'disney',   name: 'Disney+',            emoji: '🎮', amount: 89,  category: 'Streaming',   warn: true,  warnNote: 'Ej använd på 14 dagar' },
  { id: 'spotify',  name: 'Spotify',            emoji: '🎧', amount: 119, category: 'Musik',       warn: false },
  { id: 'sats',     name: 'SATS Gym',           emoji: '🏋️', amount: 549, category: 'Hälsa',      warn: false },
  { id: 'amazon',   name: 'Amazon Prime',       emoji: '📦', amount: 59,  category: 'Shopping',    warn: false },
  { id: 'mobile',   name: 'Mobilabonnemang',   emoji: '📱', amount: 299, category: 'Telefoni',    warn: true,  warnNote: 'Kan förhandlas ned' },
];

const TOTAL_MONTHLY = ALEX_SUBS.reduce((s, x) => s + x.amount, 0); // 1 264

// Stapeldata: ackumulerad kostnad per kvartal → år
const BAR_DATA = [
  { label: 'Q1', cost: Math.round(TOTAL_MONTHLY * 3) },
  { label: 'Q2', cost: Math.round(TOTAL_MONTHLY * 6) },
  { label: 'Q3', cost: Math.round(TOTAL_MONTHLY * 9) },
  { label: 'År',  cost: Math.round(TOTAL_MONTHLY * 12) },
];

// Optimering-kandidater
const OPTIMIZATIONS = [
  { id: 'disney', label: 'Pausa Disney+',       saving: 89  },
  { id: 'mobile', label: 'Byt mobilavtal',      saving: 100 },
];

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function MarginMaxerAlexView() {
  const [toggled, setToggled] = useState([]);
  const [optimized, setOptimized] = useState(false);

  const toggle = (id) => {
    setToggled(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const potentialSaving = OPTIMIZATIONS
    .filter(o => toggled.includes(o.id))
    .reduce((s, o) => s + o.saving, 0);
  const totalPotential = OPTIMIZATIONS.reduce((s, o) => s + o.saving, 0);

  const handleOptimize = () => setOptimized(true);

  return (
    <div className="space-y-6 pb-4">

      {/* ── A. Abonnemangshög ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Din Abonnemangshög
        </p>

        {/* Bar chart */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} barSize={28}>
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                  {BAR_DATA.map((entry, i) => (
                    <Cell key={i} fill={i === 3 ? '#F6AD55' : 'rgba(246,173,85,0.45)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Du lägger <span style={{ color: '#F6AD55', fontWeight: 700 }}>{fmt(TOTAL_MONTHLY * 12)} kr</span> om året på tjänster.
            Det motsvarar en tur-och-retur till Tokyo.
          </p>
        </div>

        {/* Sub list */}
        <div className="space-y-2">
          {ALEX_SUBS.map((sub) => (
            <div key={sub.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: sub.warn ? 'rgba(245,101,40,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${sub.warn ? 'rgba(245,101,40,0.22)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <span style={{ fontSize: 18 }}>{sub.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#fff' }}>{sub.name}</p>
                {sub.warn && (
                  <p className="text-[10px]" style={{ color: '#F6AD55' }}>⚠ {sub.warnNote}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black" style={{ color: sub.warn ? '#F6AD55' : 'rgba(255,255,255,0.6)' }}>
                  {sub.amount} kr
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>/mån</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-1 mt-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Totalt per månad</p>
          <p className="text-lg font-black" style={{ color: '#F6AD55' }}>{fmt(TOTAL_MONTHLY)} kr</p>
        </div>
      </section>

      {/* ── B. Anchor-insikt ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
          ⚓ Anchor-insikt · Strategisk översyn
        </p>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(246,173,85,0.06)', border: '1px solid rgba(246,173,85,0.18)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Alex, du har{' '}
            <span style={{ color: '#F6AD55', fontWeight: 700 }}>tre olika streamingtjänster</span>{' '}
            för film och serier. Statistiskt sett används sällan mer än två aktivt.
            Genom att pausa{' '}
            <span style={{ color: '#F6AD55', fontWeight: 700 }}>Disney+</span>{' '}
            (som du inte använt på 14 dagar) frigör du{' '}
            <span style={{ color: '#0FDEBD', fontWeight: 700 }}>1 068 kr per år</span>{' '}
            till ditt Japan-sparande — utan att påverka din livskvalitet.
          </p>
        </div>
      </section>

      {/* ── C. Marginal-Optimering ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Marginal-Optimering
        </p>

        <div className="space-y-3 mb-4">
          {OPTIMIZATIONS.map((opt) => {
            const isOn = toggled.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggle(opt.id)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all"
                style={{
                  background: isOn ? 'rgba(15,222,189,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isOn ? 'rgba(15,222,189,0.30)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {/* Toggle pill */}
                <div className="w-11 h-6 rounded-full flex-shrink-0 relative transition-colors"
                  style={{ background: isOn ? '#0D7377' : 'rgba(255,255,255,0.12)' }}>
                  <motion.div
                    animate={{ x: isOn ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: '#fff' }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Spara {opt.saving} kr/mån</p>
                </div>
                <p className="font-black text-sm flex-shrink-0" style={{ color: isOn ? '#0FDEBD' : 'rgba(255,255,255,0.25)' }}>
                  +{opt.saving * 12} kr/år
                </p>
              </button>
            );
          })}
        </div>

        {/* Savings counter */}
        <motion.div
          animate={{ opacity: toggled.length > 0 ? 1 : 0.5 }}
          className="flex items-center justify-between px-5 py-4 rounded-2xl mb-4"
          style={{ background: 'rgba(15,222,189,0.06)', border: '1px solid rgba(15,222,189,0.14)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Potentiell extra besparing</p>
          <p className="text-lg font-black" style={{ color: '#0FDEBD' }}>
            {fmt(potentialSaving > 0 ? potentialSaving * 12 : totalPotential * 12)} kr / år
          </p>
        </motion.div>

        {/* Optimera CTA */}
        <AnimatePresence mode="wait">
          {optimized ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full py-4 rounded-2xl text-center"
              style={{ background: 'rgba(15,222,189,0.10)', border: '1px solid rgba(15,222,189,0.25)' }}>
              <p className="font-black text-sm" style={{ color: '#0FDEBD' }}>✓ Optimering simulerad!</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {fmt(potentialSaving || totalPotential)} kr/mån frigjort i demon
              </p>
            </motion.div>
          ) : (
            <motion.button key="cta"
              whileTap={{ scale: 0.97 }}
              onClick={handleOptimize}
              className="w-full py-4 rounded-2xl font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #0D7377, #0FDEBD)',
                color: '#fff',
                letterSpacing: '0.04em',
              }}>
              OPTIMERA NU
            </motion.button>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}