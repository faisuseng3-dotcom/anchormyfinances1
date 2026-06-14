// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { copilotPageClass } from '@/lib/copilotTheme';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import CopilotCard from '@/components/ui-premium/copilot/CopilotCard';
import { useCopilotNav } from '@/components/layout/CopilotNavContext';
import { NavIcon } from '@/lib/anchorIcons';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.backHref]
 * @param {() => void} [props.onBack]
 * @param {React.ReactNode} [props.action]
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.headerExtra]
 * @param {string} [props.className]
 */
export default function PageShell({
  title,
  subtitle,
  backHref,
  onBack,
  action,
  headerExtra,
  children,
  className = '',
}) {
  const { openSidebar } = useCopilotNav();

  const backControl = backHref ? (
    <Link to={backHref} className="no-underline">
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--copilot-bg-card)] organic-surface text-[var(--copilot-text-secondary)] hover:text-white hover:bg-[var(--copilot-bg-card-hover)] transition-colors"
        aria-label="Tillbaka"
      >
        <ArrowLeft className="w-4 h-4" />
      </span>
    </Link>
  ) : onBack ? (
    <AnchorPressable
      onClick={onBack}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--copilot-bg-card)] organic-surface"
      aria-label="Tillbaka"
    >
      <ArrowLeft className="w-4 h-4" />
    </AnchorPressable>
  ) : null;

  return (
    <div className={`${copilotPageClass} ${className}`}>
      <header className="copilot-page-zone pt-[max(2rem,env(safe-area-inset-top,0px))] sm:pt-10 pb-5 sticky top-0 z-20 bg-[rgba(10,15,107,0.55)] backdrop-blur-xl" style={{boxShadow:'0 1px 0 rgba(255,255,255,0.04)'}}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              className="copilot-icon-btn lg:hidden shrink-0"
              aria-label="Öppna meny"
              onClick={openSidebar}
            >
              <NavIcon name="menu" size={18} />
            </button>
            {backControl}
            <div className="min-w-0 pt-0.5">
              {subtitle && (
                <p className="anchor-type-caption">
                  {subtitle}
                </p>
              )}
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white truncate">
                {title}
              </h1>
            </div>
          </div>
          {action && <div className="shrink-0 pt-1">{action}</div>}
        </div>
        {headerExtra}
      </header>
      <div className="copilot-page-zone space-y-5 pb-12 pt-6">
        {children}
      </div>
    </div>
  );
}

export function GlassSection({ title, subtitle, children, className = '' }) {
  return (
    <CopilotCard className={className}>
      {title && (
        <div className="mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-secondary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[14px] text-[var(--copilot-text-muted)] mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </CopilotCard>
  );
}
