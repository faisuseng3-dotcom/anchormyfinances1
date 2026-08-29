import React from 'react';
import { Eye, BarChart2, Ghost, Check } from 'lucide-react';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { cn } from '@/lib/utils';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const PRIVACY_LEVELS = [
  {
    id: 'full',
    label: 'Full delning',
    sub: 'Vänner och Jämför kan se kronor och procent om du publicerar.',
    Icon: Eye,
    iconWrap: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    sub: 'Bara procent delas — inga kronbelopp — i Jämför och mot vänner.',
    Icon: BarChart2,
    iconWrap: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  },
  {
    id: 'ghost',
    label: 'Ghost-läge',
    sub: 'Profil syns, men ingen ekonomisk data och ingen publicering i Jämför.',
    Icon: Ghost,
    iconWrap: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]',
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
              <AnchorPressable
                key={level.id}
                type="button"
                onClick={() => onPrivacyChange(level.id)}
                minTouch={false}
                className={cn(
                  'w-full flex items-center gap-4 p-4 min-h-[4.5rem] rounded-[var(--anchor-radius-lg)] text-left ring-1 bg-white',
                  active
                    ? 'ring-[var(--color-accent)]/40 anchor-elev-1'
                    : 'ring-[var(--color-border)]',
                )}
              >
                <div className={`w-11 h-11 rounded-[var(--anchor-radius-lg)] flex items-center justify-center flex-shrink-0 ${level.iconWrap}`}>
                  <Ic className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{level.label}</p>
                  <p className={`${sectionSubtitleClass} mt-0.5`}>{level.sub}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    active ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]',
                  )}
                >
                  {active && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </AnchorPressable>
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
                <AnchorPressable
                  key={cat.id}
                  type="button"
                  minTouch={false}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'px-3 py-2 min-h-10 rounded-full text-[13px] font-medium',
                    on
                      ? 'bg-[var(--color-text-primary)] text-white'
                      : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]',
                  )}
                >
                  {cat.label}
                </AnchorPressable>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
