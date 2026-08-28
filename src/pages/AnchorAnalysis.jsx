// @ts-nocheck
import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useNavigate } from 'react-router-dom';
import AnchorChat from '@/components/chat/AnchorChat';
import { COACH_SUGGESTIONS } from '@/lib/coachSuggestions';

export default function AnchorAnalysis() {
  const navigate = useNavigate();

  const handleSuggestion = (item) => {
    if (item.navigate && item.href) {
      navigate(item.href);
      return;
    }
    window.dispatchEvent(
      new CustomEvent('anchor:coach-prompt', { detail: { prompt: item.prompt } }),
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overscrollBehavior: 'contain' }}>
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <h1 className="anchor-wordmark" style={{ fontSize: 22, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1 }}>
          Coach
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 5 }}>
          Välj en fråga — eller skriv din egen
        </p>
      </div>

      <div className="px-4 pb-3 shrink-0 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] px-1">
          Föreslagna frågor
        </p>
        <div className="grid grid-cols-1 gap-2">
          {COACH_SUGGESTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSuggestion(item)}
              className="w-full text-left px-4 py-3.5 rounded-2xl text-[14px] text-[var(--color-text-secondary)] touch-manipulation active:scale-[0.99] transition-transform bg-white border border-[var(--color-border)]"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <AnchorChat hideSuggestions />
    </div>
  );
}

export const pageSeo = pageSeoFor('AnchorAnalysis');
