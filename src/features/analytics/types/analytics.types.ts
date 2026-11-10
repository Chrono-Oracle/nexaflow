export type TimeframeFilter = 'today' | 'week' | 'month' | 'all';
export type ProjectFilter = 'all' | 'active' | 'completed';
export type ActivityTabFilter = 'all' | 'chats' | 'status' | 'uploads' | 'more';
export type DurationFilter = 'projects' | 'tasks' | 'all';

export interface WorkCompletedMetrics {
  rate: number; // e.g. 92%
  completedCount: number;
  totalCount: number;
  comparisonText: string;
  histogramBars: {
    id: string;
    label: string;
    value: number; // 0 - 100
    color: 'purple' | 'amber' | 'neutral';
    tooltip: string;
  }[];
}

export interface ActiveDurationMetrics {
  days: number;
  hours: number;
  minutes: number;
  statusBadge: {
    label: string;
    variant: 'active' | 'completed' | 'idle';
  };
  targetName: string;
  comparisonText: string;
  wavePoints: {
    x: number;
    y: number;
    label: string;
    hours: number;
    tooltip: string;
  }[];
  svgPath: string;
  svgArea: string;
  endpointMarker: { x: number; y: number };
  monetaryValue?: number;
  trendPercentage?: number;
}

export type HoursLoggedMetrics = ActiveDurationMetrics;

export interface ProjectSummaryMetrics {
  averageCompletionRate: number; // e.g. 55%
  completedCount: number; // Projects at 100%
  inProgressCount: number; // Projects > 50%
  earlyCount: number; // Projects < 50%
  completedRatio: number; // percentage
  inProgressRatio: number; // percentage
  earlyRatio: number; // percentage
  totalProjects: number;
  gaugeTicks: {
    id: number;
    angle: number;
    status: 'completed' | 'in-progress' | 'early' | 'empty';
    tooltip?: string;
  }[];
}

export type DetailedActivityType =
  | 'mention'
  | 'access_request'
  | 'calendar_event'
  | 'file_upload'
  | 'project_comment'
  | 'task_status_change'
  | 'project_milestone';

export interface DetailedActivityItem {
  id: string;
  type: DetailedActivityType;
  actor: {
    name: string;
    avatar: string;
    role?: string;
  };
  timestamp: string;
  timeAgo: string;
  category: 'chats' | 'status' | 'uploads' | 'more';
  channel?: string;
  project?: {
    id?: string;
    name: string;
  };
  // Mention payload
  mention?: {
    targetUser: string;
    channel: string;
    message: string;
    replyCount?: number;
    replyAvatars?: string[];
  };
  // Access request payload
  accessRequest?: {
    channel: string;
    isPrivate: boolean;
    status: 'pending' | 'approved' | 'denied';
  };
  // Calendar event payload
  calendarEvent?: {
    eventCount: number;
    month: string;
    day: string;
    title: string;
    timeRange: string;
    attendees: { name: string; avatar: string }[];
    additionalAttendeeCount: number;
  };
  // File upload payload
  fileUpload?: {
    fileName: string;
    fileSize?: string;
    channel: string;
    isPrivate?: boolean;
    fileUrl?: string;
  };
  // Project comment payload
  projectComment?: {
    projectName: string;
    commentCount: number;
    comments: {
      id: string;
      author: string;
      avatar: string;
      content: string;
      linkedTaskTitle?: string;
      timestamp: string;
    }[];
  };
  // Standard dashboard operation payload
  standardActivity?: {
    title: string;
    description: string;
  };
}
