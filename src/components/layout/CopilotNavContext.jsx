import React, { createContext, useContext, useState, useCallback } from 'react';
import { COPILOT_VIEWS } from '@/lib/copilotViews';

const CopilotNavContext = createContext({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  setSidebarOpen: () => {},
  activeView: COPILOT_VIEWS.home,
  setActiveView: () => {},
  goHome: () => {},
});

export function CopilotNavProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(COPILOT_VIEWS.home);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const goHome = useCallback(() => setActiveView(COPILOT_VIEWS.home), []);

  return (
    <CopilotNavContext.Provider
      value={{
        sidebarOpen,
        openSidebar,
        closeSidebar,
        setSidebarOpen,
        activeView,
        setActiveView,
        goHome,
      }}
    >
      {children}
    </CopilotNavContext.Provider>
  );
}

export function useCopilotNav() {
  return useContext(CopilotNavContext);
}
