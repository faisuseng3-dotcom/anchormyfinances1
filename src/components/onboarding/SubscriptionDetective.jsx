import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const POPULAR_SERVICES = [
  // Streaming
  { name: 'Netflix', amount: 169, category: 'streaming', emoji: '🎬' },
  { name: 'Spotify', amount: 129, category: 'streaming', emoji: '🎵' },
  { name: 'Disney+', amount: 89, category: 'streaming', emoji: '🏰' },
  { name: 'HBO Max', amount: 119, category: 'streaming', emoji: '📺' },
  { name: 'YouTube Premium', amount: 129, category: 'streaming', emoji: '▶️' },
  { name: 'Apple TV+', amount: 99, category: 'streaming', emoji: '🍎' },
  // AI-verktyg
  { name: 'ChatGPT Plus', amount: 220, category: 'other', emoji: '🤖' },
  { name: 'Midjourney', amount: 110, category: 'other', emoji: '🎨' },
  { name: 'Claude Pro', amount: 220, category: 'other', emoji: '💬' },
  { name: 'Copilot Pro', amount: 130, category: 'other', emoji: '🧠' },
  { name: 'Perplexity Pro', amount: 220, category: 'other', emoji: '🔍' },
  // SaaS / Produktivitet
  { name: 'Notion', amount: 120, category: 'other', emoji: '📝' },
  { name: 'Dropbox', amount: 130, category: 'other', emoji: '☁️' },
  { name: 'Adobe CC', amount: 699, category: 'other', emoji: '🎭' },
  { name: 'Canva Pro', amount: 140, category: 'other', emoji: '✏️' },
  { name: 'iCloud+', amount: 29, category: 'other', emoji: '☁️' },
  // Hälsa & Träning
  { name: 'Gym', amount: 399, category: 'health', emoji: '💪' },
  { name: 'Yoga / PT', amount: 500, category: 'health', emoji: '🧘' },
  // E-handel
  { name: 'Shopify', amount: 350, category: 'other', emoji: '🛍️' },
  { name: 'Amazon Prime', amount: 89, category: 'other', emoji: '📦' },
];

const GROUP_LABELS = {
  streaming: '🎬 Streaming & Musik',
  other: '🤖 AI-verktyg & SaaS',
  health: '💪 Hälsa & Träning',
};

const GROUPS = [
  { key: 'streaming', services: POPULAR_SERVICES.filter(s => s.category === 'streaming') },
  { key: 'other', services: POPULAR_SERVICES.filter(s => s.category === 'other') },
  { key: 'health', services: POPULAR_SERVICES.filter(s => s.category === 'health') },
];

export default function SubscriptionDetective({ selected, onToggle }) {
  const [open, setOpen] = useState(false);

  const selectedCount = selected.length;

  return (
    <div className="rounded-xl border border-indigo-500/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🕵️</span>
          <span className="text-sm font-semibold text-white">Prenumerationsdetektiven</span>
          {selectedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-xs text-white font-bold">
              {selectedCount} valda
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-4 bg-[#0d1321]">
              <p className="text-xs text-slate-400 px-1">Klicka i de tjänster du prenumererar på – priserna är uppskattningar, du kan justera dem.</p>
              {GROUPS.map(group => (
                <div key={group.key}>
                  <p className="text-xs font-semibold text-slate-500 mb-2 px-1">{GROUP_LABELS[group.key]}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.services.map(service => {
                      const isSelected = selected.some(s => s.name === service.name);
                      return (
                        <button
                          key={service.name}
                          onClick={() => onToggle(service)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/20 text-white'
                              : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-base">{service.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{service.name}</p>
                            <p className="text-[10px] text-slate-500">{service.amount} kr/mån</p>
                          </div>
                          {isSelected && (
                            <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}