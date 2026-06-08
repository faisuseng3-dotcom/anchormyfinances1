import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  anchorDividerClass,
  anchorListRowClass,
  anchorZoneClass,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';

/**
 * Zone on the canvas — title + content, no glass box.
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.actionLabel]
 * @param {string} [props.actionHref]
 * @param {() => void} [props.onAction]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.id]
 * @param {boolean} [props.nested]
 */
export function DashboardSection({
  title,
  subtitle,
  action,
  actionLabel = 'Visa alla',
  actionHref,
  onAction,
  children,
  className = '',
  id,
  /** Inside PageShell — skip horizontal padding */
  nested = false,
}) {
  const actionEl =
    action ||
    (actionHref ? (
      <Link to={actionHref} className="flex items-center gap-0.5 min-h-12 px-1 text-[14px] font-medium text-white/55 hover:text-white/90 anchor-pressable">
        {actionLabel}
        <ChevronRight className="w-4 h-4" />
      </Link>
    ) : onAction ? (
      <button type="button" onClick={onAction} className="flex items-center gap-0.5 text-[14px] font-medium text-white/55 hover:text-white/90">
        {actionLabel}
        <ChevronRight className="w-4 h-4" />
      </button>
    ) : null);

  return (
    <section id={id} className={`${nested ? '' : anchorZoneClass} ${className}`}>
      {(title || actionEl) && (
        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="min-w-0">
            {title && <h2 className={sectionTitleClass}>{title}</h2>}
            {subtitle && <p className={`${sectionSubtitleClass} mt-0.5`}>{subtitle}</p>}
          </div>
          {actionEl && <div className="shrink-0 pb-0.5">{actionEl}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function DashboardDivider({ className = '' }) {
  return <div className={`${anchorDividerClass} ${className}`} />;
}

/**
 * Full-width list row — Revolut-style
 * @param {Object} props
 * @param {string|React.ElementType} [props.as]
 * @param {string} [props.href]
 * @param {() => void} [props.onClick]
 * @param {React.ReactNode} [props.leading]
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.trailing]
 * @param {string} [props.trailingClassName]
 * @param {string} [props.className]
 */
export function DashboardListRow({
  as: Component = 'div',
  href,
  onClick,
  leading,
  title,
  subtitle,
  trailing,
  trailingClassName = 'text-[15px] font-semibold tabular-nums text-white',
  className = '',
  ...rest
}) {
  const inner = (
    <>
      {leading != null && <div className="flex-shrink-0 w-11 flex items-center justify-center">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-white truncate">{title}</p>
        {subtitle && <p className={`${sectionMetaClass} mt-0.5 truncate`}>{subtitle}</p>}
      </div>
      {trailing != null && (
        <div className={`flex-shrink-0 text-right ${trailingClassName}`}>{trailing}</div>
      )}
      {(href || onClick) && <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0 ml-1" />}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={`${anchorListRowClass} min-h-12 anchor-pressable no-underline ${className}`} {...rest}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${anchorListRowClass} min-h-12 anchor-pressable ${className}`} {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <Component className={`${anchorListRowClass} ${className}`} {...rest}>
      {inner}
    </Component>
  );
}

/** Three stats in a row — no enclosing box */
export function DashboardStatStrip({ items }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <div className="w-px self-stretch bg-white/[0.08] my-1" />}
          <div className="flex-1 text-center min-w-0">
            <p className={sectionMetaClass}>{item.label}</p>
            <p className="text-[17px] font-semibold text-white tabular-nums mt-1 leading-none">{item.value}</p>
            {item.sub && <p className="text-[12px] text-white/40 mt-1">{item.sub}</p>}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
