import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getConcernById } from '@/lib/onboardingFocus';
import { dashZone, dashPill } from '@/lib/dashboardTheme';

export default function HomeFocusBanner({ profile, onAction, variant = 'default' }) {
  const concern = useMemo(() => getConcernById(profile?.topConcern), [profile?.topConcern]);
  if (!concern) return null;

  const handleCta = () => {
    if (concern.action === 'plan') {
      window.location.href = createPageUrl('FuturePulse');
      return;
    }
    onAction?.(concern.action);
  };

  if (variant === 'chip') {
    return (
      <div className={dashZone}>
        {concern.action === 'plan' ? (
          <Link to={createPageUrl('FuturePulse')} className={`${dashPill} no-underline hover:bg-white/[0.1]`}>
            <span className="text-white/90">{concern.cta}</span>
            <span className="text-white/35">→</span>
          </Link>
        ) : (
          <button type="button" onClick={handleCta} className={dashPill}>
            <span className="text-white/90">{concern.cta}</span>
            <span className="text-white/35">→</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={dashZone}>
      <p className="text-[14px] text-white/55">{concern.hint}</p>
      {concern.action === 'plan' ? (
        <Link
          to={createPageUrl('FuturePulse')}
          className="inline-block mt-2 text-[14px] font-semibold text-white no-underline"
        >
          {concern.cta} →
        </Link>
      ) : (
        <button type="button" onClick={handleCta} className="mt-2 text-[14px] font-semibold text-white">
          {concern.cta} →
        </button>
      )}
    </div>
  );
}
