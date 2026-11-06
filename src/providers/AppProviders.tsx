'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
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
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-elms rounded-2xl shadow-xl border border-primary-medium/15 text-xs sm:text-sm',
        }}
      />
    </QueryProvider>
  );
}
