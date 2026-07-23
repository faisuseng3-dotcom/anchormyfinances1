// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ImportBankCta({ transactionCount = 0, variant = 'card' }) {
  const navigate = useNavigate();

  if (transactionCount >= 8) return null;

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={() => navigate(createPageUrl('Import'))}
        className="flex items-center gap-1 text-[15px] font-medium text-white/40 touch-manipulation hover:text-white/60 transition-colors pt-2"
      >
        Importera transaktioner
        <ChevronRight size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(createPageUrl('Import'))}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left touch-manipulation active:scale-[0.99] transition-transform"
      style={{ background: 'rgba(79, 174, 130, 0.08)', border: '1px solid rgba(79, 174, 130, 0.15)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white">Importera från banken</p>
        <p className="text-[13px] text-white/45 mt-0.5">Ladda upp CSV från din bank</p>
      </div>
      <ChevronRight size={16} className="text-white/25 shrink-0" />
    </button>
  );
}
