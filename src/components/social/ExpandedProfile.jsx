import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, MapPin, Briefcase, Zap, ArrowRight } from 'lucide-react';
import { AvatarSVG } from './AvatarBuilder';
import { base44 } from '@/api/base44Client';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ── Glow Battery Bar ──────────────────────────────────────────────────────
function GlowBar({ emoji, label, value, color, delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        </div>
        <span className="text-xs font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />
        {/* Glow pulse at tip */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${value}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className="absolute top-0 bottom-0 w-1 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}`, transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}

// ── Sacrifice Gauge ───────────────────────────────────────────────────────
function SacrificeGauge({ score }) {
  const isHigh = score >= 70;
  const isMed = score >= 40;
  const color = isHigh ? '#FF4466' : isMed ? '#F6AD55' : '#0FDEBD';
  const label = isHigh ? '🔴 Kräver hög disciplin' : isMed ? '🟡 Kräver planering' : '🟢 Enkel omställning';

  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.6)' }}>LIVSSTILS-FÖRÄNDRING</p>
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{label}</span>
      </div>
      <div className="relative h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}60` }}
        />
      </div>
    </div>
  );
}

// ── Mirror Effect (two donut circles comparison) ──────────────────────────
function MirrorEffect({ profile, userFinancialProfile, accentColor }) {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const userIncome = userFinancialProfile?.income || 0;

  const profileItems = profile.finance.items.filter(i => i.label !== 'Inkomst (CSN + jobb)');

  // Calculate savings delta
  const totalNewPct = profileItems.reduce((a, b) => a + b.pct, 0);
  const savingsNewPct = Math.max(0, 100 - totalNewPct);
  const savingsNewKr = Math.round((savingsNewPct / 100) * userIncome);

  const totalUserSpend = Object.values(userFinancialProfile?.budgetLimits || {}).reduce((a, b) => a + b, 0);
  const savingsUserKr = Math.max(0, userIncome - totalUserSpend);
  const savingsDelta = savingsNewKr - savingsUserKr;

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!aiSummary && userIncome && !open) {
      setLoadingSummary(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ge en enda mening på svenska som sammanfattar vad det innebär för användaren att följa ${profile.display_name}s budget. 
Användarens inkomst: ${userIncome} kr/mån. Spardelta: ${savingsDelta > 0 ? '+' : ''}${fmt(savingsDelta)} kr/mån.
Profilen: ${profileItems.map(i => `${i.label}: ${i.pct}%`).join(', ')}.
Meningen ska vara emotionell, konkret och max 20 ord. Avsluta med "Är du redo?"`,
      });
      setAiSummary(result);
      setLoadingSummary(false);
    }
  };

  const activateLifestyle = async () => {
    if (!userFinancialProfile?.id || !userIncome) return;
    const newLimits = {};
    for (const item of profileItems) {
      const catKey = item.label.toLowerCase().replace(/[\s&()\/]/g, '_').replace(/_+/g, '_');
      newLimits[catKey] = Math.round((item.pct / 100) * userIncome);
    }
    await base44.entities.FinancialProfile.update(userFinancialProfile.id, { budgetLimits: newLimits });
    setActivated(true);
  };

  // Build donut data for SVG
  const buildDonut = (items, income) => {
    if (!income) return [];
    let angle = -90;
    return items.map(item => {
      const deg = Math.max((item.pct / 100) * 360, 2);
      const r = 30, cx = 40, cy = 40;
      const toRad = d => d * Math.PI / 180;
      const x1 = cx + r * Math.cos(toRad(angle));
      const y1 = cy + r * Math.sin(toRad(angle));
      const x2 = cx + r * Math.cos(toRad(angle + deg - 1));
      const y2 = cy + r * Math.sin(toRad(angle + deg - 1));
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
      angle += deg;
      return { ...item, path };
    });
  };

  const userItems = profileItems.map(item => {
    const currentKey = Object.keys(userFinancialProfile?.budgetLimits || {})
      .find(k => item.label.toLowerCase().includes(k.replace(/_/g, ' ')));
    const currentKr = currentKey ? (userFinancialProfile.budgetLimits[currentKey] || 0) : 0;
    return { ...item, pct: Math.round((currentKr / (userIncome || 1)) * 100) };
  });

  const userDonut = buildDonut(userItems, userIncome);
  const profileDonut = buildDonut(profileItems, userIncome);

  return (
    <div className="px-6 mb-4">
      <button onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
        style={{
          background: open ? `${accentColor}12` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? accentColor + '35' : 'rgba(255,255,255,0.07)'}`,
        }}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-xs font-black" style={{ color: open ? accentColor : 'rgba(255,255,255,0.6)' }}>
            PROVA DENNA LIVSSTIL
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 space-y-4">
              {!userIncome ? (
                <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Ange din inkomst i inställningar.</p>
              ) : (
                <>
                  {/* Two circles */}
                  <div className="flex items-center justify-around">
                    {/* Circle A — User today */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>IDAG</p>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                        {userDonut.map((a, i) => (
                          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="7" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 3px ${a.color}60)` }} />
                        ))}
                        <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="900" fill="rgba(255,255,255,0.5)">DU</text>
                      </svg>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="w-5 h-5" style={{ color: accentColor }} />
                      {savingsDelta !== 0 && (
                        <span className="text-[9px] font-black" style={{ color: savingsDelta > 0 ? '#0FDEBD' : '#FF4466' }}>
                          {savingsDelta > 0 ? '+' : ''}{fmt(savingsDelta)} kr
                        </span>
                      )}
                    </div>

                    {/* Circle B — New template */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[9px] font-black tracking-widest" style={{ color: accentColor }}>MED @{profile.username}</p>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                        {profileDonut.map((a, i) => (
                          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="7" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 4px ${a.color}80)` }} />
                        ))}
                        <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="900" fill={accentColor}>NY</text>
                      </svg>
                    </div>
                  </div>

                  {/* AI summary */}
                  {loadingSummary ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
                      </motion.div>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>AI analyserar...</span>
                    </div>
                  ) : aiSummary ? (
                    <div className="rounded-xl px-4 py-3 text-center" style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}25` }}>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{aiSummary}</p>
                    </div>
                  ) : null}

                  {/* Activate button */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={activateLifestyle} disabled={activated}
                    className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                    style={{
                      background: activated ? 'rgba(15,222,189,0.15)' : `${accentColor}20`,
                      color: activated ? '#0FDEBD' : accentColor,
                      border: `1.5px solid ${activated ? 'rgba(15,222,189,0.4)' : accentColor + '45'}`,
                    }}>
                    {activated
                      ? <><Check className="w-4 h-4" /> Livsstil aktiverad!</>
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

// ── Main ──────────────────────────────────────────────────────────────────
export default function ExpandedProfile({ profile, onClose, userFinancialProfile }) {
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const accentColor = profile.avatar_style?.bg || '#4B7CF3';
  const isHybrid = profile.privacy_level === 'hybrid';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const itemsText = profile.finance.items.map(i => `${i.label}: ${i.pct}%`).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en ekonomisk beteendevetare. Analysera denna budget och returnera exakt detta JSON på svenska:

Profil: ${profile.display_name || profile.username}, ${profile.age} år, ${profile.occupation}. Budget: ${itemsText}.

- title: en engelsk "livsstils-titel" (t.ex. "The Minimalist Adventurer", "The Future Builder") — max 3 ord
- tagline: EN mening på svenska, max 10 ord, känslosam och direkt
- krockkudde: 0-100 (hur trygg ekonomin är vid kriser)
- raket: 0-100 (hur snabbt de bygger förmögenhet)
- guldkant: 0-100 (hur mycket livskvalitet/nöje de unnar sig nu)
- superpower: kortfattat (5 ord max) — vad de är riktigt bra på, med emoji i början
- price: kortfattat (5 ord max) — vad de offrar för det, med emoji i början
- sacrifice_score: 0-100 (hur hårt är det att kopiera denna livsstil)
- ai_line: EN enda mening på svenska, MAX 18 ord, om vad budgeten egentligen innebär för livet`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            tagline: { type: 'string' },
            krockkudde: { type: 'number' },
            raket: { type: 'number' },
            guldkant: { type: 'number' },
            superpower: { type: 'string' },
            price: { type: 'string' },
            sacrifice_score: { type: 'number' },
            ai_line: { type: 'string' },
          }
        }
      });
      if (!cancelled) { setPersona(result); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [profile.id]);

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
        <div className="px-6 pt-8 pb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}50`, boxShadow: `0 0 20px ${accentColor}30` }}>
            <AvatarSVG style={profile.avatar_style} size={56} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white mb-0.5">@{profile.username}</h2>
            {loading ? (
              <div className="h-4 w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ) : persona ? (
              <p className="text-sm font-black" style={{ color: accentColor }}>"{persona.title}"</p>
            ) : null}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {profile.occupation && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" style={{ color: accentColor }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.occupation}</span>
                </div>
              )}
              {profile.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" style={{ color: accentColor }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Livsstils-mätare (The Vibe Bars) ── */}
        <div className="px-6 mb-5">
          <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>LIVSSTILS-MÄTARE</p>
          <div className="rounded-2xl p-4 space-y-4" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))}
                <div className="flex items-center gap-2 justify-center pt-1">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  </motion.div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Analyserar livsstil...</span>
                </div>
              </div>
            ) : persona ? (
              <>
                {persona.tagline && (
                  <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.4)' }}>"{persona.tagline}"</p>
                )}
                <GlowBar emoji="🛡️" label="Krockkudde" value={Math.round(persona.krockkudde || 0)} color="#0FDEBD" delay={0.1} />
                <GlowBar emoji="🚀" label="Raket" value={Math.round(persona.raket || 0)} color="#4B7CF3" delay={0.2} />
                <GlowBar emoji="☕" label="Guldkant" value={Math.round(persona.guldkant || 0)} color="#F6AD55" delay={0.3} />

                {/* AI one-liner */}
                {persona.ai_line && (
                  <div className="rounded-xl px-3 py-2.5 mt-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>{persona.ai_line}</p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Superpower & Price ── */}
        {persona && (
          <div className="px-6 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(15,222,189,0.07)', border: '1px solid rgba(15,222,189,0.2)' }}>
                <p className="text-[9px] font-black tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>SUPERKRAFT</p>
                <p className="text-sm font-black" style={{ color: '#0FDEBD' }}>{persona.superpower}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,68,102,0.07)', border: '1px solid rgba(255,68,102,0.2)' }}>
                <p className="text-[9px] font-black tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>PRISET</p>
                <p className="text-sm font-black" style={{ color: '#FF4466' }}>{persona.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Sacrifice Gauge ── */}
        {persona && (
          <div className="px-6 mb-5">
            <SacrificeGauge score={persona.sacrifice_score || 0} />
          </div>
        )}

        {/* ── Budget bars ── */}
        <div className="px-6 space-y-2 mb-5">
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

        {/* ── Mirror Effect ── */}
        <MirrorEffect profile={profile} userFinancialProfile={userFinancialProfile} accentColor={accentColor} />

        <div className="pb-14" />
      </motion.div>
    </motion.div>
  );
}