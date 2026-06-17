// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ImportBankCta({ transactionCount = 0 }) {
  const navigate = useNavigate();

  if (transactionCount >= 8) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(createPageUrl('Import'))}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left touch-manipulation active:scale-[0.99] transition-transform"
      style={{ background: 'rgba(107,159,255,0.08)', border: '1px solid rgba(107,159,255,0.15)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(107,159,255,0.15)' }}>
        <FileUp size={18} className="text-[#6B9FFF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white">Importera från banken</p>
        <p className="text-[13px] text-white/45 mt-0.5">Ladda upp CSV — Anchor analyserar allt</p>
      </div>
      <ChevronRight size={16} className="text-white/25 shrink-0" />
    </button>
  );
}
