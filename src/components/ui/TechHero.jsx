// @ts-nocheck
import React from 'react';
import { techHeroWrap, techHeroMesh, dashLabel } from '@/lib/appSurface';

/**
 * Sidhero utan Base44-ruta — mesh + ring.
 */
export default function TechHero({ label, title, children, accent = 'blue' }) {
  const mesh =
    accent === 'teal'
      ? 'radial-gradient(ellipse 80% 100% at 100% 0%, rgba(22, 163, 74, 0.10) 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 0% 100%, rgba(37, 99, 235, 0.06) 0%, transparent 50%)'
      : accent === 'violet'
        ? 'radial-gradient(ellipse 80% 100% at 0% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 55%)'
        : 'radial-gradient(ellipse 90% 100% at 50% -20%, rgba(37, 99, 235, 0.10) 0%, transparent 60%)';

  return (
    <div
      className={`${techHeroWrap} bg-white border border-[var(--color-border)]`}
      style={{ boxShadow: 'var(--anchor-shadow-1)' }}
    >
      <div className={techHeroMesh} style={{ background: mesh }} />
      <div className="relative z-10">
        {label && <p className={dashLabel}>{label}</p>}
        {title && <div className="text-[17px] font-medium text-[var(--color-text-primary)] mt-1">{title}</div>}
        {children}
      </div>
    </div>
  );
}
