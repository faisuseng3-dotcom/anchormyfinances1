// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { anchorIconButtonClass, anchorPageClass } from '@/lib/anchorTheme';
import { dashZone, dashLabel } from '@/lib/dashboardTheme';
import { surface } from '@/lib/designTokens';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.backHref]
 * @param {() => void} [props.onBack]
 * @param {React.ReactNode} [props.action]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function PageShell({
  title,
  subtitle,
  backHref,
  onBack,
  action,
  children,
  className = '',
}) {
  const backControl = backHref ? (
    <Link to={backHref} className="no-underline">
      <span className={`${anchorIconButtonClass} anchor-elev-1`} aria-label="Tillbaka">
        <ArrowLeft className="w-4 h-4" />
      </span>
    </Link>
  ) : onBack ? (
    <AnchorPressable onClick={onBack} className={`${anchorIconButtonClass} anchor-elev-1`} aria-label="Tillbaka">
      <ArrowLeft className="w-4 h-4" />
    </AnchorPressable>
  ) : null;

  return (
    <div className={`${anchorPageClass} anchor-mobile-frame ${className}`}>
      <header
        className={`${dashZone} pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:pt-11 pb-5 anchor-hero-asymmetric`}
      >
        <div className="flex items-start gap-3 min-w-0">
          {backControl}
          <div className="min-w-0 pt-1">
            {subtitle && <p className={dashLabel}>{subtitle}</p>}
            <h1 className="anchor-type-display text-[24px] sm:text-[28px] truncate">{title}</h1>
          </div>
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </header>
      <div className={`${dashZone} space-y-8 pb-10`}>
        {children}
      </div>
    </div>
  );
}

export function GlassSection({ title, subtitle, children, className = '' }) {
  return (
    <section className={`${surface.card} p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="anchor-type-headline">{title}</h2>
          {subtitle && <p className="anchor-type-body-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
