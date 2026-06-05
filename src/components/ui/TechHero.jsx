// @ts-nocheck
import React from 'react';
import { techHeroWrap, techHeroMesh, dashLabel } from '@/lib/appSurface';

/**
 * Sidhero utan Base44-ruta — mesh + ring.
 */
export default function TechHero({ label, title, children, accent = 'blue' }) {
  const mesh =
    accent === 'teal'
      ? 'radial-gradient(ellipse 80% 100% at 100% 0%, rgba(45, 212, 191, 0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 0% 100%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)'
      : accent === 'violet'
        ? 'radial-gradient(ellipse 80% 100% at 0% 0%, rgba(167, 139, 250, 0.2) 0%, transparent 55%)'
        : 'radial-gradient(ellipse 90% 100% at 50% -20%, rgba(96, 165, 250, 0.22) 0%, transparent 60%)';

  return (
    <div className={`${techHeroWrap} ring-1 ring-inset ring-white/[0.09]`}>
      <div className={techHeroMesh} style={{ background: mesh }} />
      <div className="relative z-10">
        {label && <p className={dashLabel}>{label}</p>}
        {title && <div className="text-[17px] font-medium text-white/90 mt-1">{title}</div>}
        {children}
      </div>
    </div>
  );
}
