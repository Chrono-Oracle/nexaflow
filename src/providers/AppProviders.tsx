'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import { useStorageSync } from '@/hooks/useDashboardData';

function StorageSyncListener() {
  useStorageSync();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <StorageSyncListener />
      <SidebarProvider>{children}</SidebarProvider>
    </QueryProvider>
  );
}
