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
        className="flex items-center gap-1 text-[15px] font-medium text-[var(--color-text-secondary)] touch-manipulation hover:text-[var(--color-text-primary)] transition-colors pt-2"
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
      style={{ background: 'var(--color-accent-soft)', border: '1px solid rgba(37, 99, 235, 0.15)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Importera från banken</p>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Ladda upp CSV från din bank</p>
      </div>
      <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0" />
    </button>
  );
}
