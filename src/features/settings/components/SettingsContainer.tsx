'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SettingsTabId } from '../types/settings.types';
import { SettingsNavTabs } from './SettingsNavTabs';
import { ProfileTab } from './tabs/ProfileTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { TeamRolesTab } from './tabs/TeamRolesTab';
import { SecurityTab } from './tabs/SecurityTab';

const VALID_TABS: SettingsTabId[] = [
  'profile',
  'appearance',
  'team-roles',
  'security',
];

export function SettingsContainer() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get('tab') as SettingsTabId | null;

  const initialTab =
    initialTabParam && VALID_TABS.includes(initialTabParam)
      ? initialTabParam
      : 'profile';

  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  return (
    <div className="font-elms w-full space-y-6 pb-16">
      {/* Navlinks Pill Bar Header at the top */}
      <SettingsNavTabs
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Settings Card Container */}
      <div className="bg-white/95 border border-primary-medium/20 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs transition-all">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'team-roles' && <TeamRolesTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
