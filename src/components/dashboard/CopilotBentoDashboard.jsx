import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import QuickExpenseSheet from './QuickExpenseSheet';
import CopilotFreeMoneyHero from '@/components/ui-premium/copilot/CopilotFreeMoneyHero';
import ProactiveInsights from './ProactiveInsights';
import RetentionAlerts from './RetentionAlerts';
import { ArrowUp, Sparkles } from 'lucide-react';

const DASHBOARD_LAYOUT_ID = 'focus-v1';

export default function CopilotBentoDashboard({
  profile,
  transactions,
  updateProfile: _updateProfile,
  onOpenMagicEntry: _onOpenMagicEntry,
  onOpenTransactionHub: _onOpenTransactionHub,
  user: _user,
}) {
  const navigate = useNavigate();
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const [coachLine, setCoachLine] = useState(null);

  const { briefing } = useDashboardBriefing();
  useProactiveWeekPush(profile);

  useEffect(() => {
    const open = () => setQuickExpenseOpen(true);
    window.addEventListener('anchor:open-quick-expense', open);
    return () => window.removeEventListener('anchor:open-quick-expense', open);
  }, []);

  useEffect(() => {
    if (!profile?.income) return;
    let cancelled = false;
    askPersonalAdvisor({ scenario: 'pengometer_line' }, { profile, transactions })
      .then((res) => {
        if (!cancelled) setCoachLine(res);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [profile, transactions]);

  const handleCoachSend = useCallback(() => {
    if (coachInput.trim()) {
      window.dispatchEvent(
        new CustomEvent('anchor:open-voice', { detail: { prompt: coachInput.trim() } }),
      );
      setCoachInput('');
      return;
    }
    navigate(createPageUrl('AnchorAnalysis'));
  }, [coachInput, navigate]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CopilotBentoDashboard] active layout:', DASHBOARD_LAYOUT_ID);
    }
  }, []);

  return (
    <div
      className="copilot-bento-dashboard min-h-full flex flex-col flex-1 w-full"
      data-dashboard-layout={DASHBOARD_LAYOUT_ID}
    >
      <div className="copilot-content !pt-0 space-y-5 pb-24">

        <CopilotFreeMoneyHero />

        <RetentionAlerts profile={profile} transactions={transactions} />

        <ProactiveInsights profile={profile} transactions={transactions} />

        <div className="rounded-[24px] px-5 py-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-white">AI-Coach</span>
            <button
              type="button"
              onClick={() => navigate(createPageUrl('AnchorAnalysis'))}
              className="text-[12px] font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              Öppna →
            </button>
          </div>
          <div className="flex gap-2.5 mb-4">
            <Sparkles size={14} className="text-[#6B9FFF] shrink-0 mt-0.5" />
            <p className="text-[14px] text-white/70 leading-relaxed">
              {coachLine || briefing?.message || 'Fråga mig om budget, sparande eller din ekonomiska framtid.'}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 h-11 rounded-full bg-white/[0.05] px-4 text-[14px] text-white placeholder:text-white/30 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
              placeholder="Fråga vad som helst…"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
            />
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-[#4a7aff] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              onClick={handleCoachSend}
              aria-label="Skicka"
            >
              <ArrowUp size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="copilot-fab"
        title="Lägg till transaktion"
        aria-label="Lägg till transaktion"
        onClick={() => setQuickExpenseOpen(true)}
      >
        +
      </button>

      <QuickExpenseSheet
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        profile={profile}
      />
    </div>
  );
}
