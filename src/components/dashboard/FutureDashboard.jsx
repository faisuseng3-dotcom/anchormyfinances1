import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { COPILOT_VIEWS } from '@/lib/copilotViews';
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
import { planeraTabHref } from '@/lib/planeraTabs';
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
import VisualSavingsGoalRing from '@/components/savings/VisualSavingsGoalRing';
import { getReachedMilestones } from '@/lib/savingsGoalValidation';
import { TrendingUp, Flame, Sparkles, ArrowUpRight, ArrowUp, Check } from 'lucide-react';
import {
  fmtKr,
  getMonthRange,
  getMonthlySpentByCategory,
  buildBudgetRows,
  buildSummaryCards,
  getRecentTransactions,
  buildSavingsGoals,
  buildFutureScenarios,
  formatTopbarDate,
  getSubscriptionTotal,
  getUpcomingSubscriptions,
} from './copilot/copilotDashboardUtils';
const BAR_GRADIENTS = {
  ok: 'linear-gradient(90deg, #4a7aff, #22d97a)',
  mid: 'linear-gradient(90deg, #4a7aff, #4fc3f7)',
  over: 'linear-gradient(90deg, #f87171, #ef4444)',
  fun: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
  home: 'linear-gradient(90deg, #4fc3f7, #0284c7)',
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function FutureDashboard({
  profile,
  transactions,
  updateProfile,
  onOpenMagicEntry,
  onOpenTransactionHub,
  user,
}) {
  const { openSidebar, setActiveView } = useCopilotNav();
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

  const summary = useMemo(
    () => buildSummaryCards(profile, transactions),
    [profile, transactions],
  );
  const budgetRows = useMemo(
    () => buildBudgetRows(profile, transactions),
    [profile, transactions],
  );
  const recentTxs = useMemo(() => getRecentTransactions(transactions), [transactions]);
  const goals = useMemo(() => buildSavingsGoals(profile), [profile]);
  const scenarios = useMemo(
    () => buildFutureScenarios(profile, transactions),
    [profile, transactions],
  );
  const subscriptions = useMemo(() => getUpcomingSubscriptions(profile), [profile]);
  const subTotal = useMemo(() => getSubscriptionTotal(profile), [profile]);

  const monthLabel = getMonthRange().label;
  const monthlySpent = useMemo(
    () => getMonthlySpentByCategory(transactions),
    [transactions],
  );
  const totalBudgeted = Object.values(profile?.budgetLimits || {}).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(monthlySpent).reduce((s, v) => s + v, 0);
  const budgetRemaining = Math.max(0, totalBudgeted - totalSpent);
  const underBudget = totalBudgeted > 0 && totalSpent <= totalBudgeted;

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

  return (
    <>
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

          <div className="copilot-summary-row">
            <Link to={createPageUrl('Budget')} className="copilot-summary-card">
              <div className="copilot-summary-label">Kvar denna månad</div>
              <div className="copilot-summary-amount">{fmtKr(summary.remaining)}</div>
              <div className="copilot-summary-sub positive">
                {summary.pengHeadline ? `${fmtKr(summary.pengHeadline)} kvar denna vecka` : 'Baserat på marginal'}
              </div>
            </Link>
            <div className="copilot-summary-card">
              <div className="copilot-summary-label">Inkomst {monthLabel}</div>
              <div className="copilot-summary-amount">{fmtKr(summary.income)}</div>
              <div className="copilot-summary-sub">Månadsinkomst</div>
            </div>
            <div className="copilot-summary-card" onClick={onOpenTransactionHub} role="button" tabIndex={0}>
              <div className="copilot-summary-label">Sparat totalt</div>
              <div className="copilot-summary-amount">{fmtKr(summary.saved)}</div>
              <div className="copilot-summary-sub positive">Buffert + sparmål</div>
            </div>
            <div className="copilot-summary-card">
              <div className="copilot-summary-label">Förmögenhet netto</div>
              <div className="copilot-summary-amount">{fmtKr(summary.netWorth)}</div>
              <div className="copilot-summary-sub positive">Uppskattat netto</div>
            </div>
          </div>

          <div className="copilot-grid-main">
            <div className="copilot-grid-left">
              <div className="copilot-card">
                <div className="copilot-card-header">
                  <span className="copilot-card-title">Budget — {monthLabel}</span>
                  <Link to={createPageUrl('Budget')} className="copilot-card-action">
                    Hantera →
                  </Link>
                </div>
                <div
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    gap: 16,
                    fontSize: 12,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--copilot-text-muted)' }}>
                    Budgeterat <strong style={{ color: 'var(--copilot-text-primary)' }}>{fmtKr(totalBudgeted)}</strong>
                  </span>
                  <span style={{ color: 'var(--copilot-text-muted)' }}>
                    Spenderat <strong style={{ color: '#f87171' }}>{fmtKr(totalSpent)}</strong>
                  </span>
                  <span style={{ color: 'var(--copilot-text-muted)' }}>
                    Kvar <strong style={{ color: 'var(--copilot-accent-green)' }}>{fmtKr(budgetRemaining)}</strong>
                  </span>
                  {underBudget && totalBudgeted > 0 && (
                    <span className="copilot-tag" style={{ marginLeft: 'auto' }}>
                      <Check className="w-3 h-3 inline" /> {fmtKr(totalBudgeted - totalSpent)} under budget
                    </span>
                  )}
                </div>

                {budgetRows.map((row, i) => {
                  const width = row.limit > 0 ? `${Math.min(100, row.pct * 100)}%` : '0%';
                  const gradient = row.over
                    ? BAR_GRADIENTS.over
                    : row.key === 'entertainment'
                      ? BAR_GRADIENTS.fun
                      : row.key === 'housing'
                        ? BAR_GRADIENTS.home
                        : row.pct >= 0.8
                          ? BAR_GRADIENTS.mid
                          : BAR_GRADIENTS.ok;
                  return (
                    <div
                      key={row.key}
                      className="copilot-budget-row"
                      style={i === budgetRows.length - 1 ? { marginBottom: 0 } : undefined}
                    >
                      <span className="copilot-budget-icon">
                        <CategoryIcon category={row.category || row.key} size={16} color="var(--copilot-text-secondary)" />
                      </span>
                      <div className="copilot-budget-info">
                        <div className="copilot-budget-name">
                          {row.name}
                          <span>
                            {fmtKr(row.spent)} / {row.limit > 0 ? fmtKr(row.limit) : '—'}
                          </span>
                        </div>
                        <div className="copilot-bar-track">
                          <div
                            className="copilot-bar-fill"
                            style={{ width, background: gradient }}
                          />
                        </div>
                      </div>
                      {row.over && (
                        <span style={{ fontSize: 11, color: '#f87171', whiteSpace: 'nowrap', marginLeft: 8 }}>
                          +{fmtKr(row.overAmt)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="copilot-card">
                <div className="copilot-card-header">
                  <span className="copilot-card-title">Senaste transaktioner</span>
                  <Link to={historyTabHref('list')} className="copilot-card-action">
                    Visa alla →
                  </Link>
                </div>
                {recentTxs.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--copilot-text-muted)' }}>
                    Inga transaktioner ännu. Tryck + för att lägga till.
                  </p>
                ) : (
                  recentTxs.map((tx) => (
                    <Link key={tx.id} to={historyTabHref('list')} className="copilot-txn-row">
                      <div className="copilot-txn-icon">
                        <CategoryIcon category={tx.categoryKey} size={16} color="var(--copilot-text-secondary)" />
                      </div>
                      <div className="copilot-txn-info">
                        <div className="copilot-txn-name">{tx.name}</div>
                        <div className="copilot-txn-date">
                          {tx.dateLabel} · {tx.categoryLabel}
                        </div>
                      </div>
                      <div className={`copilot-txn-amount ${tx.isCredit ? 'credit' : 'debit'}`}>
                        {tx.isCredit ? fmtKr(tx.amount, { signed: true }) : `−${fmtKr(Math.abs(tx.amount)).replace(' kr', '')} kr`}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="copilot-grid-right">
              <div className="copilot-card">
                <div className="copilot-card-header">
                  <span className="copilot-card-title">AI-Coach</span>
                  <span className="copilot-online-badge">ONLINE</span>
                </div>
                <div className="copilot-coach-bubble flex gap-2">
                  <Sparkles size={14} className="text-[var(--copilot-accent-blue)] shrink-0 mt-0.5" />
                  <span>
                    {coachLine ||
                      briefing?.message ||
                      scenarios.forecast?.coach_meddelande ||
                      'Fråga mig om budget, sparande eller din ekonomiska framtid.'}
                  </span>
                </div>
                <div className="copilot-coach-input">
                  <input
                    className="copilot-coach-field"
                    placeholder="Fråga vad som helst om din ekonomi…"
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
                  />
                  <button type="button" className="copilot-coach-send" onClick={handleCoachSend} aria-label="Skicka">
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>

              <div className="copilot-card">
                <div className="copilot-card-header">
                  <span className="copilot-card-title">Din Framtid</span>
                  <Link to={planeraTabHref('nu')} className="copilot-card-action">
                    12 mån →
                  </Link>
                </div>
                <div className="copilot-pulse-chart">
                  <svg className="copilot-pulse-svg" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="copilot-pg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4a7aff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4a7aff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,60 C30,55 60,50 90,45 C120,40 150,35 180,32 C210,29 240,25 270,20 L300,18 L300,80 L0,80 Z"
                      fill="url(#copilot-pg)"
                    />
                    <path
                      d="M0,60 C30,55 60,50 90,45 C120,40 150,35 180,32 C210,29 240,25 270,20 L300,18"
                      fill="none"
                      stroke="#4a7aff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,65 C30,63 60,61 90,59 C120,57 150,54 180,52 C210,50 240,48 270,46 L300,45"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                    <path
                      d="M0,55 C30,50 60,43 90,36 C120,29 150,22 180,16 C210,10 240,6 270,3 L300,2"
                      fill="none"
                      stroke="rgba(34,217,122,0.35)"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                  </svg>
                </div>
                <div className="copilot-scenario-row">
                  <Link to={planeraTabHref('scenario')} className="copilot-scenario">
                    <div className="copilot-scenario-label">Pessimistisk</div>
                    <div className="copilot-scenario-val" style={{ color: '#f87171' }}>
                      +{fmtKr(scenarios.pessimistic).replace(' kr', '')} kr
                    </div>
                  </Link>
                  <Link to={planeraTabHref('nu')} className="copilot-scenario highlight">
                    <div className="copilot-scenario-label">Realistisk</div>
                    <div className="copilot-scenario-val" style={{ color: 'var(--copilot-accent-blue)' }}>
                      +{fmtKr(scenarios.realistic).replace(' kr', '')} kr
                    </div>
                  </Link>
                  <Link to={planeraTabHref('scenario')} className="copilot-scenario">
                    <div className="copilot-scenario-label">Optimistisk</div>
                    <div className="copilot-scenario-val" style={{ color: 'var(--copilot-accent-green)' }}>
                      +{fmtKr(scenarios.optimistic).replace(' kr', '')} kr
                    </div>
                  </Link>
                </div>
              </div>

              <div className="copilot-card" id="goals">
                <div className="copilot-card-header">
                  <span className="copilot-card-title">Sparmål</span>
                  <button
                    type="button"
                    className="copilot-card-action"
                    onClick={() => setDreamBuilderOpen(true)}
                  >
                    + Nytt mål
                  </button>
                </div>
                {goals.length === 0 ? (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--copilot-text-muted)', marginBottom: 12 }}>
                      Sätt ett visuellt sparmål med bild — se ditt framtida jag ta form.
                    </p>
                    <button
                      type="button"
                      className="copilot-card-action"
                      onClick={() => setDreamBuilderOpen(true)}
                    >
                      Skapa sparmål
                    </button>
                  </div>
                ) : (
                  goals.map((goal, i) => {
                    const reached = getReachedMilestones(goal.pct);
                    return (
                      <div
                        key={`${goal.name}-${i}`}
                        className="copilot-goal-row copilot-goal-row-visual"
                        style={i === goals.length - 1 ? { marginBottom: 0 } : undefined}
                      >
                        <VisualSavingsGoalRing
                          pct={goal.pct}
                          size={64}
                          stroke={5}
                          imageUrl={goal.isPrimary && goal.visualType === 'image' ? goal.imageUrl : null}
                          iconId={goal.goalType || 'default'}
                          showMilestones={goal.isPrimary}
                          className="flex-shrink-0"
                        />
                        <div className="copilot-goal-info">
                          <div className="copilot-goal-name">{goal.name}</div>
                          <div className="copilot-goal-progress-text">
                            {fmtKr(goal.current)} / {fmtKr(goal.target)}
                            {goal.deadline ? ` · ${goal.deadline}` : ' · Löpande'}
                          </div>
                          {goal.isPrimary && reached.length > 0 && (
                            <div className="copilot-goal-milestones">
                              {reached.map((m) => (
                                <span key={m} className="copilot-goal-milestone">{m}%</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="copilot-goal-pct">{Math.round(goal.pct)}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="copilot-grid-bottom">
            <div className="copilot-card">
              <div className="copilot-card-header">
                <span className="copilot-card-title">Prenumerationer</span>
                <button
                  type="button"
                  className="copilot-card-action active:scale-[0.98] transition-transform"
                  onClick={() => setActiveView(COPILOT_VIEWS.subscriptions)}
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
    </>
  );
}
