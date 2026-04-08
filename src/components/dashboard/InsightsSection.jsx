import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ACTION_ROUTES = {
  'Se kostnadsförslag': 'Settings',
  'Skapa sparplan': 'Settings',
  'Analysera lån': 'Loans',
};

// Smarta "Insight Cards" som AI-notiser — kortfattade och handlingsbara
function InsightCard({ insight, index, profile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [acted, setActed] = useState(false);

  if (dismissed) return null;

  const isSuccess = insight.type === 'success';
  const isDanger = insight.type === 'danger';
  const accentColor = isSuccess ? 'var(--color-success)' : isDanger ? 'var(--color-danger)' : 'var(--color-warning)';

  // Generera ett mänskligt förslag baserat på insiktens typ
  const getSuggestion = () => {
    if (isSuccess) return null;
    if (insight.title === 'Liten marginal') {
      const saving = profile ? Math.round((profile.income - (profile.income * 0.15))) : 0;
      return {
        question: `Vill du att jag visar hur du kan öka din marginal?`,
        yesLabel: 'Visa förslag',
        yesAction: () => navigate(createPageUrl('Settings')),
      };
    }
    if (insight.title === 'Bufferten är låg') {
      return {
        question: `Ska jag ta fram en sparplan för att nå 3 månaders buffert?`,
        yesLabel: 'Ja, visa plan',
        yesAction: () => navigate(createPageUrl('Settings')),
      };
    }
    if (insight.title === 'Flera lån med ränta') {
      return {
        question: `Vill du se hur mycket du kan spara genom att samla dina lån?`,
        yesLabel: 'Analysera',
        yesAction: () => navigate(createPageUrl('Loans')),
      };
    }
    return null;
  };

  const suggestion = getSuggestion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-4"
      style={{
        background: 'var(--color-card)',
        border: `1px solid ${accentColor}22`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accentColor}18` }}
        >
          {isSuccess
            ? <CheckCircle className="w-4 h-4" style={{ color: accentColor }} />
            : <AlertTriangle className="w-4 h-4" style={{ color: accentColor }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {insight.title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {insight.description}
          </p>
          {insight.impact && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {insight.impact}
            </p>
          )}

          {/* Handlingsbar fråga — Monzo-stil */}
          {suggestion && !acted && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                {suggestion.question}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setActed(true); suggestion.yesAction(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {suggestion.yesLabel}
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
                >
                  Inte nu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function InsightsSection({ insights, profile }) {
  const successInsights = insights.filter(i => i.type === 'success');
  const warningInsights = insights.filter(i => i.type === 'warning' || i.type === 'danger');
  const allInsights = [...warningInsights, ...successInsights];

  if (allInsights.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
        Din ekonomi just nu
      </p>
      <AnimatePresence>
        {allInsights.map((insight, i) => (
          <InsightCard key={i} insight={insight} index={i} profile={profile} />
        ))}
      </AnimatePresence>
    </div>
  );
}