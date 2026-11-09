import { Suspense } from 'react';
import { SettingsContainer } from '@/features/settings/components/SettingsContainer';

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-8 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 rounded-full border-2 border-primary-dark/20 border-t-primary-dark animate-spin" />
        </div>
      }
    >
      <SettingsContainer />
    </Suspense>
  );
}
