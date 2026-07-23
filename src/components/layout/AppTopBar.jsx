import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useDemoMode } from '@/components/demo/DemoMode';
import { useCopilotNav } from '@/components/layout/CopilotNavContext';
import { calculateWeeklyHealthScore } from '@/lib/weeklyHealthScore';
import { formatTopbarDate } from '@/components/dashboard/copilot/copilotDashboardUtils';
import { NavIcon } from '@/lib/anchorIcons';

const RING_R = 14;

export default function AppTopBar() {
  const { user } = useAuth();
  const { isAlexMode: isAlex } = useDemoMode();
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 500 });
  const { openSidebar } = useCopilotNav();

  const displayUser = isAlex ? { full_name: 'Alex Lindqvist' } : user;
  const firstName = displayUser?.full_name?.split(' ')[0];
  const greeting = firstName ? `Hej ${firstName}` : 'Välkommen tillbaka';

  const health = useMemo(
    () => calculateWeeklyHealthScore(profile, transactions),
    [profile, transactions],
  );

  const circumference = 2 * Math.PI * RING_R;
  const ringOffset = circumference - (health.score / 100) * circumference;

  return (
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
        <span className="copilot-topbar-greeting">{greeting}</span>
      </div>
      <div className="copilot-topbar-right">
        <button type="button" className="copilot-health-badge" title={health.hint}>
          <div className="copilot-health-score-ring">
            <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden>
              <circle cx="17" cy="17" r={RING_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle
                cx="17"
                cy="17"
                r={RING_R}
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
  );
}
