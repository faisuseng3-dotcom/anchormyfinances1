import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const bizTitleClass = 'text-[17px] font-semibold tracking-tight text-[#1A2332]';
export const bizSubtitleClass = 'text-[13px] text-[#6B7A8C] leading-relaxed';
export const bizMetaClass = 'text-[13px] font-medium text-[#9AA5B4] tabular-nums';
export const bizDividerClass = 'h-px bg-[#E8ECF0]';

export function BusinessSection({
  title,
  subtitle,
  actionHref,
  actionLabel = 'Visa alla',
  children,
  className = '',
  id,
}) {
  return (
    <section id={id} className={`px-5 ${className}`}>
      {(title || actionHref) && (
        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="min-w-0">
            {title && <h2 className={bizTitleClass}>{title}</h2>}
            {subtitle && <p className={`${bizSubtitleClass} mt-0.5`}>{subtitle}</p>}
          </div>
          {actionHref && (
            <Link
              to={actionHref}
              className="flex items-center gap-0.5 text-[14px] font-medium text-[#0D7377] shrink-0"
            >
              {actionLabel}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function BusinessDivider({ className = '' }) {
  return <div className={`${bizDividerClass} ${className}`} />;
}

/** Light business page shell */
export function BusinessPageHeader({ title, subtitle, backHref = '/' }) {
  return (
    <header className="px-5 pt-8 pb-5 flex items-center gap-3">
      <Link
        to={backHref}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:opacity-80"
        aria-label="Tillbaka"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2332" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <div>
        {subtitle && <p className={bizSubtitleClass}>{subtitle}</p>}
        <h1 className="text-[22px] font-semibold text-[#1A2332] tracking-tight">{title}</h1>
      </div>
    </header>
  );
}

export function BusinessListRow({
  href,
  onClick,
  leading,
  title,
  subtitle,
  trailing,
  trailingClassName = 'text-[15px] font-semibold tabular-nums text-[#1A2332]',
  className = '',
}) {
  const inner = (
    <>
      {leading != null && <div className="flex-shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-[#1A2332] truncate">{title}</p>
        {subtitle && <p className={`${bizMetaClass} mt-0.5 truncate`}>{subtitle}</p>}
      </div>
      {trailing != null && <div className={`flex-shrink-0 text-right ${trailingClassName}`}>{trailing}</div>}
      {(href || onClick) && <ChevronRight className="w-4 h-4 text-[#C5CDD6] flex-shrink-0 ml-1" />}
    </>
  );

  const rowClass = `flex items-center gap-3 py-3.5 w-full text-left active:opacity-60 ${className}`;

  if (href) {
    return (
      <Link to={href} className={`${rowClass} no-underline`}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {inner}
      </button>
    );
  }
  return <div className={rowClass}>{inner}</div>;
}
