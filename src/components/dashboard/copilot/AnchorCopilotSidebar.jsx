import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { fmtKr, buildAccountItems } from './copilotDashboardUtils';
import { NavIcon } from '@/lib/anchorIcons';
import { triggerHaptic } from '@/lib/haptics';
import { useBilling } from '@/hooks/useBilling';
import { PRIMARY_NAV, isNavActive } from '@/lib/appNav';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import { Target, FileUp, ChevronRight } from 'lucide-react';

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
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const handleNav = () => {
    onClose?.();
  };

  const handleAddAccount = () => {
    triggerHaptic('light');
    setAddSheetOpen(true);
  };

  const handleAddSheetNav = (url) => {
    setAddSheetOpen(false);
    onClose?.();
    navigate(url);
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
          <span className="copilot-logo-text anchor-nav-brand">Anchor</span>
        </div>

        <div className="copilot-sidebar-section-label anchor-nav-section-label">Meny</div>
        {PRIMARY_NAV.map((item) => {
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
                <span className="anchor-nav-menu-label">{item.label}</span>
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
              <span className="anchor-nav-menu-label">{item.label}</span>
            </Link>
          );
        })}

        <div className="copilot-sidebar-section-label anchor-nav-section-label" style={{ marginTop: 12 }}>
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
                  <span className="anchor-nav-menu-label">{acc.name}</span>
                  <span className="copilot-account-amount">{amountLabel}</span>
                </button>
              );
            }

            return (
              <div key={acc.id || acc.name} className="copilot-account-item">
                <div className="copilot-account-dot" style={{ background: acc.color }} />
                <span className="anchor-nav-menu-label">{acc.name}</span>
                <span className="copilot-account-amount">{amountLabel}</span>
              </div>
            );
          })}
          <button
            type="button"
            className="copilot-account-item copilot-account-add w-full text-left anchor-nav-menu-label"
            onClick={handleAddAccount}
          >
            + Lägg till
          </button>
        </div>

        <div className="copilot-sidebar-footer">
          <Link to={createPageUrl('Settings')} className="copilot-user-row" onClick={handleNav}>
            <div className="copilot-user-avatar">{initial}</div>
            <div className="min-w-0">
              <div className="copilot-user-name anchor-nav-menu-label">{firstName}</div>
              <div className="copilot-user-plan anchor-nav-section-label">{planLabel}</div>
            </div>
            <span className="copilot-user-settings" aria-hidden>
              <NavIcon name="settings" size={16} />
            </span>
          </Link>
        </div>
      </aside>

      <AnchorSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        title="Lägg till"
        subtitle="Välj vad du vill lägga till i Anchor"
      >
        <div className="space-y-3 pb-2">
          <button
            type="button"
            onClick={() => handleAddSheetNav(createPageUrl('SavingsGoals'))}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-colors"
            style={{ background: 'var(--color-surface-raised)' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(107,159,255,0.12)' }}>
              <Target className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-white">Sparmål</p>
              <p className="text-[13px] text-white/45 mt-0.5">Skapa ett mål och följ din progress</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleAddSheetNav(createPageUrl('Import'))}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-colors"
            style={{ background: 'var(--color-surface-raised)' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(107,159,255,0.12)' }}>
              <FileUp className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-white">Importera transaktioner</p>
              <p className="text-[13px] text-white/45 mt-0.5">Ladda upp från bank eller klistra in</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
          </button>
        </div>
      </AnchorSheet>
    </>
  );
}
