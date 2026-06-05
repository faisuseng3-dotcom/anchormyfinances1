import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SocialSquadsLink() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`${createPageUrl('Social')}?tab=friends`)}
      className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#6B9FFF]/25 bg-[#6B9FFF]/10 hover:bg-[#6B9FFF]/14 transition-colors"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white">Savings Squads</p>
          <p className="text-[13px] text-white/45 mt-0.5">Spara ihop med vänner mot gemensamma mål</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
    </button>
  );
}
