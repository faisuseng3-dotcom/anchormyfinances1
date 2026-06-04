import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { anchorIconButtonClass, anchorPageClass } from '@/lib/anchorTheme';
import { techPageBackHeader, techPageTitle, dashLabel, techInset, techInsetBg } from '@/lib/appSurface';

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
      <header className={`${techPageBackHeader} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          {backButton}
          <div className="min-w-0">
            {subtitle && <p className={dashLabel}>{subtitle}</p>}
            <h1 className={`${techPageTitle} truncate`}>{title}</h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="px-5 sm:px-7 space-y-7 pb-10">{children}</div>
    </div>
  );
}

export function GlassSection({ title, subtitle, children, className = '' }) {
  return (
    <section className={`${techInset} p-5 ${className}`}>
      <div className={techInsetBg} />
      <div className="relative z-10">
        {title && (
          <div className="mb-4">
            <h2 className="text-[17px] font-medium text-white">{title}</h2>
            {subtitle && <p className="text-[13px] text-white/45 mt-1 font-light">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
