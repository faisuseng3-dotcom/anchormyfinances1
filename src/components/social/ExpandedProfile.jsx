import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, MapPin, Briefcase, Zap, Shield, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { AvatarSVG } from './AvatarBuilder';
import { base44 } from '@/api/base44Client';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ── Radar Chart (Spider/Aura) ──────────────────────────────────────────────
// ghostAxes = optional second dataset rendered as grey shadow (user's own profile)
function RadarChart({ axes, ghostAxes, accentColor = '#0FDEBD', size = 200 }) {
  const cx = size / 2, cy = size / 2;
  const levels = 4;
  const maxR = size / 2 - 24;
  const n = axes.length;

  const angleOf = (i) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const gridPolygons = Array.from({ length: levels }).map((_, l) => {
    const r = (maxR * (l + 1)) / levels;
    return Array.from({ length: n }).map((_, i) => {
      const a = angleOf(i);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  });

  const dataPoints = axes.map((ax, i) => {
    const r = (ax.value / 100) * maxR;
    const a = angleOf(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: ax.label };
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const ghostPoints = ghostAxes ? ghostAxes.map((ax, i) => {
    const r = (ax.value / 100) * maxR;
    const a = angleOf(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }) : null;
  const ghostPolygon = ghostPoints ? ghostPoints.map(p => `${p.x},${p.y}`).join(' ') : null;

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {gridPolygons.map((pts, l) => (
        <polygon key={l} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {axes.map((_, i) => {
        const a = angleOf(i);
        return <line key={i} x1={cx} y1={cy}
          x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      {/* Ghost shadow (user's own profile) */}
      {ghostPolygon && (
        <polygon points={ghostPolygon} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3,3" />
      )}
      {/* Data fill — uses accentColor */}
      <polygon points={dataPolygon} fill={`${accentColor}18`} stroke={`${accentColor}80`} strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={accentColor}
          style={{ filter: `drop-shadow(0 0 5px ${accentColor})` }} />
      ))}
      {/* Labels */}
      {dataPoints.map((p, i) => {
        const a = angleOf(i);
        const lx = cx + (maxR + 16) * Math.cos(a);
        const ly = cy + (maxR + 16) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.3)">
            {axes[i].label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Orbit System with Radar aura ──────────────────────────────────────────
function OrbitSystem({ profile, accentColor, radarAxes, ghostAxes }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const isHybrid = profile.privacy_level === 'hybrid';
  const items = profile.finance.items;
  const orbitRadii = [52, 84, 114, 140, 164];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 280 }}>
      {/* Radar aura behind everything */}
      {radarAxes && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <RadarChart axes={radarAxes} ghostAxes={ghostAxes} accentColor={accentColor} size={260} />
        </div>
      )}

      {/* Center orb */}
      <div className="absolute z-10 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${accentColor}40, ${accentColor}10)`,
          border: `2px solid ${accentColor}60`,
          boxShadow: `0 0 24px ${accentColor}40`,
          zIndex: 10,
        }}>
        <AvatarSVG style={profile.avatar_style} size={48} />
      </div>

      {items.map((item, i) => {
        const rad = orbitRadii[i] || 164 + i * 20;
        const isHovered = hoveredItem === i;
        const moonAngle = (i * 72 - 90) * (Math.PI / 180);
        const mx = Math.cos(moonAngle) * rad;
        const my = Math.sin(moonAngle) * rad;

        return (
          <React.Fragment key={i}>
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: rad * 2, height: rad * 2, border: '1px solid rgba(255,255,255,0.04)',
                left: '50%', top: '50%', marginLeft: -rad, marginTop: -rad, zIndex: 5,
              }} />
            <motion.div className="absolute cursor-pointer"
              style={{ left: '50%', top: '50%', transform: `translate(${mx - 16}px, ${my - 16}px)`, zIndex: 20 }}
              animate={{ scale: isHovered ? 1.25 : 1 }}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={e => { e.stopPropagation(); setHoveredItem(isHovered ? null : i); }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: `${item.color}20`, border: `1.5px solid ${item.color}60`,
                  boxShadow: isHovered ? `0 0 20px ${item.color}` : `0 0 5px ${item.color}30`,
                }}>
                {item.icon}
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-44 p-3 rounded-xl text-center pointer-events-none"
                    style={{ background: 'rgba(4,6,18,0.97)', border: `1px solid ${item.color}40`, boxShadow: `0 8px 24px rgba(0,0,0,0.6)` }}>
                    <p className="text-[10px] font-black mb-1" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-base font-black text-white">
                      {isHybrid || !item.amount ? `${item.pct}%` : `${fmt(item.amount)} kr`}
                    </p>
                    {item.detail && (
                      <p className="text-[9px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.detail}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Tension Gauge (circular pressure meter) ────────────────────────────────
function TensionGauge({ score, punchline }) {
  const isHardcore = score >= 70;
  const isMedium = score >= 40;
  const gaugeColor = isHardcore ? '#FF4466' : isMedium ? '#F6AD55' : '#0FDEBD';
  const label = isHardcore ? 'HARDCORE 🔒' : isMedium ? 'KRÄVER PLANERING' : 'ENKEL OMSTÄLLNING';

  // SVG arc parameters
  const R = 38, cx = 50, cy = 50;
  const startAngle = -210; // degrees, left side
  const sweepDeg = 240;    // total sweep
  const endAngle = startAngle + sweepDeg * (score / 100);
  const toRad = (d) => (d * Math.PI) / 180;
  const arcX = (a) => cx + R * Math.cos(toRad(a));
  const arcY = (a) => cy + R * Math.sin(toRad(a));
  const large = sweepDeg * (score / 100) > 180 ? 1 : 0;

  const trackPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 1 1 ${arcX(startAngle + sweepDeg - 0.1)} ${arcY(startAngle + sweepDeg - 0.1)}`;
  const fillPath = score > 1
    ? `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 ${large} 1 ${arcX(endAngle)} ${arcY(endAngle)}`
    : '';

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
      <div className="flex items-center gap-4">
        {/* Arc gauge */}
        <motion.div
          animate={isHardcore ? { x: [0, -1.5, 1.5, -1, 1, 0] } : {}}
          transition={isHardcore ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : {}}
        >
          <svg viewBox="0 0 100 80" width="90" height="72">
            {/* Track */}
            <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" strokeLinecap="round" />
            {/* Fill */}
            {fillPath && (
              <path d={fillPath} fill="none" stroke={gaugeColor} strokeWidth="7" strokeLinecap="round"
                style={{ filter: isHardcore ? `drop-shadow(0 0 6px ${gaugeColor})` : 'none' }} />
            )}
            {/* Center score */}
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fontWeight="900" fill={gaugeColor}>{score}%</text>
          </svg>
        </motion.div>

        {/* Label + micro-insight */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black mb-1" style={{ color: gaugeColor }}>{label}</p>
          {punchline && (
            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ⚡ {punchline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Economic Persona (DNA) ─────────────────────────────────────────────────
function EconomicPersona({ profile, accentColor }) {
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const itemsText = profile.finance.items.map(i => `${i.label}: ${i.pct}%`).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en ekonomisk psykolog. Ge denna persons ekonomi en "DNA-profil" på svenska baserat på deras budgetfördelning.

Profil: ${profile.display_name}, ${profile.age} år, ${profile.occupation}. Budget: ${itemsText}.

Returnera EXAKT detta JSON, inget annat:
- style_name: ett coolt engelskt namn (t.ex. "The Targeted Sprinter", "The Minimalist Fortress", "The Aggressive Builder") — max 3 ord
- tagline: en mening på svenska som sammanfattar strategin (max 12 ord, känslosam och direkt)
- scores: objekt med trygghet, tillväxt, fokus, frihet (siffror 1-10)
- badges_pos: array med max 3 korta svenska fördelar (t.ex. "Målfokuserad", "Låga fasta kostnader")
- badges_neg: array med max 2 korta svenska varningar (t.ex. "Sårbar marginal", "Noll buffert")
- sacrifice_score: 0-100 (hur hårt offrar de livsstil — 100 = extrem disciplin)
- ai_punchline: EN mening på svenska, emotionell och ärlig, om vad denna budget egentligen innebär (max 15 ord)`,
        response_json_schema: {
          type: 'object',
          properties: {
            style_name: { type: 'string' },
            tagline: { type: 'string' },
            scores: {
              type: 'object',
              properties: {
                trygghet: { type: 'number' },
                tillväxt: { type: 'number' },
                fokus: { type: 'number' },
                frihet: { type: 'number' },
              }
            },
            badges_pos: { type: 'array', items: { type: 'string' } },
            badges_neg: { type: 'array', items: { type: 'string' } },
            sacrifice_score: { type: 'number' },
            ai_punchline: { type: 'string' },
          }
        }
      });
      if (!cancelled) { setPersona(result); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [profile.id]);

  const sacrificeLabel = !persona ? '' :
    persona.sacrifice_score >= 70 ? 'EXTREM DISCIPLIN' :
    persona.sacrifice_score >= 40 ? 'KRÄVER PLANERING' : 'ENKEL OMSTÄLLNING';
  const sacrificeColor = !persona ? '#0FDEBD' :
    persona.sacrifice_score >= 70 ? '#FF4466' :
    persona.sacrifice_score >= 40 ? '#F6AD55' : '#0FDEBD';

  const radarAxes = persona ? [
    { label: 'TRYGGHET', value: (persona.scores?.trygghet || 5) * 10, color: '#0FDEBD' },
    { label: 'TILLVÄXT', value: (persona.scores?.tillväxt || 5) * 10, color: '#4B7CF3' },
    { label: 'FOKUS',    value: (persona.scores?.fokus || 5) * 10,    color: '#A78BFA' },
    { label: 'FRIHET',   value: (persona.scores?.frihet || 5) * 10,   color: '#F6AD55' },
  ] : null;

  return { persona, loading, radarAxes, sacrificeLabel, sacrificeColor };
}

// ── Visual Swap Comparison ────────────────────────────────────────────────
function SwapComparison({ profile, userFinancialProfile, accentColor }) {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const userIncome = userFinancialProfile?.income || 0;

  const rows = profile.finance.items
    .filter(i => i.label !== 'Inkomst (CSN + jobb)')
    .map(item => {
      const newAmount = Math.round((item.pct / 100) * userIncome);
      const currentKey = Object.keys(userFinancialProfile?.budgetLimits || {})
        .find(k => item.label.toLowerCase().includes(k.replace(/_/g, ' ')));
      const currentAmount = currentKey ? (userFinancialProfile.budgetLimits[currentKey] || 0) : null;
      const maxBar = Math.max(newAmount, currentAmount || 0, 1);
      const diff = currentAmount !== null ? newAmount - currentAmount : null;
      return { ...item, newAmount, currentAmount, diff, maxBar };
    });

  const activateLifestyle = async () => {
    if (!userFinancialProfile?.id || !userIncome) return;
    const newLimits = {};
    for (const item of profile.finance.items) {
      if (item.label !== 'Inkomst (CSN + jobb)') {
        const catKey = item.label.toLowerCase().replace(/[\s&()\/]/g, '_').replace(/_+/g, '_');
        newLimits[catKey] = Math.round((item.pct / 100) * userIncome);
      }
    }
    await base44.entities.FinancialProfile.update(userFinancialProfile.id, { budgetLimits: newLimits });
    setActivated(true);
  };

  return (
    <div className="px-6">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
        style={{
          background: open ? 'rgba(246,173,85,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(246,173,85,0.3)' : 'rgba(255,255,255,0.07)'}`,
        }}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#F6AD55' }} />
          <span className="text-xs font-black" style={{ color: open ? '#F6AD55' : 'rgba(255,255,255,0.6)' }}>
            SIMULERA PÅ MIN EKONOMI
          </span>
        </div>
        <span className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.25)' }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3 space-y-3">
              {!userIncome ? (
                <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Ange din inkomst i inställningar.</p>
              ) : (
                <>
                  <div className="text-center pb-1">
                    <span className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>DIN INKOMST: </span>
                    <span className="text-xs font-black" style={{ color: '#F6AD55' }}>{fmt(userIncome)} kr/mån</span>
                  </div>

                  {/* Visual swap bars */}
                  <div className="space-y-3">
                    {rows.map((row, i) => {
                      const diffColor = row.diff === null ? 'rgba(255,255,255,0.3)' : row.diff > 0 ? '#FF4466' : '#0FDEBD';
                      const diffLabel = row.diff === null ? null : `${row.diff > 0 ? '+' : ''}${fmt(row.diff)} kr`;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{row.icon}</span>
                              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                            </div>
                            {diffLabel && (
                              <span className="text-[10px] font-black" style={{ color: diffColor }}>{diffLabel}</span>
                            )}
                          </div>
                          {/* Du bar */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] w-6" style={{ color: 'rgba(255,255,255,0.25)' }}>DU</span>
                              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: row.currentAmount !== null ? `${(row.currentAmount / row.maxBar) * 100}%` : '0%' }}
                                  transition={{ duration: 0.7, delay: i * 0.06 }}
                                  className="h-full rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                              </div>
                              <span className="text-[9px] font-black w-16 text-right" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {row.currentAmount !== null ? `${fmt(row.currentAmount)} kr` : '—'}
                              </span>
                            </div>
                            {/* Mall bar */}
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] w-6" style={{ color: row.color }}>MALL</span>
                              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(row.newAmount / row.maxBar) * 100}%` }}
                                  transition={{ duration: 0.7, delay: i * 0.06 + 0.15 }}
                                  className="h-full rounded-full"
                                  style={{ background: row.color, boxShadow: `0 0 6px ${row.color}60` }} />
                              </div>
                              <span className="text-[9px] font-black w-16 text-right" style={{ color: row.color }}>
                                {fmt(row.newAmount)} kr
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={activateLifestyle} disabled={activated}
                    className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mt-2"
                    style={{
                      background: activated ? 'rgba(15,222,189,0.15)' : 'rgba(246,173,85,0.15)',
                      color: activated ? '#0FDEBD' : '#F6AD55',
                      border: `1.5px solid ${activated ? 'rgba(15,222,189,0.4)' : 'rgba(246,173,85,0.35)'}`,
                    }}>
                    {activated ? <><Check className="w-4 h-4" /> Livsstil aktiverad!</> : <><Zap className="w-4 h-4" /> AKTIVERA DENNA LIVSSTIL</>}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function ExpandedProfile({ profile, onClose, userFinancialProfile }) {
  const [adopted, setAdopted] = useState(false);
  const isHybrid = profile.privacy_level === 'hybrid';
  const accentColor = profile.avatar_style?.bg || '#4B7CF3';

  // Load persona on mount
  const personaHook = EconomicPersona({ profile, accentColor });
  const { persona, loading: personaLoading, radarAxes } = personaHook;

  // Ghost axes — user's own budget mapped to same 4 dimensions (rough heuristic)
  const userGhostAxes = radarAxes && userFinancialProfile?.budgetLimits ? (() => {
    const limits = userFinancialProfile.budgetLimits;
    const inc = userFinancialProfile.income || 1;
    const totalSpend = Object.values(limits).reduce((a, b) => a + b, 0);
    const savePct = Math.max(0, Math.round(((inc - totalSpend) / inc) * 100));
    const housingPct = Math.round(((limits.hyra || limits.boende || 0) / inc) * 100);
    const leisurePct = Math.round(((limits.nöje || limits.livsstil || limits.övrigt || 0) / inc) * 100);
    return [
      { label: 'TRYGGHET', value: Math.min(100, savePct * 3) },
      { label: 'TILLVÄXT', value: Math.min(100, savePct * 2) },
      { label: 'FOKUS',    value: Math.min(100, Math.max(10, 60 - leisurePct * 2)) },
      { label: 'FRIHET',   value: Math.min(100, leisurePct * 3) },
    ];
  })() : null;

  const handleAdopt = async (e) => {
    e.stopPropagation();
    const income = userFinancialProfile?.income || 14000;
    const newLimits = {};
    for (const item of profile.finance.items) {
      if (item.label !== 'Inkomst (CSN + jobb)') {
        const catKey = item.label.toLowerCase().replace(/[\s&()\/]/g, '_').replace(/_+/g, '_');
        newLimits[catKey] = Math.round((item.pct / 100) * income);
      }
    }
    if (userFinancialProfile?.id) {
      await base44.entities.FinancialProfile.update(userFinancialProfile.id, { budgetLimits: newLimits });
    }
    setAdopted(true);
    setTimeout(() => setAdopted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(180deg, rgba(5,8,20,0.99) 0%, rgba(8,12,28,0.99) 100%)', borderTop: `1px solid ${accentColor}25` }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-4 h-4 text-white" />
        </button>

        {/* ── Header ── */}
        <div className="px-6 pt-8 pb-3 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}50`, boxShadow: `0 0 20px ${accentColor}30` }}>
            <AvatarSVG style={profile.avatar_style} size={56} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-black text-white">@{profile.username}</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}35` }}>
                {isHybrid ? '% PROCENT' : '🔓 KRONOR'}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Economic DNA Persona ── */}
        <div className="px-6 mb-4">
          {personaLoading ? (
            <div className="flex items-center gap-2 py-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </motion.div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Analyserar ekonomisk DNA...</span>
            </div>
          ) : persona ? (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
              {/* Style name */}
              <div>
                <p className="text-[9px] font-black tracking-widest mb-0.5" style={{ color: `${accentColor}60` }}>EKONOMISK DNA</p>
                <p className="text-base font-black text-white">"{persona.style_name}"</p>
                <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{persona.tagline}</p>
              </div>

              {/* The Power Graph — Radar DNA (with ghost overlay of user's own profile) */}
              <div className="flex justify-center my-1">
                <RadarChart
                  axes={radarAxes}
                  ghostAxes={userGhostAxes}
                  accentColor={accentColor}
                  size={180}
                />
              </div>

              {/* Vibe Tags — solid green strengths / outline amber risks */}
              <div className="flex flex-wrap gap-1.5">
                {persona.badges_pos?.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[9px] font-black"
                    style={{ background: 'rgba(15,222,189,0.18)', color: '#fff', boxShadow: '0 0 8px rgba(15,222,189,0.2)' }}>
                    ✓ {b}
                  </span>
                ))}
                {persona.badges_neg?.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[9px] font-black"
                    style={{ background: 'transparent', color: '#F6AD55', border: '1px solid rgba(246,173,85,0.45)', boxShadow: '0 0 8px rgba(246,173,85,0.15)' }}>
                    ⚠ {b}
                  </span>
                ))}
              </div>

              {/* Tension Gauge — circular pressure meter */}
              <TensionGauge score={persona.sacrifice_score} punchline={persona.ai_punchline} />

            </div>
          ) : null}
        </div>

        {/* ── Orbit + Radar aura ── */}
        <p className="px-6 text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
          EKONOMISKT SOLSYSTEM — TRYCK PÅ EN PLANET FÖR DETALJER
        </p>
        <OrbitSystem profile={profile} accentColor={accentColor} radarAxes={radarAxes} ghostAxes={userGhostAxes} />

        {/* ── Budget bars ── */}
        <div className="px-6 space-y-2 mt-1 mb-5">
          <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>BUDGETFÖRDELNING</p>
          {profile.finance.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</p>
                  <p className="text-xs font-black" style={{ color: item.color }}>
                    {isHybrid || !item.amount ? `${item.pct}%` : `${fmt(item.amount)} kr`}
                  </p>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-6 mb-4" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

        {/* ── Swap Comparison ── */}
        <SwapComparison profile={profile} userFinancialProfile={userFinancialProfile} accentColor={accentColor} />

        {/* ── Quick Adopt ── */}
        <div className="px-6 pt-5 pb-14">
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={handleAdopt}
            className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
            style={{
              background: adopted ? 'rgba(15,222,189,0.15)' : `${accentColor}20`,
              color: adopted ? '#0FDEBD' : accentColor,
              border: `1.5px solid ${adopted ? 'rgba(15,222,189,0.4)' : `${accentColor}45`}`,
              boxShadow: adopted ? '0 0 24px rgba(15,222,189,0.15)' : `0 0 20px ${accentColor}10`,
            }}>
            {adopted
              ? <><Check className="w-4 h-4" /> Budget adopterad från @{profile.username}</>
              : <><Sparkles className="w-4 h-4" /> HÄRMA DENNA BUDGET</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}