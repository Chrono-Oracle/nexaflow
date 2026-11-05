'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { SidebarProvider } from '@/context/SidebarContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </QueryProvider>
  );
}
