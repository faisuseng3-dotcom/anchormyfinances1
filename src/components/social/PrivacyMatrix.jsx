import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BarChart2, Ghost } from 'lucide-react';

const PRIVACY_LEVELS = [
  {
    id: 'full',
    label: 'Full delning',
    sub: 'Vänner ser faktiska kronor och procentuell fördelning',
    Icon: Eye,
    color: '#0FDEBD',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    sub: 'Vänner ser bara procentuell fördelning, inga kronbelopp',
    Icon: BarChart2,
    color: '#A78BFA',
  },
  {
    id: 'ghost',
    label: 'Ghost-läge',
    sub: 'Vänner ser bara din avatar och framsteg, ingen ekonomisk data',
    Icon: Ghost,
    color: '#9AA5B4',
  },
];

const ALL_CATEGORIES = [
  { id: 'food',          label: 'Mat' },
  { id: 'transport',     label: 'Transport' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'health',        label: 'Hälsa' },
  { id: 'shopping',      label: 'Shopping' },
  { id: 'travel',        label: 'Resor' },
  { id: 'savings',       label: 'Sparande' },
  { id: 'other',         label: 'Övrigt' },
];

export default function PrivacyMatrix({ privacyLevel, sharedCategories, onPrivacyChange, onCategoriesChange }) {
  const toggleCategory = (id) => {
    const current = sharedCategories || ALL_CATEGORIES.map(c => c.id);
    if (current.includes(id)) {
      onCategoriesChange(current.filter(c => c !== id));
    } else {
      onCategoriesChange([...current, id]);
    }
  };

  const activeCats = sharedCategories && sharedCategories.length > 0
    ? sharedCategories
    : ALL_CATEGORIES.map(c => c.id);

  return (
    <div className="space-y-5">
      {/* Privacy level */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Delningsnivå</p>
        <div className="space-y-2">
          {PRIVACY_LEVELS.map(level => {
            const active = privacyLevel === level.id;
            const Ic = level.Icon;
            return (
              <motion.button
                key={level.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPrivacyChange(level.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: active ? `${level.color}15` : 'var(--color-surface)',
                  border: active ? `1.5px solid ${level.color}60` : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${level.color}20` }}>
                  <Ic className="w-5 h-5" style={{ color: level.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{level.label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>{level.sub}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                  style={{ borderColor: active ? level.color : 'rgba(255,255,255,0.2)', background: active ? level.color : 'transparent' }}>
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category filter — only relevant for full/hybrid */}
      {privacyLevel !== 'ghost' && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Kategorier att dela
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => {
              const on = activeCats.includes(cat.id);
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCategory(cat.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: on ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: on ? 'white' : 'var(--color-text-muted)',
                    border: on ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {cat.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}