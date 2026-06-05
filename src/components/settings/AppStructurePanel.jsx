import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Layers } from 'lucide-react';
import { CORE_VIEWS, DEEP_VIEWS } from '@/lib/appStructure';
import { createPageUrl } from '@/utils';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';

/**
 * Visar app-hierarkin: 6 kärnvyer + dolda djupvyer.
 */
export default function AppStructurePanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl ring-1 ring-white/[0.08] bg-white/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Layers className="w-4 h-4 text-cyan-300/80 shrink-0" />
          <span>
            <span className="block text-[14px] font-medium text-white/85">App-struktur</span>
            <span className="block text-[12px] text-white/45 mt-0.5">
              6 kärnvyer · djupvyer bakom hubbar
            </span>
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/35 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35 mb-2">Kärnvyer</p>
            <ul className="space-y-1">
              {CORE_VIEWS.map((view) => {
                const Icon = view.icon;
                return (
                  <li key={view.id}>
                    <Link
                      to={createPageUrl(view.page)}
                      className="flex items-center gap-2.5 py-2 text-[14px] text-white/75 hover:text-white no-underline"
                    >
                      <Icon className="w-4 h-4 text-cyan-300/70" />
                      {view.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <DashboardDivider className="opacity-25" />

          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35 mb-2">Djupvyer (via hub)</p>
            <ul className="space-y-1">
              {DEEP_VIEWS.filter((d) => !d.legacy).map((view) => {
                const Icon = view.icon;
                const path = view.page === 'Budget' ? '/Budget' : createPageUrl(view.page);
                return (
                  <li key={view.page} className="flex items-center gap-2.5 py-1.5">
                    <Icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <span className="text-[13px] text-white/55 flex-1 min-w-0">{view.label}</span>
                    <span className="text-[11px] text-white/30 shrink-0">← {view.hub}</span>
                    <Link to={path} className="text-[12px] text-cyan-300/70 hover:text-cyan-200 no-underline shrink-0">
                      Öppna
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
