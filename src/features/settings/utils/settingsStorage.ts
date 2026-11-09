import {
  NotificationSettingsState,
  UserProfileSettings,
  WorkspaceSettings,
  AppearanceSettings,
  SecuritySettings,
  IntegrationService,
} from '../types/settings.types';
import { currentUser } from '@/data/userDashboard';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'nexaflow_settings_notifications',
  PROFILE: 'nexaflow_settings_profile',
  WORKSPACE: 'nexaflow_settings_workspace',
  APPEARANCE: 'nexaflow_settings_appearance',
  SECURITY: 'nexaflow_settings_security',
  INTEGRATIONS: 'nexaflow_settings_integrations',
};

export const DEFAULT_NOTIFICATIONS: NotificationSettingsState = {
  // Exactly matching the uploaded screenshot state
  comments: { push: true, email: true, sms: false },
  tags: { push: true, email: false, sms: false },
  reminders: { push: false, email: false, sms: false },
  activity: { push: false, email: false, sms: false },
  workload: { push: false, email: true, sms: false },
  digest: { push: false, email: true, sms: false },
};

export const DEFAULT_PROFILE: UserProfileSettings = {
  fullName: currentUser.fullName || 'Tankeu Daniel',
  nickname: currentUser.nickname || 'OracleX',
  email: currentUser.email || 'oraclexp@gmail.com',
  phone: '+237 670 000 001',
  title: 'Operations Manager & Lead Architect',
  department: 'Operations',
  bio: 'Leading cross-functional product operations, roadmap execution, and sprint delivery across NexaFlow engineering domains.',
  avatar: currentUser.avatar || '/Avatar.jpg',
};

export const DEFAULT_WORKSPACE: WorkspaceSettings = {
  name: 'NexaFlow HQ',
  slug: 'nexaflow-hq',
  timezone: 'UTC+01:00 (Europe/Paris, West Africa Time)',
  schedule: 'Monday – Friday, 09:00 – 18:00',
  defaultPriority: 'Medium',
  defaultView: 'kanban',
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  companyLogo: null,
  brandColor: '#2C68F6',
  theme: 'light',
  transparentSidebar: false,
  sidebarFeature: 'recent-changes',
  tablesView: 'default',
  density: 'comfortable',
  reducedMotion: false,
};

export const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorEnabled: true,
  requireManagerReview: true,
  publicRoadmaps: false,
  sessionTimeoutHours: 24,
};

export const DEFAULT_INTEGRATIONS: IntegrationService[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control & CI/CD',
    description: 'Sync pull requests, commits, and branches directly into task cards.',
    icon: 'github',
    connected: true,
    meta: 'Connected to nexaflow/core (main branch)',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Team Communication',
    description: 'Receive real-time alerts for overdue tasks, project mentions, and blocker updates.',
    icon: 'slack',
    connected: true,
    meta: 'Alerts posting to #nexaflow-hq',
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design & Prototyping',
    description: 'Embed live Figma frames, inspect component specs, and preview canvas updates.',
    icon: 'figma',
    connected: true,
    meta: 'Workspace team library synced',
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    category: 'Schedules & Deadlines',
    description: 'Synchronize sprint deadlines, project milestones, and review dates with team calendars.',
    icon: 'gcal',
    connected: false,
  },
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'Issue Tracking',
    description: 'Bi-directional issue sync with Atlassian Jira epics and story points.',
    icon: 'jira',
    connected: false,
  },
  {
    id: 'webhooks',
    name: 'Outgoing Webhooks',
    category: 'Developer API',
    description: 'Trigger custom HTTP POST webhooks when projects or tasks transition status.',
    icon: 'webhooks',
    connected: true,
    meta: '2 active endpoints configured',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write to localStorage for key: ${key}`, error);
  }
}

export const settingsStorage = {
  getNotifications(): NotificationSettingsState {
    const stored = readStorage<Partial<NotificationSettingsState>>(
      STORAGE_KEYS.NOTIFICATIONS,
      DEFAULT_NOTIFICATIONS
    );
    return { ...DEFAULT_NOTIFICATIONS, ...stored };
  },
  saveNotifications(settings: NotificationSettingsState): void {
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, settings);
  },

  getProfile(): UserProfileSettings {
    const stored = readStorage<Partial<UserProfileSettings>>(
      STORAGE_KEYS.PROFILE,
      DEFAULT_PROFILE
    );
    return { ...DEFAULT_PROFILE, ...stored };
  },
  saveProfile(profile: UserProfileSettings): void {
    writeStorage(STORAGE_KEYS.PROFILE, profile);
  },

  getWorkspace(): WorkspaceSettings {
    const stored = readStorage<Partial<WorkspaceSettings>>(
      STORAGE_KEYS.WORKSPACE,
      DEFAULT_WORKSPACE
    );
    return { ...DEFAULT_WORKSPACE, ...stored };
  },
  saveWorkspace(workspace: WorkspaceSettings): void {
    writeStorage(STORAGE_KEYS.WORKSPACE, workspace);
  },

  getAppearance(): AppearanceSettings {
    const stored = readStorage<any>(
      STORAGE_KEYS.APPEARANCE,
      DEFAULT_APPEARANCE
    );
    return {
      ...DEFAULT_APPEARANCE,
      ...stored,
      brandColor: stored?.brandColor || stored?.accentColor || DEFAULT_APPEARANCE.brandColor,
      companyLogo: stored?.companyLogo !== undefined ? stored.companyLogo : DEFAULT_APPEARANCE.companyLogo,
      theme: stored?.theme || DEFAULT_APPEARANCE.theme,
      transparentSidebar:
        typeof stored?.transparentSidebar === 'boolean'
          ? stored.transparentSidebar
          : DEFAULT_APPEARANCE.transparentSidebar,
      sidebarFeature: stored?.sidebarFeature || DEFAULT_APPEARANCE.sidebarFeature,
      tablesView: stored?.tablesView || DEFAULT_APPEARANCE.tablesView,
    };
  },
  saveAppearance(appearance: AppearanceSettings): void {
    writeStorage(STORAGE_KEYS.APPEARANCE, appearance);
  },

  getSecurity(): SecuritySettings {
    const stored = readStorage<Partial<SecuritySettings>>(
      STORAGE_KEYS.SECURITY,
      DEFAULT_SECURITY
    );
    return { ...DEFAULT_SECURITY, ...stored };
  },
  saveSecurity(security: SecuritySettings): void {
    writeStorage(STORAGE_KEYS.SECURITY, security);
  },

  getIntegrations(): IntegrationService[] {
    return readStorage<IntegrationService[]>(
      STORAGE_KEYS.INTEGRATIONS,
      DEFAULT_INTEGRATIONS
    );
  },
  saveIntegrations(integrations: IntegrationService[]): void {
    writeStorage(STORAGE_KEYS.INTEGRATIONS, integrations);
  },
};
