import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function SocialSquadsLink() {
  const navigate = useNavigate();

  return (
    <AnchorPressable
      type="button"
      onClick={() => navigate(`${createPageUrl('Social')}?tab=friends`)}
      className="w-full flex items-center justify-between p-4 rounded-[var(--anchor-radius-lg)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/20 anchor-elev-1 mb-2"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="w-11 h-11 rounded-[var(--anchor-radius-lg)] bg-[var(--color-accent)]/15 ring-1 ring-[var(--color-accent)]/25 flex items-center justify-center">
          <Users className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white">Savings Squads</p>
          <p className="anchor-type-body-sm mt-0.5">Spara ihop med vänner mot gemensamma mål</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
    </AnchorPressable>
  );
}
