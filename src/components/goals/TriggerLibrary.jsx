import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TRIGGER_CATEGORIES = [
  {
    id: 'health',
    label: '🥗 Hälsa',
    color: 'from-emerald-500 to-green-600',
    border: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.08)',
    triggers: [
      { id: 'steps', label: '👣 Steg-utmaningen', desc: 'Spara 1 kr per 1 000 steg du går.', amount: 10, users: 3241 },
      { id: 'sleep', label: '😴 Sömntuta', desc: 'Spara 20 kr varje natt du sover 7+ timmar.', amount: 20, users: 1872 },
      { id: 'screentime', label: '📵 Skärmtid-skatt', desc: 'Mobil > 3 h? 50 kr straffas till bufferten.', amount: 50, users: 894 },
    ]
  },
  {
    id: 'mindful',
    label: '🛍️ Shopping-stopp',
    color: 'from-blue-500 to-indigo-600',
    border: 'rgba(99,102,241,0.3)',
    bg: 'rgba(99,102,241,0.08)',
    triggers: [
      { id: 'luncbox', label: '🥡 Matlåda-vinsten', desc: 'Ta med matlåda istället för att äta ute → spara 100 kr.', amount: 100, users: 1420 },
      { id: 'secondhand', label: '♻️ Second Hand-bonus', desc: 'Köp begagnat → spara 50% av det du "tjänade".', amount: 50, users: 677 },
      { id: 'cart_wait', label: '⏳ Vänta 24 timmar', desc: 'Lägg i varukorg men vänta → spara en tålamods-peng på 20 kr.', amount: 20, users: 2105 },
    ]
  },
  {
    id: 'fun',
    label: '🎮 Livsnjut',
    color: 'from-purple-500 to-pink-600',
    border: 'rgba(168,85,247,0.3)',
    bg: 'rgba(168,85,247,0.08)',
    triggers: [
      { id: 'rain', label: '🌧️ Väder-spararen', desc: 'Spara 10 kr varje dag det regnar.', amount: 10, users: 561 },
      { id: 'transport', label: '🚲 Transport-hack', desc: 'Cykla/gå istället för buss → spara 39 kr.', amount: 39, users: 988 },
      { id: 'bonus', label: '🎁 Lönegodis', desc: 'Bonus eller Swish från kompis → spara 1% extra.', amount: null, users: 342 },
    ]
  },
  {
    id: 'custom',
    label: '✍️ Custom',
    color: 'from-amber-500 to-orange-600',
    border: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.08)',
    triggers: [
      { id: 'workout', label: '🏋️ Träningspass', desc: 'Spara ett belopp varje gång du tränar.', amount: 50, users: 2830 },
      { id: 'no_purchase', label: '🛑 Shoppa-fritt', desc: 'Klarar du en dag utan köp? Spara 100 kr.', amount: 100, users: 1654 },
      { id: 'football', label: '⚽ Favoritlaget gör mål', desc: 'Ditt lag gör mål → spara 10 kr.', amount: 10, users: 419 },
      { id: 'coffee_skip', label: '☕ Hoppa köpkaffe', desc: 'Brygger hemma istället → spara 45 kr.', amount: 45, users: 3102 },
    ]
  },
];

export default function TriggerLibrary({ activeTrigger, onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('health');
  const cat = TRIGGER_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Trigger-bibliotek</p>
          <p className="text-[11px] text-slate-500">Välj en händelse som utlöser ditt sparande</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
        {TRIGGER_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCategory === c.id ? `bg-gradient-to-r ${c.color} text-white shadow` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Triggers list */}
      <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
            {cat.triggers.map(t => {
              const isActive = activeTrigger === t.id;
              return (
                <button key={t.id} onClick={() => onSelect(t)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 ${isActive ? 'ring-2 ring-purple-500' : 'hover:bg-white/5'}`}
                  style={{ background: isActive ? cat.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? cat.border : 'transparent'}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{t.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                    <p className="text-[10px] text-slate-600 mt-1">👥 {t.users.toLocaleString('sv-SE')} sparar med denna trigger</p>
                  </div>
                  {t.amount && (
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-bold text-emerald-400">+{t.amount} kr</span>
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}