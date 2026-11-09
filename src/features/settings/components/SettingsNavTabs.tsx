'use client';

import { motion } from 'framer-motion';
import { SettingsTabId, SettingsTabItem } from '../types/settings.types';

interface SettingsNavTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'team-roles', label: 'Team & Roles' },
  { id: 'security', label: 'Security' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'data', label: 'Data & Storage' },
];

export function SettingsNavTabs({
  activeTab,
  onTabChange,
}: SettingsNavTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="inline-flex items-center gap-1 sm:gap-1.5 p-1 bg-white/90 backdrop-blur-md border border-primary-medium/20 rounded-xl sm:rounded-2xl shadow-2xs min-w-full sm:min-w-0"
      >
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all select-none cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-primary-dark font-bold'
                  : 'text-primary-dark/75 hover:text-primary-dark hover:bg-primary-medium/10 font-semibold'
              }`}
            >
              {/* Highlight pill background for active tab matching uploaded UI */}
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTabPill"
                  className="absolute inset-0 bg-primary/10 border border-primary-medium/20 rounded-lg sm:rounded-xl shadow-2xs"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}

              {/* Tab label */}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.label}
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-dark text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
