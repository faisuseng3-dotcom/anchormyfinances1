import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { CORE_VIEWS, DEEP_VIEWS } from '@/lib/appStructure';
import { createPageUrl } from '@/utils';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import SettingsPanel from './SettingsPanel';

export default function AppStructurePanel() {
  const [open, setOpen] = useState(false);

  return (
    <SettingsPanel
      icon={Layers}
      title="App-struktur"
      subtitle="6 kärnvyer · djupvyer bakom hubbar"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div>
        <p className="anchor-type-body-sm text-[var(--color-text-muted)] mb-2">Kärnvyer</p>
        <ul className="space-y-1">
          {CORE_VIEWS.map((view) => {
            const Icon = view.icon;
            return (
              <li key={view.id}>
                <Link
                  to={createPageUrl(view.page)}
                  className="flex items-center gap-2.5 py-2.5 min-h-11 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline anchor-pressable rounded-[var(--anchor-radius-md)]"
                >
                  <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                  {view.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <DashboardDivider className="opacity-25" />

      <div>
        <p className="anchor-type-body-sm text-[var(--color-text-muted)] mb-2">Djupvyer (via hub)</p>
        <ul className="space-y-1">
          {DEEP_VIEWS.filter((d) => !d.legacy).map((view) => {
            const Icon = view.icon;
            const path = view.page === 'Budget' ? '/Budget' : createPageUrl(view.page);
            return (
              <li key={view.page} className="flex items-center gap-2.5 py-2 min-h-11">
                <Icon className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
                <span className="text-[13px] text-[var(--color-text-secondary)] flex-1 min-w-0">{view.label}</span>
                <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">← {view.hub}</span>
                <Link
                  to={path}
                  className="text-[12px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] no-underline shrink-0 anchor-pressable px-2 py-1"
                >
                  Öppna
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </SettingsPanel>
  );
}
