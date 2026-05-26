import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorIconButtonClass, anchorPageClass, sectionLabelClass } from '@/lib/anchorTheme';

/**
 * Shared page chrome: Revolut gradient background + consistent header.
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
  const backButton = backHref ? (
    <Link to={backHref}>
      <button type="button" className={anchorIconButtonClass} aria-label="Tillbaka">
        <ArrowLeft className="w-4 h-4" />
      </button>
    </Link>
  ) : onBack ? (
    <button type="button" onClick={onBack} className={anchorIconButtonClass} aria-label="Tillbaka">
      <ArrowLeft className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <div className={`${anchorPageClass} ${className}`}>
      <header className="px-4 sm:px-5 pt-7 sm:pt-8 pb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {backButton}
          <div className="min-w-0">
            {subtitle && <p className={`${sectionLabelClass} mb-0.5`}>{subtitle}</p>}
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="px-4 sm:px-5 space-y-4 pb-6">{children}</div>
    </div>
  );
}

export function GlassSection({ title, children, className = '' }) {
  return (
    <section className={`anchor-glass-card ${className}`}>
      {title && <p className={`${sectionLabelClass} mb-4`}>{title}</p>}
      {children}
    </section>
  );
}
