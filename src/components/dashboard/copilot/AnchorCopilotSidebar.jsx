import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { planeraTabHref } from '@/lib/planeraTabs';
import { COPILOT_VIEWS, TOOL_VIEW_IDS, copilotToolHref } from '@/lib/copilotViews';
import { useCopilotNav } from '@/components/layout/CopilotNavContext';
import { fmtKr, buildAccountItems } from './copilotDashboardUtils';
import { AnchorLogoMark, NavIcon } from '@/lib/anchorIcons';
import { triggerHaptic } from '@/lib/haptics';

const OVERVIEW_NAV = [
  { page: 'Dashboard', icon: 'home', label: 'Hem', isHome: true },
  { page: 'Budget', icon: 'budget', label: 'Budget', badge: 'OK', badgeGreen: true },
  { href: planeraTabHref('nu'), icon: 'future', label: 'Din Framtid', match: 'FuturePulse' },
  { href: `${createPageUrl('ProTools')}?deep=ai_guru`, icon: 'coach', label: 'AI-Coach', badge: '3' },
];

const TOOLS_NAV = [
  { page: 'ProTools', icon: 'tools', label: 'Verktyg', external: true },
  { view: COPILOT_VIEWS.goals, icon: 'goals', label: 'Sparmål' },
  { view: COPILOT_VIEWS.subscriptions, icon: 'subscriptions', label: 'Prenumerationer' },
  { view: COPILOT_VIEWS.squads, icon: 'squads', label: 'Squads' },
  { view: COPILOT_VIEWS.academy, icon: 'academy', label: 'Anchor Academy' },
];

function navHref(item) {
  if (item.href) return item.href;
  let url = createPageUrl(item.page);
  if (item.query) url += item.query;
  if (item.hash) url += item.hash;
  return url;
}

function isOverviewActive(item, pathname, currentPage, activeView) {
  if (item.isHome) {
    return activeView === COPILOT_VIEWS.home && currentPage === 'Dashboard';
  }
  if (item.match) return currentPage === item.match;
  if (item.page && !item.hash && !item.query) return currentPage === item.page && activeView === COPILOT_VIEWS.home;
  return false;
}

export default function AnchorCopilotSidebar({
  profile,
  user,
  mobileOpen,
  onClose,
  onAccountSelect,
  onGoHome,
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeView, setActiveView, goHome } = useCopilotNav();
  const currentPage = location.pathname.split('/').pop() || 'Dashboard';
  const accounts = buildAccountItems(profile);
  const firstName = user?.full_name?.split(' ')[0] || 'Du';
  const initial = firstName.charAt(0).toUpperCase();

  const openToolView = (view) => {
    if (!TOOL_VIEW_IDS.has(view)) return;
    triggerHaptic('light');
    setActiveView(view);
    navigate(copilotToolHref(view));
    onClose?.();
  };

  const handleHome = () => {
    triggerHaptic('light');
    goHome();
    navigate(createPageUrl('Dashboard'));
    onGoHome?.();
    onClose?.();
  };

  const handleOverviewNav = (item) => {
    if (item.isHome) {
      handleHome();
      return;
    }
    goHome();
    onClose?.();
  };

  const handleExternalToolNav = () => {
    goHome();
    onClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="copilot-mobile-overlay"
          aria-label="Stäng meny"
          onClick={onClose}
        />
      )}
      <aside
        className={`copilot-sidebar ${mobileOpen ? 'copilot-sidebar--mobile-open' : ''} ${className}`}
      >
        <div className="copilot-sidebar-logo">
          <div className="copilot-logo-icon">
            <AnchorLogoMark size={16} className="text-white" />
          </div>
          <span className="copilot-logo-text">Anchor</span>
        </div>

        <div className="copilot-sidebar-section-label">Översikt</div>
        {OVERVIEW_NAV.map((item) => {
          const active = isOverviewActive(item, location.pathname, currentPage, activeView);

          if (item.isHome) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={handleHome}
                className={`copilot-nav-item w-full text-left ${active ? 'active' : ''}`}
              >
                <span className="copilot-nav-icon">
                  <NavIcon name={item.icon} size={16} />
                </span>
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={navHref(item)}
              className={`copilot-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleOverviewNav(item)}
            >
              <span className="copilot-nav-icon">
                <NavIcon name={item.icon} size={16} />
              </span>
              {item.label}
              {item.badge && (
                <span className={`copilot-nav-badge ${item.badgeGreen ? 'green' : ''}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="copilot-sidebar-section-label" style={{ marginTop: 8 }}>
          Konton
        </div>
        <div>
          {accounts.map((acc) => {
            const amountLabel = acc.amount < 0
              ? `−${fmtKr(acc.amount).replace(' kr', '')} kr`
              : fmtKr(acc.amount);

            if (acc.interactive && onAccountSelect) {
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onAccountSelect(acc);
                    onClose?.();
                  }}
                  className="copilot-account-item copilot-account-item--interactive w-full text-left active:scale-[0.97] transition-transform"
                >
                  <div className="copilot-account-dot" style={{ background: acc.color }} />
                  {acc.name}
                  <span className="copilot-account-amount">{amountLabel}</span>
                </button>
              );
            }

            return (
              <div key={acc.id || acc.name} className="copilot-account-item">
                <div className="copilot-account-dot" style={{ background: acc.color }} />
                {acc.name}
                <span className="copilot-account-amount">{amountLabel}</span>
              </div>
            );
          })}
          <Link
            to={createPageUrl('Settings')}
            className="copilot-account-item"
            style={{ marginTop: 4, color: '#4fc3f7', fontSize: 12 }}
            onClick={onClose}
          >
            + Lägg till konto
          </Link>
        </div>

        <div className="copilot-sidebar-section-label" style={{ marginTop: 8 }}>
          Verktyg
        </div>
        {TOOLS_NAV.map((item) => {
          if (item.external) {
            return (
              <Link
                key={item.label}
                to={navHref(item)}
                className="copilot-nav-item"
                onClick={handleExternalToolNav}
              >
                <span className="copilot-nav-icon">
                  <NavIcon name={item.icon} size={16} />
                </span>
                {item.label}
              </Link>
            );
          }

          const active = activeView === item.view;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => openToolView(item.view)}
              className={`copilot-nav-item w-full text-left active:scale-[0.98] transition-transform ${active ? 'active' : ''}`}
            >
              <span className="copilot-nav-icon">
                <NavIcon name={item.icon} size={16} />
              </span>
              {item.label}
            </button>
          );
        })}

        <div className="copilot-sidebar-footer">
          <Link to={createPageUrl('Settings')} className="copilot-user-row" onClick={onClose}>
            <div className="copilot-user-avatar">{initial}</div>
            <div>
              <div className="copilot-user-name">{firstName}</div>
              <div className="copilot-user-plan">Pro-plan</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--copilot-text-muted)' }}>
              <NavIcon name="settings" size={16} />
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
