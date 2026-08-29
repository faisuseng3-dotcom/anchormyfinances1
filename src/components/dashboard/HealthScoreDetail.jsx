import React from 'react';
import { Check, X } from 'lucide-react';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';

/**
 * Förklarar hälsoscore-siffran i topbaren — vilka faktorer som räknas in
 * och varför, istället för en siffra utan sammanhang.
 */
export default function HealthScoreDetail({ isOpen, onClose, health }) {
  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Din ekonomiska hälsa"
      subtitle={`${health.score} av 100 — ${health.label}`}
    >
      <div className="space-y-2 pb-4">
        {health.factors.length === 0 && (
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Fyll i inkomst och fasta kostnader för att se vad som räknas in.
          </p>
        )}
        {health.factors.map((f) => (
          <div
            key={f.id}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[var(--color-border)]"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: f.ok ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
                color: f.ok ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {f.ok ? <Check size={14} /> : <X size={14} />}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{f.label}</p>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </AnchorSheet>
  );
}
