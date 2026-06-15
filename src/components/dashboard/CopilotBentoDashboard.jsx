import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { COPILOT_VIEWS, copilotToolHref } from '@/lib/copilotViews';
import {
  moodToToneMode,
  calculatePengometer,
  scanSubscriptions,
} from '@/lib/anchorBrain';
import { calculateWeeklyHealthScore } from '@/lib/weeklyHealthScore';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { getPrimaryContextualLesson } from '@/lib/contextualLessons';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import QuickExpenseSheet from './QuickExpenseSheet';
import AcademyLessonSheet from '@/components/anchorBrain/AcademyLessonSheet';
import { CategoryIcon } from '@/lib/anchorIcons';
import DreamBuilder from '@/components/goals/DreamBuilder';
import { calcUnderBudgetStreak } from '@/lib/budgetStreak';
import { calcSavingsStreak } from '@/lib/microWins';
import { TrendingUp, Flame, Sparkles, ArrowUp } from 'lucide-react';
import {
  buildSavingsGoals,
  buildFutureScenarios,
  buildReviewQueue,
  getSubscriptionTotal,
  getUpcomingSubscriptions,
} from './copilot/copilotDashboardUtils';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const DASHBOARD_LAYOUT_ID = 'bento-v2';

export default function CopilotBentoDashboard({
  profile,
  transactions,
  updateProfile,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const navigate = useNavigate();

  const openSubscriptionsView = () => {
    if (import.meta.env.DEV) {
      console.log('[CopilotBentoDashboard] Hantera prenumerationer → /Subscriptions');
    }
    navigate(copilotToolHref(COPILOT_VIEWS.subscriptions));
  };

  const [kalkylatornOpen, setKalkylatornOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const [coachLine, setCoachLine] = useState(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [dreamBuilderOpen, setDreamBuilderOpen] = useState(false);

  const { briefing, updatedAtLabel } = useDashboardBriefing();
  useProactiveWeekPush(profile);

  const goals = useMemo(() => buildSavingsGoals(profile), [profile]);
  const scenarios = useMemo(
    () => buildFutureScenarios(profile, transactions),
    [profile, transactions],
  );
  const reviewQueue = useMemo(() => buildReviewQueue(transactions), [transactions]);
  const subscriptions = useMemo(() => getUpcomingSubscriptions(profile), [profile]);
  const subTotal = useMemo(() => getSubscriptionTotal(profile), [profile]);
  const underBudgetStreak = useMemo(
    () => calcUnderBudgetStreak(profile, transactions),
    [profile, transactions],
  );
  const savingsStreak = useMemo(() => calcSavingsStreak(transactions), [transactions]);
  const loginStreak = profile?.dailyLoginStreak || 0;

  const lessonData = useMemo(() => {
    const pengometer = calculatePengometer(profile, transactions);
    const subScan = scanSubscriptions(profile, transactions);
    return getPrimaryContextualLesson(profile, pengometer, subScan);
  }, [profile, transactions]);

  const health = useMemo(
    () => calculateWeeklyHealthScore(profile, transactions),
    [profile, transactions],
  );

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

  const handleMood = useCallback(
    async (moodId) => {
      await updateProfile?.({
        sessionMood: moodId,
        sessionMoodDate: todayKey(),
        toneMode: moodToToneMode(moodId),
      });
    },
    [updateProfile],
  );

  const handleCoachSend = () => {
    if (coachInput.trim()) {
      window.dispatchEvent(
        new CustomEvent('anchor:open-voice', { detail: { prompt: coachInput.trim() } }),
      );
      setCoachInput('');
      return;
    }
    navigate(createPageUrl('AnchorAnalysis'));
  };

  const handleLessonComplete = (lessonId) => {
    const completed = [...new Set([...(profile?.academyCompleted || []), lessonId])];
    updateProfile?.({ academyCompleted: completed, lastAcademyLessonId: lessonId });
  };

  const activeMood = profile?.sessionMood || 'calm';
  const showMoodBar = profile?.onboardingCompleted;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CopilotBentoDashboard] active layout:', DASHBOARD_LAYOUT_ID);
    }
  }, []);

  const pengometer = useMemo(
    () => calculatePengometer(profile, transactions),
    [profile, transactions],
  );
  const monthlyMargin = profile?.income
    ? (profile.income || 0)
      - (profile.housingCost || 0)
      - subTotal
      - (profile.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0)
    : null;

  const firstName = user?.full_name?.split(' ')[0] || null;
  const userInitial = (user?.full_name || user?.email || '?').charAt(0).toUpperCase();

  const recentTx = useMemo(
    () => (transactions || []).slice(0, 6),
    [transactions],
  );

  const fmtBalance = (n) => {
    if (n == null) return '— kr';
    return n.toLocaleString('sv-SE') + ' kr';
  };

  const getCategoryColor = (type) => {
    if (type === 'income') return '#4FFFB0';
    return 'rgba(255,255,255,0.15)';
  };

  return (
    <div
      className="min-h-full flex flex-col w-full"
      style={{ background: 'linear-gradient(180deg, #071d38 0%, #040814 55%)' }}
      data-dashboard-layout={DASHBOARD_LAYOUT_ID}
    >
        <div className="flex flex-col flex-1">

          {/* ── Top bar ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-2">
            <button
              type="button"
              onClick={() => navigate(createPageUrl('Settings'))}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white touch-manipulation"
              style={{ background: 'linear-gradient(135deg, #6B9FFF, #4FFFB0)' }}
            >
              {userInitial}
            </button>
            <button
              type="button"
              className="flex-1 flex items-center gap-2 h-10 rounded-full px-4 text-sm text-white/40 touch-manipulation"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => navigate(createPageUrl('TransactionHistory'))}
            >
              <TrendingUp size={15} className="text-white/30" />
              Sök
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center touch-manipulation"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => navigate(createPageUrl('AnchorAnalysis'))}
            >
              <Sparkles size={16} className="text-white/60" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center touch-manipulation"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => navigate(createPageUrl('Subscriptions'))}
            >
              <ArrowUp size={16} className="text-white/60" />
            </button>
          </div>

          {/* ── Hero balance ───────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center px-5 pt-8 pb-6">
            <p className="text-[13px] text-white/45 mb-2">
              Månadsmarginal · SEK
            </p>
            <h1 className="text-[52px] font-black text-white tracking-tight leading-none mb-5">
              {monthlyMargin != null
                ? monthlyMargin.toLocaleString('sv-SE')
                : '—'}
              <span className="text-[28px] font-semibold ml-1 text-white/60"> kr</span>
            </h1>
            <button
              type="button"
              onClick={onOpenTransactionHub}
              className="px-6 py-2.5 rounded-full text-sm font-semibold touch-manipulation"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
            >
              Transaktioner
            </button>
          </div>

          {/* ── Quick actions ──────────────────────────────────────── */}
          <div className="flex justify-around px-6 pb-6">
            {[
              { label: 'Lägg till', icon: <span className="text-xl font-light">+</span>, action: () => setQuickExpenseOpen(true) },
              { label: 'Sparmål', icon: <span className="text-lg">🎯</span>, action: () => setDreamBuilderOpen(true) },
              { label: 'Budget', icon: <span className="text-lg">📊</span>, action: () => navigate(createPageUrl('BudgetDashboard')) },
              { label: 'Mer', icon: <span className="text-lg">···</span>, action: () => setKalkylatornOpen(true) },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex flex-col items-center gap-2 touch-manipulation"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span className="text-white">{icon}</span>
                </div>
                <span className="text-[12px] text-white/55 font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* ── AI Coach card ──────────────────────────────────────── */}
          <div className="px-4 mb-3">
            <div
              className="rounded-[20px] p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[var(--color-accent)]" />
                <span className="text-[12px] font-semibold text-white/50 uppercase tracking-wide">AI-Coach</span>
                <span className="ml-auto text-[10px] font-semibold text-[#4FFFB0] uppercase tracking-wider">ONLINE</span>
              </div>
              <p className="text-[14px] text-white/70 leading-relaxed mb-3">
                {coachLine || briefing?.message || 'Fråga mig om budget, sparande eller din ekonomiska framtid.'}
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-9 rounded-full px-4 text-[13px] text-white bg-white/[0.07] border border-white/[0.1] outline-none placeholder-white/25"
                  placeholder="Fråga vad som helst…"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
                />
                <button
                  type="button"
                  onClick={handleCoachSend}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-accent)' }}
                >
                  <ArrowUp size={15} className="text-[#040814]" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Streak card ────────────────────────────────────────── */}
          {(underBudgetStreak > 0 || savingsStreak > 0 || loginStreak > 0) && (
            <div className="px-4 mb-3">
              <div
                className="rounded-[20px] p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex gap-3 flex-1 flex-wrap">
                  {loginStreak > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-[13px] text-white/70"><strong className="text-white">{loginStreak}</strong> dagar</span>
                    </div>
                  )}
                  {underBudgetStreak > 0 && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-green-400" />
                      <span className="text-[13px] text-white/70"><strong className="text-white">{underBudgetStreak}</strong> under budget</span>
                    </div>
                  )}
                  {health.score > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[var(--color-accent)]" />
                      <span className="text-[13px] text-white/70">Score <strong className="text-white">{health.score}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Recent transactions ────────────────────────────────── */}
          <div className="px-4 mb-6">
            <div
              className="rounded-[20px] overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-[13px] font-semibold text-white/50 uppercase tracking-wide">Senaste</span>
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl('TransactionHistory'))}
                  className="text-[12px] text-[var(--color-accent)] font-semibold touch-manipulation"
                >
                  Visa alla →
                </button>
              </div>
              {recentTx.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[13px] text-white/30">Inga transaktioner ännu.</p>
                  <button
                    type="button"
                    onClick={() => setQuickExpenseOpen(true)}
                    className="mt-3 text-[13px] font-semibold text-[var(--color-accent)] touch-manipulation"
                  >
                    + Lägg till din första
                  </button>
                </div>
              ) : (
                recentTx.map((tx, i) => (
                  <div
                    key={tx.id || i}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: getCategoryColor(tx.type) + '22' }}
                    >
                      <CategoryIcon category={tx.category || 'other'} size={18} color={tx.type === 'income' ? '#4FFFB0' : 'rgba(255,255,255,0.5)'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white truncate">{tx.description || tx.vendor || 'Transaktion'}</p>
                      <p className="text-[12px] text-white/35">
                        {tx.date ? new Date(tx.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : ''}
                      </p>
                    </div>
                    <span
                      className="text-[15px] font-semibold tabular-nums shrink-0"
                      style={{ color: tx.type === 'income' ? '#4FFFB0' : 'white' }}
                    >
                      {tx.type === 'income' ? '+' : '−'}{Math.abs(tx.amount || 0).toLocaleString('sv-SE')} kr
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      <KalkylatornSheet
        isOpen={kalkylatornOpen}
        onClose={() => setKalkylatornOpen(false)}
        profile={profile}
      />
      <QuickExpenseSheet
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
        profile={profile}
      />
      {lessonData?.lesson && (
        <AcademyLessonSheet
          open={lessonOpen}
          onClose={() => setLessonOpen(false)}
          lesson={lessonData.lesson}
          profile={profile}
          transactions={transactions}
          onComplete={handleLessonComplete}
        />
      )}
      <DreamBuilder
        isOpen={dreamBuilderOpen}
        onClose={() => setDreamBuilderOpen(false)}
        profile={profile}
        onSave={(patch) => updateProfile?.(patch)}
      />
    </div>
  );
}
