import React, { createContext, useContext, useState, useCallback } from 'react';

/** @type {React.Context<{ sidebarOpen: boolean; openSidebar: () => void; closeSidebar: () => void; setSidebarOpen: (v: boolean) => void }>} */
const CopilotNavContext = createContext({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  setSidebarOpen: () => {},
});

export function CopilotNavProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <CopilotNavContext.Provider value={{ sidebarOpen, openSidebar, closeSidebar, setSidebarOpen }}>
      {children}
    </CopilotNavContext.Provider>
  );
}

export function useCopilotNav() {
  return useContext(CopilotNavContext);
}
