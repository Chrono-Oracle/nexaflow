'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LuCheck, LuRotateCcw } from 'react-icons/lu';
import { ToggleSwitch } from '../ToggleSwitch';
import {
  NotificationSettingsState,
  NotificationChannel,
} from '../../types/settings.types';
import {
  settingsStorage,
  DEFAULT_NOTIFICATIONS,
} from '../../utils/settingsStorage';

interface NotificationRowConfig {
  id: keyof NotificationSettingsState;
  title: string;
  description: string;
}

const NOTIFICATION_ROWS: NotificationRowConfig[] = [
  {
    id: 'comments',
    title: 'Comments',
    description:
      'These are notifications for comments on your assigned tasks, project discussions, and replies to your updates.',
  },
  {
    id: 'tags',
    title: 'Tags',
    description:
      'These are notifications for when someone tags you in a comment, assigns you a task, or mentions your handle.',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description:
      'These are notifications to remind you of upcoming deadlines, overdue deliverables, and schedule updates you might have missed.',
  },
  {
    id: 'activity',
    title: 'More activity about you',
    description:
      'These are notifications for milestone completions, status transitions, and reactions on your project board updates.',
  },
  {
    id: 'workload',
    title: 'Team & Workload alerts',
    description:
      'These are notifications when team members reach capacity limits, request reviews, or workload rebalancing is required.',
  },
  {
    id: 'digest',
    title: 'Weekly workspace digest',
    description:
      'A consolidated weekly email report summarizing project velocity, completed tasks, and upcoming milestones.',
  },
];

export function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettingsState>(
    DEFAULT_NOTIFICATIONS
  );
  const [isSaved, setIsSaved] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const loaded = settingsStorage.getNotifications();
    setSettings(loaded);
  }, []);

  const handleToggle = (
    rowId: keyof NotificationSettingsState,
    channel: NotificationChannel,
    nextVal: boolean
  ) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [channel]: nextVal,
        },
      };
      settingsStorage.saveNotifications(updated);
      return updated;
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveAll = () => {
    settingsStorage.saveNotifications(settings);
    toast.success('Notification preferences saved successfully');
  };

  const handleReset = () => {
    setSettings(DEFAULT_NOTIFICATIONS);
    settingsStorage.saveNotifications(DEFAULT_NOTIFICATIONS);
    toast.info('Notification preferences reset to default');
  };

  return (
    <div className="font-elms">
      {/* Header section matching uploaded UI */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Notification settings
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          We may still send you important notifications about your account outside of your notification settings.
        </p>
      </div>

      {/* Horizontal divider line matching uploaded UI */}
      <div className="border-b border-primary-medium/15 my-6 sm:my-7" />

      {/* Notification Categories List */}
      <div className="divide-y divide-primary-medium/15">
        {NOTIFICATION_ROWS.map((row) => {
          const rowState = settings[row.id];

          return (
            <div
              key={row.id}
              className="py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8"
            >
              {/* Category Info (Left) */}
              <div className="max-w-xl">
                <h3 className="text-sm sm:text-base font-bold text-primary-dark">
                  {row.title}
                </h3>
                <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-0.5 leading-relaxed">
                  {row.description}
                </p>
              </div>

              {/* Toggles (Right) - Push, Email, SMS */}
              <div className="flex items-center gap-5 sm:gap-7 shrink-0 pt-1 md:pt-0">
                <ToggleSwitch
                  id={`${row.id}-push`}
                  label="Push"
                  checked={rowState?.push ?? false}
                  onChange={(val) => handleToggle(row.id, 'push', val)}
                />
                <ToggleSwitch
                  id={`${row.id}-email`}
                  label="Email"
                  checked={rowState?.email ?? false}
                  onChange={(val) => handleToggle(row.id, 'email', val)}
                />
                <ToggleSwitch
                  id={`${row.id}-sms`}
                  label="SMS"
                  checked={rowState?.sms ?? false}
                  onChange={(val) => handleToggle(row.id, 'sms', val)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-primary-medium/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-primary-dark/80 font-medium">
          {isSaved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <LuCheck className="w-4 h-4 stroke-[2.5]" />
              Changes saved automatically
            </span>
          ) : (
            <span>All toggle changes apply in real-time across your workspace.</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-primary-dark hover:bg-black/5 transition-all cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            Reset to default
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
