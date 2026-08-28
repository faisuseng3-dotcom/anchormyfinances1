// @ts-nocheck
import React, { useMemo } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AnchorChat from '@/components/chat/AnchorChat';
import { COACH_SUGGESTIONS } from '@/lib/coachSuggestions';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { runInsightEngine } from '@/lib/insightEngine';

export default function AnchorAnalysis() {
  const navigate = useNavigate();
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });

  // Samma insight-motor som Hem — Coach ska leda med något den redan vet,
  // inte bara vänta på att man väljer en fråga.
  const topInsight = useMemo(() => {
    const insights = runInsightEngine(profile, transactions || []);
    return [...insights].sort((a, b) => b.severity - a.severity)[0] || null;
  }, [profile, transactions]);

  const handleSuggestion = (item) => {
    if (item.navigate && item.href) {
      navigate(item.href);
      return;
    }
    window.dispatchEvent(
      new CustomEvent('anchor:coach-prompt', { detail: { prompt: item.prompt } }),
    );
  };

  const handleAskAboutInsight = () => {
    if (!topInsight) return;
    window.dispatchEvent(
      new CustomEvent('anchor:coach-prompt', { detail: { prompt: topInsight.title } }),
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

      {topInsight && (
        <div className="px-4 pb-3 shrink-0">
          <button
            type="button"
            onClick={handleAskAboutInsight}
            className="w-full text-left rounded-2xl p-4 organic-surface bg-white border border-[var(--color-border)] active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-accent)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1">
                  Baserat på din ekonomi just nu
                </p>
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)] leading-snug">{topInsight.title}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-snug">{topInsight.description}</p>
              </div>
            </div>
          </button>
        </div>
      )}

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
