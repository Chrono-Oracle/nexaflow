import { Project } from '@/features/projects/types/project.types';
import { Task } from '@/features/tasks/types/task.types';
import { Team } from '@/features/team/types/team.types';

export type TimeframeFilter = 'today' | 'week' | 'month' | 'all';
export type ProjectFilter = 'all' | 'active' | 'completed';
export type ActivityTabFilter = 'all' | 'chats' | 'status' | 'uploads' | 'more';

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

export interface HoursLoggedMetrics {
  hours: number;
  minutes: number;
  monetaryValue: number; // e.g. 7279.00
  trendPercentage: number; // e.g. 18
  comparisonText: string;
  wavePoints: { x: number; y: number; label: string; hours: number }[];
}

export interface ProjectSummaryMetrics {
  averageCompletionRate: number; // e.g. 55%
  completedRatio: number; // 100%
  inProgressRatio: number; // >50%
  earlyRatio: number; // <50%
  totalProjects: number;
  gaugeTicks: {
    id: number;
    angle: number;
    status: 'completed' | 'in-progress' | 'early';
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
