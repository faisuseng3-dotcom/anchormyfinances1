import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, MapPin, Briefcase, Brain, TrendingUp, TrendingDown, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { AvatarSVG } from './AvatarBuilder';
import { base44 } from '@/api/base44Client';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ── Orbit System ───────────────────────────────────────────────────────────
function OrbitSystem({ profile, accentColor, ghostItems }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const isHybrid = profile.privacy_level === 'hybrid';
  const items = profile.finance.items;
  const orbitRadii = [58, 92, 124, 152, 178];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 300 }}>
      {/* Center orb */}
      <div className="absolute z-10 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${accentColor}40, ${accentColor}10)`,
          border: `2px solid ${accentColor}60`,
          boxShadow: `0 0 24px ${accentColor}40`,
        }}>
        <AvatarSVG style={profile.avatar_style} size={48} />
      </div>

      {items.map((item, i) => {
        const rad = orbitRadii[i] || 178 + i * 20;
        const isHovered = hoveredItem === i;
        const moonAngle = (i * 72 - 90) * (Math.PI / 180);
        const mx = Math.cos(moonAngle) * rad;
        const my = Math.sin(moonAngle) * rad;

        // Ghost moon position (if mirror mode active)
        const ghostItem = ghostItems?.[i];
        const ghostRad = ghostItem ? orbitRadii[i] : null;
        const ghostAngle = ghostItem ? ((i * 72 - 60) * (Math.PI / 180)) : null;
        const gx = ghostAngle !== null ? Math.cos(ghostAngle) * (ghostRad * (ghostItem.pct / item.pct)) : null;
        const gy = ghostAngle !== null ? Math.sin(ghostAngle) * (ghostRad * (ghostItem.pct / item.pct)) : null;

        return (
          <React.Fragment key={i}>
            {/* Orbit track */}
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: rad * 2, height: rad * 2,
                border: '1px solid rgba(255,255,255,0.04)',
                left: '50%', top: '50%',
                marginLeft: -rad, marginTop: -rad,
              }} />

            {/* Ghost moon (mirror effect) */}
            {ghostItems && gx !== null && (
              <div className="absolute pointer-events-none z-10"
                style={{ left: '50%', top: '50%', transform: `translate(${gx - 12}px, ${gy - 12}px)` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: `${item.color}08`, border: `1px dashed ${item.color}30`, opacity: 0.5 }}>
                  {item.icon}
                </div>
              </div>
            )}

            {/* Real moon */}
            <motion.div className="absolute cursor-pointer z-20"
              style={{ left: '50%', top: '50%', transform: `translate(${mx - 16}px, ${my - 16}px)` }}
              animate={{ scale: isHovered ? 1.2 : 1 }}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={e => { e.stopPropagation(); setHoveredItem(isHovered ? null : i); }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: `${item.color}20`,
                  border: `1.5px solid ${item.color}60`,
                  boxShadow: isHovered ? `0 0 16px ${item.color}90` : `0 0 5px ${item.color}30`,
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

// ── AI Strategy Breakdown ─────────────────────────────────────────────────
function AIStrategyBreakdown({ profile, accentColor }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadAnalysis = async () => {
    if (analysis) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);
    const itemsText = profile.finance.items
      .map(i => `${i.label}: ${i.pct}%${i.amount ? ` (${fmt(i.amount)} kr)` : ''}`)
      .join(', ');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en ekonomisk strateg. Analysera denna persons ekonomi kort och precist på svenska.
Namn: ${profile.display_name}, ${profile.age} år, ${profile.occupation}, ${profile.city}.
Bio: ${profile.bio}
Budgetfördelning: ${itemsText}

Ge exakt dessa tre saker, skriv inte mer:
1. STRATEGI (2 meningar max): Vad är kärnan i deras ekonomiska strategi och filosofi?
2. FÖRDELAR (2 punkter): De två starkaste sidorna med denna approach.
3. NACKDELAR (2 punkter): De två svagaste sidorna eller riskerna.

Var ärlig, specifik och undvik klichéer. Skriv i direkt stil.`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          pros: { type: 'array', items: { type: 'string' } },
          cons: { type: 'array', items: { type: 'string' } },
        }
      }
    });
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="px-6">
      <button onClick={loadAnalysis}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
        style={{
          background: open ? `${accentColor}12` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? accentColor + '30' : 'rgba(255,255,255,0.07)'}`,
        }}>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-xs font-black" style={{ color: open ? accentColor : 'rgba(255,255,255,0.6)' }}>
            AI STRATEGY BREAKDOWN
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                  </motion.div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>AI analyserar strategin...</span>
                </div>
              ) : analysis && (
                <>
                  {/* Strategy */}
                  <div className="p-3 rounded-xl" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                    <p className="text-[9px] font-black tracking-widest mb-1.5" style={{ color: `${accentColor}80` }}>STRATEGI</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{analysis.strategy}</p>
                  </div>

                  {/* Pros */}
                  <div className="space-y-1.5">
                    {analysis.pros?.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl"
                        style={{ background: 'rgba(15,222,189,0.06)', border: '1px solid rgba(15,222,189,0.15)' }}>
                        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#0FDEBD' }} />
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{pro}</p>
                      </div>
                    ))}
                  </div>

                  {/* Cons */}
                  <div className="space-y-1.5">
                    {analysis.cons?.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl"
                        style={{ background: 'rgba(255,68,102,0.06)', border: '1px solid rgba(255,68,102,0.15)' }}>
                        <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#FF4466' }} />
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{con}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mirror Effect ──────────────────────────────────────────────────────────
function MirrorEffect({ profile, userFinancialProfile, accentColor }) {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);

  const userIncome = userFinancialProfile?.income || 0;

  const runSimulation = async () => {
    if (simulation) { setOpen(o => !o); return; }
    if (!userIncome) { setOpen(true); setSimulation({ noIncome: true }); return; }
    setOpen(true);
    setLoading(true);

    // Build projection rows
    const rows = profile.finance.items
      .filter(i => i.label !== 'Inkomst (CSN + jobb)')
      .map(item => {
        const newAmount = Math.round((item.pct / 100) * userIncome);
        const currentKey = Object.keys(userFinancialProfile?.budgetLimits || {})
          .find(k => item.label.toLowerCase().includes(k.replace(/_/g, ' ')));
        const currentAmount = currentKey ? (userFinancialProfile.budgetLimits[currentKey] || 0) : null;
        const diff = currentAmount !== null ? newAmount - currentAmount : null;
        return { ...item, newAmount, currentAmount, diff };
      });

    // AI reality check
    const rowsText = rows.map(r =>
      `${r.label}: ${r.currentAmount !== null ? fmt(r.currentAmount) + ' kr nu' : 'okänt nu'} → ${fmt(r.newAmount)} kr (${r.diff !== null ? (r.diff > 0 ? '+' : '') + fmt(r.diff) + ' kr' : 'ny post'})`
    ).join('\n');

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en ekonomisk rådgivare. En användare med ${fmt(userIncome)} kr/mån inkomst överväger att kopiera @${profile.username}s budget.

Förändringarna:
${rowsText}

Ge en kort, ärlig "reality check" på svenska. Max 3 meningar. Var specifik om den största vinsten och den svåraste uppoffringen. Ingen bullshit.`,
    });

    setSimulation({ rows, aiComment: aiResult });
    setLoading(false);
  };

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
      <button onClick={runSimulation}
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
        {open ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="w-4 h-4" style={{ color: '#F6AD55' }} />
                  </motion.div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Räknar ut din alternativa framtid...</span>
                </div>
              ) : simulation?.noIncome ? (
                <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Ange din inkomst i inställningar för att simulera.
                </p>
              ) : simulation && (
                <>
                  {/* Income context */}
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(246,173,85,0.08)', border: '1px solid rgba(246,173,85,0.2)' }}>
                    <p className="text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(246,173,85,0.6)' }}>DIN INKOMST</p>
                    <p className="text-lg font-black" style={{ color: '#F6AD55' }}>{fmt(userIncome)} kr/mån</p>
                  </div>

                  {/* Projection table */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="grid grid-cols-3 px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[9px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>KATEGORI</p>
                      <p className="text-[9px] font-black text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>IDAG</p>
                      <p className="text-[9px] font-black text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>NY MALL</p>
                    </div>
                    {simulation.rows.map((row, i) => {
                      const diffColor = row.diff === null ? 'rgba(255,255,255,0.3)'
                        : row.diff > 0 ? '#FF4466' : row.diff < 0 ? '#0FDEBD' : 'rgba(255,255,255,0.3)';
                      return (
                        <div key={i} className="grid grid-cols-3 px-3 py-2.5 items-center"
                          style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{row.icon}</span>
                            <p className="text-[9px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{row.label}</p>
                          </div>
                          <p className="text-[10px] font-black text-right" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {row.currentAmount !== null ? `${fmt(row.currentAmount)} kr` : '—'}
                          </p>
                          <div className="text-right">
                            <p className="text-[10px] font-black" style={{ color: row.color }}>{fmt(row.newAmount)} kr</p>
                            {row.diff !== null && (
                              <p className="text-[8px] font-black" style={{ color: diffColor }}>
                                {row.diff > 0 ? '+' : ''}{fmt(row.diff)} kr
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Reality check */}
                  {simulation.aiComment && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3 h-3" style={{ color: accentColor }} />
                        <p className="text-[9px] font-black tracking-widest" style={{ color: `${accentColor}70` }}>REALITY CHECK</p>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{simulation.aiComment}</p>
                    </div>
                  )}

                  {/* Activate button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={activateLifestyle}
                    disabled={activated}
                    className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                    style={{
                      background: activated
                        ? 'linear-gradient(135deg, rgba(15,222,189,0.2), rgba(15,222,189,0.1))'
                        : 'linear-gradient(135deg, rgba(246,173,85,0.25), rgba(246,173,85,0.1))',
                      color: activated ? '#0FDEBD' : '#F6AD55',
                      border: `1.5px solid ${activated ? 'rgba(15,222,189,0.5)' : 'rgba(246,173,85,0.4)'}`,
                      boxShadow: activated ? '0 0 20px rgba(15,222,189,0.15)' : '0 0 20px rgba(246,173,85,0.1)',
                    }}>
                    {activated
                      ? <><Check className="w-4 h-4" /> Livsstil aktiverad från @{profile.username}</>
                      : <><Zap className="w-4 h-4" /> AKTIVERA DENNA LIVSSTIL</>
                    }
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

// ── Main ExpandedProfile ───────────────────────────────────────────────────
export default function ExpandedProfile({ profile, onClose, userFinancialProfile }) {
  const [adopted, setAdopted] = useState(false);
  const isHybrid = profile.privacy_level === 'hybrid';
  const accentColor = profile.avatar_style?.bg || '#4B7CF3';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, rgba(5,8,20,0.99) 0%, rgba(8,12,28,0.99) 100%)',
          borderTop: `1px solid ${accentColor}25`,
        }}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}50`, boxShadow: `0 0 20px ${accentColor}30` }}>
            <AvatarSVG style={profile.avatar_style} size={56} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-black text-white">@{profile.username}</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}35` }}>
                {isHybrid ? '% PROCENT' : '🔓 KRONOR'}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {profile.display_name}, {profile.age}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio + trait */}
        <div className="px-6 mb-4 space-y-2">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.bio}</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>
            <Sparkles className="w-3 h-3" /> {profile.trait}
          </span>
        </div>

        {/* Orbit */}
        <p className="px-6 text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
          EKONOMISKT SOLSYSTEM — TRYCK PÅ EN PLANET FÖR DETALJER
        </p>
        <OrbitSystem profile={profile} accentColor={accentColor} />

        {/* Budget legend */}
        <div className="px-6 space-y-2 mt-2 mb-5">
          <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.18)' }}>BUDGETFÖRDELNING</p>
          {profile.finance.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                  <p className="text-xs font-black" style={{ color: item.color }}>
                    {isHybrid || !item.amount ? `${item.pct}%` : `${fmt(item.amount)} kr`}
                  </p>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-6 mb-5" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

        {/* AI Strategy Breakdown */}
        <AIStrategyBreakdown profile={profile} accentColor={accentColor} />

        <div className="my-3 mx-6" style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

        {/* Mirror Effect */}
        <MirrorEffect profile={profile} userFinancialProfile={userFinancialProfile} accentColor={accentColor} />

        {/* Quick adopt */}
        <div className="px-6 pt-5 pb-12">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleAdopt}
            className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
            style={{
              background: adopted
                ? 'linear-gradient(135deg, rgba(15,222,189,0.2), rgba(15,222,189,0.1))'
                : `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
              color: adopted ? '#0FDEBD' : accentColor,
              border: `1.5px solid ${adopted ? 'rgba(15,222,189,0.5)' : `${accentColor}50`}`,
              boxShadow: adopted ? '0 0 24px rgba(15,222,189,0.2)' : `0 0 24px ${accentColor}15`,
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