import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getConcernById } from '@/lib/onboardingFocus';
import { anchorZoneClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function HomeFocusBanner({ profile, onAction }) {
  const concern = useMemo(() => getConcernById(profile?.topConcern), [profile?.topConcern]);
  if (!concern) return null;

  const handleCta = () => {
    if (concern.action === 'plan') {
      window.location.href = createPageUrl('FuturePulse');
      return;
    }
    onAction?.(concern.action);
  };

  return (
    <div className={anchorZoneClass}>
      <div className="rounded-xl px-4 py-3 border border-[#6B9FFF]/25 bg-[#6B9FFF]/10">
        <p className="text-[12px] text-[#9FB5FF] font-medium uppercase tracking-wide">Ditt fokus</p>
        <p className="text-[14px] text-white/85 mt-1 leading-relaxed">{concern.hint}</p>
        {concern.action === 'plan' ? (
          <Link
            to={createPageUrl('FuturePulse')}
            className="inline-block mt-2 text-[14px] font-semibold text-white hover:text-white/90 no-underline"
          >
            {concern.cta} →
          </Link>
        ) : (
          <button type="button" onClick={handleCta} className="mt-2 text-[14px] font-semibold text-white hover:text-white/90">
            {concern.cta} →
          </button>
        )}
      </div>
      <p className={`${sectionSubtitleClass} mt-2`}>Baserat på vad du valde i onboarding.</p>
    </div>
  );
}
