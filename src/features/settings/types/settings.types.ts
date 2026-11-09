export type SettingsTabId =
  | 'profile'
  | 'appearance'
  | 'team-roles'
  | 'security';

export interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  badge?: string | number;
}

export type NotificationChannel = 'push' | 'email' | 'sms';

export interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationSettingsState {
  comments: { push: boolean; email: boolean; sms: boolean };
  tags: { push: boolean; email: boolean; sms: boolean };
  reminders: { push: boolean; email: boolean; sms: boolean };
  activity: { push: boolean; email: boolean; sms: boolean };
  workload: { push: boolean; email: boolean; sms: boolean };
  digest: { push: boolean; email: boolean; sms: boolean };
}

export interface UserProfileSettings {
  fullName: string;
  nickname: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  bio: string;
  avatar: string;
}

export interface WorkspaceSettings {
  name: string;
  slug: string;
  timezone: string;
  schedule: string;
  defaultPriority: 'Urgent' | 'High' | 'Medium' | 'Low';
  defaultView: 'kanban' | 'table' | 'list';
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type TablesViewMode = 'default' | 'compact';
export type SidebarFeatureType = 'recent-changes' | 'shortcuts' | 'overdue' | 'none';

export interface AppearanceSettings {
  companyLogo: string | null;
  brandColor: string;
  theme: ThemeMode;
  transparentSidebar: boolean;
  sidebarFeature: SidebarFeatureType;
  tablesView: TablesViewMode;
  density?: 'comfortable' | 'compact';
  reducedMotion?: boolean;
  accentColor?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  requireManagerReview: boolean;
  publicRoadmaps: boolean;
  sessionTimeoutHours: number;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  connected: boolean;
  meta?: string;
}
