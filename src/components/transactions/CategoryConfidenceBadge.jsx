import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { categorizeLocal, confidenceLabel } from '@/lib/categoryRouter';

/**
 * Visar om kategorin är säker (regler/override) eller bör granskas.
 */
export default function CategoryConfidenceBadge({ vendor, label, amount, className = '' }) {
  const text = vendor || label || '';
  if (!text) return null;

  const meta = categorizeLocal(text, { amount });
  const level = confidenceLabel(meta.confidence);

  if (level === 'high') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ${className}`}
        title="Säker kategori"
      >
        <Sparkles className="w-2.5 h-2.5" />
        Säker
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 text-white/55 ${className}`}
        title="Kategori baserad på mönster"
      >
        Uppskattad
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 ${className}`}
      title="Granska kategorin"
    >
      <AlertCircle className="w-2.5 h-2.5" />
      Granska
    </span>
  );
}
