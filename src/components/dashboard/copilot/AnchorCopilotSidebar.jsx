import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { fmtKr, buildAccountItems } from './copilotDashboardUtils';
import { NavIcon } from '@/lib/anchorIcons';
import { triggerHaptic } from '@/lib/haptics';
import { useBilling } from '@/hooks/useBilling';
import { OVERVIEW_NAV, TOOLS_NAV, isNavActive } from '@/lib/appNav';

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
  const { planLabel } = useBilling();
  const accounts = buildAccountItems(profile);
  const firstName = user?.full_name?.split(' ')[0] || 'Du';
  const initial = firstName.charAt(0).toUpperCase();

  const handleNav = () => {
    onClose?.();
  };

  const handleHome = () => {
    triggerHaptic('light');
    navigate(createPageUrl('Dashboard'));
    onGoHome?.();
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
          <div className="copilot-logo-icon" aria-hidden>
            ⚓
          </div>
          <span className="copilot-logo-text">Anchor</span>
        </div>

        <div className="copilot-sidebar-section-label">Översikt</div>
        {OVERVIEW_NAV.map((item) => {
          const active = isNavActive(item.id, location.pathname);
          if (item.id === 'Dashboard') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleHome}
                className={`copilot-nav-item w-full text-left ${active ? 'active' : ''}`}
              >
                <span className={`copilot-nav-icon ${active ? 'copilot-nav-icon--active' : ''}`}>
                  <NavIcon name={item.icon} size={16} />
                </span>
                {item.label}
              </button>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`copilot-nav-item ${active ? 'active' : ''}`}
              onClick={handleNav}
            >
              <span className={`copilot-nav-icon ${active ? 'copilot-nav-icon--active' : ''}`}>
                <NavIcon name={item.icon} size={16} />
              </span>
              {item.label}
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
                  className="copilot-account-item copilot-account-item--interactive w-full text-left"
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
            className="copilot-account-item copilot-account-add"
            onClick={handleNav}
          >
            + Lägg till konto
          </Link>
        </div>

        <div className="copilot-sidebar-section-label" style={{ marginTop: 8 }}>
          Verktyg
        </div>
        {TOOLS_NAV.map((item) => {
          const active = isNavActive(item.id, location.pathname);
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`copilot-nav-item ${active ? 'active' : ''}`}
              onClick={handleNav}
            >
              <span className={`copilot-nav-icon ${active ? 'copilot-nav-icon--active' : ''}`}>
                <NavIcon name={item.icon} size={16} />
              </span>
              {item.label}
            </Link>
          );
        })}

        <div className="copilot-sidebar-footer">
          <Link to={createPageUrl('Settings')} className="copilot-user-row" onClick={handleNav}>
            <div className="copilot-user-avatar">{initial}</div>
            <div className="min-w-0">
              <div className="copilot-user-name">{firstName}</div>
              <div className="copilot-user-plan">{planLabel}</div>
            </div>
            <span className="copilot-user-settings" aria-hidden>
              <NavIcon name="settings" size={16} />
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
