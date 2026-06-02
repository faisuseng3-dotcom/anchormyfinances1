import React from 'react';
import { motion } from 'framer-motion';
import { Eye, BarChart2, Ghost, Check } from 'lucide-react';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { cn } from '@/lib/utils';

const PRIVACY_LEVELS = [
  {
    id: 'full',
    label: 'Full delning',
    sub: 'Vänner och Jämför kan se kronor och procent om du publicerar.',
    Icon: Eye,
    color: '#34D399',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    sub: 'Bara procent delas — inga kronbelopp — i Jämför och mot vänner.',
    Icon: BarChart2,
    color: '#9FB5FF',
  },
  {
    id: 'ghost',
    label: 'Ghost-läge',
    sub: 'Profil syns, men ingen ekonomisk data och ingen publicering i Jämför.',
    Icon: Ghost,
    color: '#94A3B8',
  },
];

const ALL_CATEGORIES = [
  { id: 'food', label: 'Mat' },
  { id: 'transport', label: 'Transport' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'health', label: 'Hälsa' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'travel', label: 'Resor' },
  { id: 'savings', label: 'Sparande' },
  { id: 'other', label: 'Övrigt' },
];

export default function PrivacyMatrix({
  privacyLevel,
  sharedCategories,
  onPrivacyChange,
  onCategoriesChange,
}) {
  const toggleCategory = (id) => {
    const current = sharedCategories?.length
      ? sharedCategories
      : ALL_CATEGORIES.map((c) => c.id);
    if (current.includes(id)) {
      onCategoriesChange(current.filter((c) => c !== id));
    } else {
      onCategoriesChange([...current, id]);
    }
  };

  const activeCats =
    sharedCategories && sharedCategories.length > 0
      ? sharedCategories
      : ALL_CATEGORIES.map((c) => c.id);

  return (
    <div className="space-y-6">
      <div>
        <p className={sectionMetaClass}>Delningsnivå</p>
        <p className={`${sectionSubtitleClass} mt-1 mb-3`}>
          Styr vad vänner ser och om du kan publicera i Jämför.
        </p>
        <div className="space-y-2">
          {PRIVACY_LEVELS.map((level) => {
            const active = privacyLevel === level.id;
            const Ic = level.Icon;
            return (
              <motion.button
                key={level.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => onPrivacyChange(level.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-colors border',
                  active
                    ? 'bg-white/[0.06] border-white/20'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/14',
                )}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${level.color}18` }}
                >
                  <Ic className="w-5 h-5" style={{ color: level.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white">{level.label}</p>
                  <p className={`${sectionSubtitleClass} mt-0.5`}>{level.sub}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    active ? 'border-white bg-white' : 'border-white/25',
                  )}
                >
                  {active && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {privacyLevel !== 'ghost' && (
        <div>
          <p className={sectionMetaClass}>Kategorier att dela</p>
          <p className={`${sectionSubtitleClass} mt-1 mb-3`}>
            Välj vilka utgiftskategorier som får synas för vänner.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const on = activeCats.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                    on
                      ? 'bg-white text-[#0a1628]'
                      : 'bg-white/[0.06] text-white/55 border border-white/10 hover:border-white/20',
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
