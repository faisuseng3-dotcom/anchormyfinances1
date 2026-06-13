import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { COPILOT_VIEWS, copilotToolHref } from '@/lib/copilotViews';
import { useCopilotNav } from '@/components/layout/CopilotNavContext';
import {
  MOOD_OPTIONS,
  moodToToneMode,
  needsMoodCheckIn,
  calculatePengometer,
  scanSubscriptions,
} from '@/lib/anchorBrain';
import { calculateWeeklyHealthScore } from '@/lib/weeklyHealthScore';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { getPrimaryContextualLesson } from '@/lib/contextualLessons';
import { useDashboardBriefing } from '@/hooks/useDashboardBriefing';
import { useProactiveWeekPush } from '@/hooks/useProactiveWeekPush';
import { historyTabHref } from '@/lib/historyTabs';
import KalkylatornSheet from '@/components/dashboard/KalkylatornSheet';
import QuickExpenseSheet from './QuickExpenseSheet';
import AcademyLessonSheet from '@/components/anchorBrain/AcademyLessonSheet';
import {
  CategoryIcon,
  MoodIcon,
  NavIcon,
} from '@/lib/anchorIcons';
import DreamBuilder from '@/components/goals/DreamBuilder';
import CopilotFreeMoneyHero from '@/components/ui-premium/copilot/CopilotFreeMoneyHero';
import CopilotEnvelopeGoal from '@/components/ui-premium/copilot/CopilotEnvelopeGoal';
import StreakBadge from '@/components/ui-premium/copilot/StreakBadge';
import TransactionActiveReview from '@/components/transactions/TransactionActiveReview';
import CopilotFuturePulseMini from './copilot/CopilotFuturePulseMini';
import PlanGate from '@/components/billing/PlanGate';
import CopilotDashboardPanel from './copilot/CopilotDashboardPanel';
import { calcUnderBudgetStreak } from '@/lib/budgetStreak';
import { calcSavingsStreak } from '@/lib/microWins';
import { TrendingUp, Flame, Sparkles, ArrowUpRight, ArrowUp } from 'lucide-react';
import {
  fmtKr,
  buildSavingsGoals,
  buildFutureScenarios,
  buildReviewQueue,
  formatTopbarDate,
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
  const { openSidebar } = useCopilotNav();

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

  const firstName = user?.full_name?.split(' ')[0] || 'du';
  const health = useMemo(
    () => calculateWeeklyHealthScore(profile, transactions),
    [profile, transactions],
  );

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

  const ringR = 14;
  const circumference = 2 * Math.PI * ringR;
  const ringOffset = circumference - (health.score / 100) * circumference;

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
    window.location.href = `${createPageUrl('ProTools')}?deep=ai_guru`;
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

  return (
    <div
      className="copilot-bento-dashboard min-h-full flex flex-col flex-1 w-full"
      data-dashboard-layout={DASHBOARD_LAYOUT_ID}
    >
        <header className="copilot-topbar">
          <div className="copilot-topbar-left">
            <button
              type="button"
              className="copilot-icon-btn lg:hidden mb-2"
              aria-label="Öppna meny"
              onClick={openSidebar}
            >
              <NavIcon name="menu" size={18} />
            </button>
            <span className="copilot-topbar-date">{formatTopbarDate()}</span>
            <span className="copilot-topbar-greeting">Hej {firstName}</span>
          </div>
          <div className="copilot-topbar-right">
            <button type="button" className="copilot-health-badge" title={health.hint}>
              <div className="copilot-health-score-ring">
                <svg viewBox="0 0 34 34" width="34" height="34">
                  <circle
                    cx="17"
                    cy="17"
                    r={ringR}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="17"
                    cy="17"
                    r={ringR}
                    fill="none"
                    stroke={health.color}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="copilot-health-score-num" style={{ color: health.color }}>
                  {health.score}
                </div>
              </div>
              <span className="copilot-health-label">{health.label}</span>
              <ArrowUpRight size={14} className="text-[var(--copilot-text-muted)] ml-0.5" />
            </button>
            <button type="button" className="copilot-icon-btn" title="Notiser" aria-label="Notiser">
              <NavIcon name="bell" size={16} />
            </button>
            <button
              type="button"
              className="copilot-icon-btn"
              title="Sök / röst"
              aria-label="Sök"
              onClick={() => window.dispatchEvent(new CustomEvent('anchor:open-voice'))}
            >
              <NavIcon name="search" size={16} />
            </button>
          </div>
        </header>

        <div className="copilot-content">
          {showMoodBar && (
            <div className="copilot-mood-bar">
              <span className="copilot-mood-label">Innan siffrorna —</span>
              <div className="copilot-mood-divider" />
              <span style={{ fontSize: 12, color: 'var(--copilot-text-secondary)', marginRight: 4 }}>
                Hur känns ekonomin idag?
              </span>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`copilot-mood-btn ${activeMood === m.id ? 'active' : ''}`}
                  onClick={() => handleMood(m.id)}
                >
                  <MoodIcon mood={m.id} size={14} className="inline mr-1.5 -mt-0.5" />
                  {m.label}
                </button>
              ))}
              <span className="copilot-mood-sub hidden xl:inline">
                Vi anpassar vad som visas — ingen skuldbeläggning
              </span>
            </div>
          )}

          {needsMoodCheckIn(profile) && showMoodBar && (
            <p style={{ fontSize: 12, color: 'var(--copilot-text-muted)', marginBottom: 16 }}>
              Välj humör ovan för att anpassa dashboarden.
            </p>
          )}

          <CopilotFreeMoneyHero className="mb-6" />

          <div className="copilot-bento">
            <div className="copilot-bento-left">
              <CopilotDashboardPanel
                index={0}
                title="Städa transaktioner"
                subtitle="Swajpa för att godkänna — som i Excel, men snyggare."
                action={(
                  <Link to={historyTabHref('list')} className="copilot-card-action active:scale-[0.98] transition-transform">
                    Historik →
                  </Link>
                )}
              >
                {reviewQueue.length > 0 ? (
                  <TransactionActiveReview
                    rows={reviewQueue}
                    getRowKey={(row) => row._key || row.id}
                    onCategoryChange={() => {}}
                    onConfirm={() => navigate(historyTabHref('list'))}
                    onCancel={() => navigate(historyTabHref('list'))}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-[var(--copilot-text-secondary)] mb-4">
                      Inga transaktioner att granska just nu.
                    </p>
                    <button
                      type="button"
                      className="organic-pill px-5 py-3 min-h-12 text-[13px] font-semibold text-white active:scale-[0.98] transition-transform"
                      style={{ background: 'rgba(74,122,255,0.25)', boxShadow: 'var(--organic-shadow-soft)' }}
                      onClick={() => setQuickExpenseOpen(true)}
                    >
                      Lägg till utgift
                    </button>
                  </div>
                )}
              </CopilotDashboardPanel>

              <PlanGate feature="future_pulse" compact>
                <CopilotFuturePulseMini forecast={scenarios.forecast} />
              </PlanGate>
            </div>

            <div className="copilot-bento-right">
              <CopilotDashboardPanel
                index={1}
                title="Sparmål"
                action={(
                  <button
                    type="button"
                    className="copilot-card-action active:scale-[0.98] transition-transform"
                    onClick={() => setDreamBuilderOpen(true)}
                  >
                    + Nytt
                  </button>
                )}
              >
                {goals.length === 0 ? (
                  <div className="py-4">
                    <p className="text-[13px] text-[var(--copilot-text-muted)] mb-4 leading-relaxed">
                      Sätt ett visuellt kuvertmål — se framsteg med progress ring.
                    </p>
                    <button
                      type="button"
                      className="w-full min-h-12 rounded-full text-[13px] font-semibold text-white active:scale-[0.98] transition-transform"
                      style={{ background: 'linear-gradient(135deg, #4a7aff, #6d4aff)', boxShadow: 'var(--organic-shadow-soft)' }}
                      onClick={() => setDreamBuilderOpen(true)}
                    >
                      Skapa sparmål
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal, i) => (
                      <CopilotEnvelopeGoal
                        key={`${goal.name}-${i}`}
                        name={goal.name}
                        current={goal.current}
                        target={goal.target}
                        imageUrl={goal.isPrimary && goal.visualType === 'image' ? goal.imageUrl : null}
                        iconId={goal.goalType || 'default'}
                        visualType={goal.visualType}
                      />
                    ))}
                  </div>
                )}
              </CopilotDashboardPanel>

              <CopilotDashboardPanel index={2} title="Streaks" subtitle="Små vanor som bygger trygghet.">
                <div className="copilot-streak-stack">
                  <StreakBadge count={underBudgetStreak} label="dagar inom budget" variant="budget" forceShow />
                  <StreakBadge count={savingsStreak} label="dagar sparande i rad" variant="save" forceShow />
                  <StreakBadge count={loginStreak} label="dagar med Anchor" variant="fire" forceShow />
                </div>
              </CopilotDashboardPanel>
            </div>
          </div>

          <div className="copilot-secondary-strip">
            <div className="copilot-card active:scale-[0.995] transition-transform">
              <div className="copilot-card-header">
                <span className="copilot-card-title">AI-Coach</span>
                <span className="copilot-online-badge">ONLINE</span>
              </div>
              <div className="copilot-coach-bubble flex gap-2 rounded-[16px]">
                <Sparkles size={14} className="text-[var(--copilot-accent-blue)] shrink-0 mt-0.5" />
                <span>
                  {coachLine ||
                    briefing?.message ||
                    scenarios.forecast?.coach_meddelande ||
                    'Fråga mig om budget, sparande eller din ekonomiska framtid.'}
                </span>
              </div>
              <div className="copilot-coach-input mt-3">
                <input
                  className="copilot-coach-field organic-input"
                  placeholder="Fråga vad som helst…"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
                />
                <button type="button" className="copilot-coach-send active:scale-[0.97] transition-transform" onClick={handleCoachSend} aria-label="Skicka">
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>

            <div className="copilot-card active:scale-[0.995] transition-transform">
              <div className="copilot-card-header">
                <span className="copilot-card-title">Prenumerationer</span>
                <button
                  type="button"
                  className="copilot-card-action active:scale-[0.98] transition-transform"
                  onClick={openSubscriptionsView}
                >
                  Hantera →
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--copilot-text-muted)', marginBottom: 12 }}>
                Totalt <strong style={{ color: '#f87171' }}>{fmtKr(subTotal)}/mån</strong>
                {subscriptions.length > 0 && ` · ${subscriptions.length} aktiva`}
              </div>
              {subscriptions.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--copilot-text-muted)' }}>Inga prenumerationer registrerade.</p>
              ) : (
                subscriptions.map((sub) => (
                  <div key={sub.name || sub.id} className="copilot-sub-row">
                    <div
                      className="copilot-sub-icon"
                      style={{ background: 'rgba(74,122,255,0.12)' }}
                    >
                      <CategoryIcon category="subscription" size={16} color="var(--copilot-accent-blue)" />
                    </div>
                    <span className="copilot-sub-name">{sub.name}</span>
                    <span className="copilot-sub-date">
                      {sub.nextDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="copilot-sub-price">{fmtKr(sub.amount)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="copilot-card">
              <div className="copilot-card-header">
                <span className="copilot-card-title">Veckobrev</span>
                {updatedAtLabel && (
                  <span style={{ fontSize: 11, color: 'var(--copilot-text-muted)' }}>
                    Senast {updatedAtLabel}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--copilot-text-secondary)' }}>
                {briefing?.headline && (
                  <p style={{ marginBottom: 10, color: 'var(--copilot-text-primary)', fontWeight: 500 }}>
                    {briefing.headline}
                  </p>
                )}
                <p style={{ marginBottom: 8 }}>
                  {briefing?.message || 'Ditt personliga veckobrev genereras baserat på din ekonomi.'}
                </p>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="copilot-tag inline-flex items-center gap-1">
                  <Flame size={12} /> Veckans fokus
                </span>
                <span className="copilot-tag blue inline-flex items-center gap-1">
                  <TrendingUp size={12} /> Hälsoscore {health.score}
                </span>
              </div>
            </div>

            <div className="copilot-card" id="academy">
              <div className="copilot-card-header">
                <span className="copilot-card-title">Anchor Academy</span>
                <button
                  type="button"
                  className="copilot-card-action"
                  onClick={() => lessonData?.lesson && setLessonOpen(true)}
                >
                  Alla lektioner →
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--copilot-text-muted)', marginBottom: 12 }}>
                Baserat på din ekonomi just nu
              </div>
              {lessonData?.lesson ? (
                <>
                  <button
                    type="button"
                    className="copilot-lesson-card"
                    onClick={() => setLessonOpen(true)}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--copilot-accent-blue)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 4,
                      }}
                    >
                      Dagens lektion · {lessonData.lesson.durationSec || 60} sek
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>
                      {lessonData.lesson.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--copilot-text-muted)' }}>
                      {lessonData.invite}
                    </div>
                  </button>
                  <div className="copilot-lesson-card secondary">
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--copilot-text-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 4,
                      }}
                    >
                      Kommande
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--copilot-text-secondary)' }}>
                      F-skatt & moms — frilansarguide 2026
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--copilot-text-muted)' }}>
                  Inga nya lektioner just nu — bra jobbat!
                </p>
              )}
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
