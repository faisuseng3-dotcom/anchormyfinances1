import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { planeraTabHref } from '@/lib/planeraTabs';
import { fmtKr, buildAccountItems } from './copilotDashboardUtils';

const OVERVIEW_NAV = [
  { page: 'Dashboard', icon: '⌂', label: 'Hem' },
  { page: 'Budget', icon: '📊', label: 'Budget', badge: 'OK', badgeGreen: true },
  { href: planeraTabHref('nu'), icon: '🔮', label: 'Din Framtid', match: 'FuturePulse' },
  { href: `${createPageUrl('ProTools')}?deep=ai_guru`, icon: '🤖', label: 'AI-Coach', badge: '3' },
];

const TOOLS_NAV = [
  { page: 'Dashboard', icon: '🎯', label: 'Sparmål', hash: '#goals' },
  { page: 'ProTools', icon: '🔁', label: 'Prenumerationer', query: '?deep=subscriptions' },
  { href: createPageUrl('BusinessDashboard'), icon: '🏢', label: 'Business' },
  { page: 'Social', icon: '👥', label: 'Squads' },
  { page: 'Dashboard', icon: '🎓', label: 'Anchor Academy', hash: '#academy' },
];

function navHref(item) {
  if (item.href) return item.href;
  let url = createPageUrl(item.page);
  if (item.query) url += item.query;
  if (item.hash) url += item.hash;
  return url;
}

function isNavActive(item, pathname, currentPage) {
  if (item.match) return currentPage === item.match;
  if (item.page === 'Dashboard' && !item.hash) return currentPage === 'Dashboard' && !item.query;
  if (item.page && !item.hash && !item.query) return currentPage === item.page;
  return false;
}

export default function AnchorCopilotSidebar({
  profile,
  user,
  mobileOpen,
  onClose,
  className = '',
}) {
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || 'Dashboard';
  const accounts = buildAccountItems(profile);
  const firstName = user?.full_name?.split(' ')[0] || 'Du';
  const initial = firstName.charAt(0).toUpperCase();

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
          <div className="copilot-logo-icon">⚓</div>
          <span className="copilot-logo-text">Anchor</span>
        </div>

        <div className="copilot-sidebar-section-label">Översikt</div>
        {OVERVIEW_NAV.map((item) => {
          const active = isNavActive(item, location.pathname, currentPage);
          return (
            <Link
              key={item.label}
              to={navHref(item)}
              className={`copilot-nav-item ${active ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="copilot-nav-icon">{item.icon}</span>
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
          {accounts.map((acc) => (
            <div key={acc.name} className="copilot-account-item">
              <div className="copilot-account-dot" style={{ background: acc.color }} />
              {acc.name}
              <span className="copilot-account-amount">
                {acc.amount < 0 ? `−${fmtKr(acc.amount).replace(' kr', '')} kr` : fmtKr(acc.amount)}
              </span>
            </div>
          ))}
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
        {TOOLS_NAV.map((item) => (
          <Link
            key={item.label}
            to={navHref(item)}
            className="copilot-nav-item"
            onClick={onClose}
          >
            <span className="copilot-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="copilot-sidebar-footer">
          <Link to={createPageUrl('Settings')} className="copilot-user-row" onClick={onClose}>
            <div className="copilot-user-avatar">{initial}</div>
            <div>
              <div className="copilot-user-name">{firstName}</div>
              <div className="copilot-user-plan">Pro-plan</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--copilot-text-muted)', fontSize: 14 }}>
              ⚙
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
