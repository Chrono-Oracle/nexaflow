'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LuArrowLeft } from 'react-icons/lu';
import { Link } from '@/i18n/routing';
import { SettingsTabId } from '../types/settings.types';
import { SettingsNavTabs } from './SettingsNavTabs';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { WorkspaceTab } from './tabs/WorkspaceTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { TeamRolesTab } from './tabs/TeamRolesTab';
import { SecurityTab } from './tabs/SecurityTab';
import { IntegrationsTab } from './tabs/IntegrationsTab';
import { DataManagementTab } from './tabs/DataManagementTab';

export function SettingsContainer() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get('tab') as SettingsTabId | null;

  // Default to 'notifications' to match the uploaded screenshot
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    initialTabParam || 'notifications'
  );

  return (
    <div className="font-elms w-full space-y-6 pb-16">
      {/* Top Header Section matching other pages */}
      <div className="space-y-2.5">
        {/* Back to dashboard link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-dark/80 hover:text-primary-dark transition-colors cursor-pointer group"
          >
            <LuArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary-dark" />
            <span>Back to dashboard</span>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight">
          Settings
        </h1>
      </div>

      {/* Navlinks Pill Bar */}
      <SettingsNavTabs
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Settings Card Container */}
      <div className="bg-white/95 border border-primary-medium/20 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs transition-all">
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'workspace' && <WorkspaceTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'team-roles' && <TeamRolesTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'data' && <DataManagementTab />}
      </div>
    </div>
  );
}
