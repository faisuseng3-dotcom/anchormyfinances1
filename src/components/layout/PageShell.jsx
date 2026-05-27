import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorIconButtonClass, anchorPageClass, sectionSubtitleClass } from '@/lib/anchorTheme';

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
      <span className={anchorIconButtonClass} aria-label="Tillbaka">
        <ArrowLeft className="w-4 h-4" />
      </span>
    </Link>
  ) : onBack ? (
    <button type="button" onClick={onBack} className={anchorIconButtonClass} aria-label="Tillbaka">
      <ArrowLeft className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <div className={`${anchorPageClass} ${className}`}>
      <header className="px-4 sm:px-6 pt-8 sm:pt-10 pb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {backButton}
          <div className="min-w-0">
            {subtitle && <p className={`${sectionSubtitleClass} mb-0.5`}>{subtitle}</p>}
            <h1 className="text-[22px] font-semibold text-white tracking-tight truncate">{title}</h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="px-4 sm:px-6 space-y-8 pb-8">{children}</div>
    </div>
  );
}

/** Elevated block — use sparingly (modals, special cards) */
export function GlassSection({ title, subtitle, children, className = '' }) {
  return (
    <section className={`anchor-glass-card ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="text-[17px] font-semibold text-white">{title}</h2>
          {subtitle && <p className={`${sectionSubtitleClass} mt-0.5`}>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
