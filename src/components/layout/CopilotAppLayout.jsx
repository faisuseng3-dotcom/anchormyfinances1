import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useDemoMode } from '@/components/demo/DemoMode';
import AnchorCopilotSidebar from '@/components/dashboard/copilot/AnchorCopilotSidebar';
import { CopilotNavProvider, useCopilotNav } from './CopilotNavContext';
import '@/components/dashboard/copilot/anchorCopilot.css';

function CopilotShell({ children }) {
  const { sidebarOpen, closeSidebar } = useCopilotNav();
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const { isAlexMode: isAlex } = useDemoMode();

  const displayUser = isAlex ? { full_name: 'Alex Lindqvist' } : user;

  return (
    <div className="anchor-copilot-shell">
      <AnchorCopilotSidebar
        profile={profile}
        user={displayUser}
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      <main className="copilot-main">{children}</main>
    </div>
  );
}

export default function CopilotAppLayout({ children }) {
  return (
    <CopilotNavProvider>
      <CopilotShell>{children}</CopilotShell>
    </CopilotNavProvider>
  );
}
