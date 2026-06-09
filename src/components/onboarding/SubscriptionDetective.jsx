import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Search, Film, Heart } from 'lucide-react';
import { CategoryIcon } from '@/lib/anchorIcons';

const POPULAR_SERVICES = [
  { name: 'Netflix', amount: 169, category: 'subscription' },
  { name: 'Spotify', amount: 129, category: 'subscription' },
  { name: 'Disney+', amount: 89, category: 'subscription' },
  { name: 'HBO Max', amount: 119, category: 'subscription' },
  { name: 'YouTube Premium', amount: 129, category: 'subscription' },
  { name: 'Apple TV+', amount: 99, category: 'subscription' },
  { name: 'ChatGPT Plus', amount: 220, category: 'other' },
  { name: 'Midjourney', amount: 110, category: 'other' },
  { name: 'Claude Pro', amount: 220, category: 'other' },
  { name: 'Copilot Pro', amount: 130, category: 'other' },
  { name: 'Perplexity Pro', amount: 220, category: 'other' },
  { name: 'Notion', amount: 120, category: 'other' },
  { name: 'Dropbox', amount: 130, category: 'other' },
  { name: 'Adobe CC', amount: 699, category: 'entertainment' },
  { name: 'Canva Pro', amount: 140, category: 'other' },
  { name: 'iCloud+', amount: 29, category: 'other' },
  { name: 'Gym', amount: 399, category: 'health' },
  { name: 'Yoga / PT', amount: 500, category: 'health' },
  { name: 'Shopify', amount: 350, category: 'shopping' },
  { name: 'Amazon Prime', amount: 89, category: 'shopping' },
];

const GROUP_LABELS = {
  streaming: { label: 'Streaming & Musik', Icon: Film },
  other: { label: 'Verktyg & SaaS', Icon: Search },
  health: { label: 'Hälsa & Träning', Icon: Heart },
};

const GROUPS = [
  { key: 'streaming', services: POPULAR_SERVICES.filter(s => s.category === 'subscription') },
  { key: 'other', services: POPULAR_SERVICES.filter(s => s.category === 'other') },
  { key: 'health', services: POPULAR_SERVICES.filter(s => s.category === 'health') },
];

export default function SubscriptionDetective({ selected, onToggle }) {
  const [open, setOpen] = useState(false);

  const selectedCount = selected.length;

  return (
    <div className="rounded-2xl border-indigo-500/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-300" />
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
              {GROUPS.map(group => {
                const GroupIcon = GROUP_LABELS[group.key].Icon;
                return (
                <div key={group.key}>
                  <p className="text-xs font-semibold text-slate-500 mb-2 px-1 flex items-center gap-1.5">
                    <GroupIcon className="w-3.5 h-3.5" />
                    {GROUP_LABELS[group.key].label}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.services.map(service => {
                      const isSelected = selected.some(s => s.name === service.name);
                      return (
                        <button
                          key={service.name}
                          onClick={() => onToggle(service)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-left transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/20 text-white'
                              : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <CategoryIcon category={service.category} size={16} className="text-white/70" />
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
              );})}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}