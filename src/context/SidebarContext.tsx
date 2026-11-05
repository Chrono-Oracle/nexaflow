'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isExpanded: boolean;
  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
  setIsExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default to collapsed icon dock matching the design specification
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const expandSidebar = () => setIsExpanded(true);
  const collapseSidebar = () => setIsExpanded(false);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        toggleSidebar,
        expandSidebar,
        collapseSidebar,
        setIsExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
