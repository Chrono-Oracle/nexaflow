'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useProjectsQuery,
  useTasksQuery,
  useTeamsQuery,
  useActivitiesQuery,
} from '@/hooks/useDashboardData';
import {
  WorkCompletedMetrics,
  HoursLoggedMetrics,
  ProjectSummaryMetrics,
  DetailedActivityItem,
  TimeframeFilter,
  ProjectFilter,
} from '../types/analytics.types';

// Pre-seeded rich activity log items matching the uploaded UI
const SEEDED_ACTIVITIES: DetailedActivityItem[] = [
  {
    id: 'act-mention-1',
    type: 'mention',
    category: 'chats',
    actor: {
      name: 'Esther Howard',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Product Designer',
    },
    timestamp: '9:20 AM',
    timeAgo: '2m ago',
    channel: '#Design',
    mention: {
      targetUser: '@you',
      channel: '#Design',
      message:
        'Ran into an issue with the dashboard loading state - it keeps glitching when switching between tabs. I recorded a quick voice note to tell what I mean @ikjoshua',
      replyCount: 5,
      replyAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      ],
    },
  },
  {
    id: 'act-access-2',
    type: 'access_request',
    category: 'more',
    actor: {
      name: 'Kamron',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Frontend Engineer',
    },
    timestamp: '10:49 AM',
    timeAgo: '1h ago',
    channel: 'Product_Dev',
    accessRequest: {
      channel: 'Product_Dev',
      isPrivate: true,
      status: 'pending',
    },
  },
  {
    id: 'act-event-3',
    type: 'calendar_event',
    category: 'more',
    actor: {
      name: 'System Calendar',
      avatar: '/Avatar.jpg',
    },
    timestamp: '12:29 PM',
    timeAgo: '3h ago',
    calendarEvent: {
      eventCount: 4,
      month: 'OCT',
      day: '19',
      title: 'Weekly Team Sync',
      timeRange: '11:00 AM - 10:50 AM',
      attendees: [
        {
          name: 'Tariq Al-Mansoor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        {
          name: 'Fatima Zahra',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        },
        {
          name: 'Ethan Wright',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        },
      ],
      additionalAttendeeCount: 2,
    },
  },
  {
    id: 'act-upload-4',
    type: 'file_upload',
    category: 'uploads',
    actor: {
      name: 'Arthur Taylor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'Growth Strategist',
    },
    timestamp: '1:24 PM',
    timeAgo: '4h ago',
    channel: 'Marketing',
    fileUpload: {
      fileName: 'file_documents.csv',
      fileSize: '4.2 MB',
      channel: 'Marketing',
      isPrivate: true,
      fileUrl: '#',
    },
  },
  {
    id: 'act-comment-5',
    type: 'project_comment',
    category: 'chats',
    actor: {
      name: 'Theresa Jacobs',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'QA Specialist',
    },
    timestamp: '3:42 PM',
    timeAgo: '6h ago',
    project: {
      name: 'Design Review',
    },
    projectComment: {
      projectName: 'Design Review',
      commentCount: 2,
      comments: [
        {
          id: 'c-1',
          author: 'Theresa Jacobs',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          content:
            "Got it, thanks for the clip. Looks like the animation loop isn't resetting properly. I'll check the component logic. I created a new task here:",
          linkedTaskTitle: 'Dashboard loading state',
          timestamp: '3:42 PM',
        },
        {
          id: 'c-2',
          author: 'Daniel Kim',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          content: 'Confirmed, pushed a repro branch with hotfix patch for the navbar transition.',
          timestamp: '3:48 PM',
        },
      ],
    },
  },
];

export function useAnalyticsData() {
  const { data: projects = [] } = useProjectsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: teams = [] } = useTeamsQuery();
  const { data: rawActivities = [] } = useActivitiesQuery();

  // Filter selections
  const [workTimeframe, setWorkTimeframe] = useState<TimeframeFilter>('today');
  const [hoursFilter, setHoursFilter] = useState<'projects' | 'tasks' | 'team'>('projects');
  const [projectSummaryFilter, setProjectSummaryFilter] = useState<ProjectFilter>('all');
  const [activityAccessState, setActivityAccessState] = useState<Record<string, 'pending' | 'approved' | 'denied'>>({
    'act-access-2': 'pending',
  });

  // 1. Work Completed Metrics (Histogram Bar Chart)
  const workCompletedMetrics: WorkCompletedMetrics = useMemo(() => {
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
    
    // Baseline rate: if tasks exist calculate percentage, otherwise match uploaded screenshot 92%
    const rate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 92;
    const projectCount = projects.length > 0 ? projects.length : 30;

    // Generate 26 histogram bars matching the uploaded graphic rhythm:
    // First segment purple, middle segment amber/gold, third segment light neutral
    const bars = [
      { id: 'b1', label: '09:00', value: 85, color: 'purple' as const, tooltip: 'Sprint A: 85% tasks done' },
      { id: 'b2', label: '09:30', value: 35, color: 'purple' as const, tooltip: 'Sprint A: 35% tasks done' },
      { id: 'b3', label: '10:00', value: 92, color: 'purple' as const, tooltip: 'Sprint A: 92% tasks done' },
      { id: 'b4', label: '10:30', value: 70, color: 'purple' as const, tooltip: 'Sprint A: 70% tasks done' },
      { id: 'b5', label: '11:00', value: 95, color: 'purple' as const, tooltip: 'Sprint A: 95% tasks done' },
      { id: 'b6', label: '11:30', value: 80, color: 'purple' as const, tooltip: 'Sprint A: 80% tasks done' },
      { id: 'b7', label: '12:00', value: 45, color: 'purple' as const, tooltip: 'Sprint A: 45% tasks done' },
      { id: 'b8', label: '12:30', value: 88, color: 'purple' as const, tooltip: 'Sprint A: 88% tasks done' },
      { id: 'b9', label: '13:00', value: 90, color: 'purple' as const, tooltip: 'Sprint A: 90% tasks done' },
      { id: 'b10', label: '13:30', value: 30, color: 'purple' as const, tooltip: 'Sprint A: 30% tasks done' },
      // Amber segment
      { id: 'b11', label: '14:00', value: 65, color: 'amber' as const, tooltip: 'Sprint B: 65% in progress' },
      { id: 'b12', label: '14:30', value: 40, color: 'amber' as const, tooltip: 'Sprint B: 40% in progress' },
      { id: 'b13', label: '15:00', value: 75, color: 'amber' as const, tooltip: 'Sprint B: 75% in progress' },
      { id: 'b14', label: '15:30', value: 85, color: 'amber' as const, tooltip: 'Sprint B: 85% in progress' },
      { id: 'b15', label: '16:00', value: 90, color: 'amber' as const, tooltip: 'Sprint B: 90% in progress' },
      { id: 'b16', label: '16:30', value: 78, color: 'amber' as const, tooltip: 'Sprint B: 78% in progress' },
      { id: 'b17', label: '17:00', value: 35, color: 'amber' as const, tooltip: 'Sprint B: 35% in progress' },
      // Neutral segment
      { id: 'b18', label: '17:30', value: 60, color: 'neutral' as const, tooltip: 'Queue: 60% scheduled' },
      { id: 'b19', label: '18:00', value: 45, color: 'neutral' as const, tooltip: 'Queue: 45% scheduled' },
      { id: 'b20', label: '18:30', value: 50, color: 'neutral' as const, tooltip: 'Queue: 50% scheduled' },
      { id: 'b21', label: '19:00', value: 72, color: 'neutral' as const, tooltip: 'Queue: 72% scheduled' },
      { id: 'b22', label: '19:30', value: 30, color: 'neutral' as const, tooltip: 'Queue: 30% scheduled' },
      { id: 'b23', label: '20:00', value: 55, color: 'neutral' as const, tooltip: 'Queue: 55% scheduled' },
      { id: 'b24', label: '20:30', value: 40, color: 'neutral' as const, tooltip: 'Queue: 40% scheduled' },
    ];

    return {
      rate,
      completedCount: completedTasksCount,
      totalCount: totalTasksCount,
      comparisonText: `The proportion of the ${projectCount} existing projects.`,
      histogramBars: bars,
    };
  }, [tasks, projects]);

  // 2. Hours Logged Metrics (Smooth Wave Chart)
  const hoursLoggedMetrics: HoursLoggedMetrics = useMemo(() => {
    // Dynamically calculate from tasks if completed / in-progress exist
    let totalMinutes = 51 * 60 + 18; // Default 51h 18m
    if (tasks.length > 0) {
      const completedWeight = tasks.filter((t) => t.status === 'Completed').length * 4.5;
      const inProgressWeight = tasks.filter((t) => t.status === 'In Progress').length * 2.8;
      const subtaskWeight = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0) * 0.75, 0);
      const computed = completedWeight + inProgressWeight + subtaskWeight;
      if (computed > 0) {
        totalMinutes = Math.round(computed * 60);
      }
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Hourly billing valuation ($140/hr standard rate)
    const monetaryValue = Math.round(hours * 141.6 + (minutes / 60) * 141.6);

    const wavePoints = [
      { x: 0, y: 75, label: 'Mon', hours: 6.2 },
      { x: 40, y: 32, label: 'Tue', hours: 9.5 },
      { x: 80, y: 25, label: 'Wed', hours: 10.4 },
      { x: 130, y: 55, label: 'Thu', hours: 7.1 },
      { x: 180, y: 62, label: 'Fri', hours: 6.8 },
      { x: 230, y: 48, label: 'Sat', hours: 8.2 },
      { x: 280, y: 20, label: 'Sun', hours: 11.0 },
    ];

    return {
      hours,
      minutes,
      monetaryValue: monetaryValue > 0 ? monetaryValue : 7279.0,
      trendPercentage: 18,
      comparisonText: "it's paid 18% higher than the previous project.",
      wavePoints,
    };
  }, [tasks]);

  // 3. Project Summary Metrics (180° Radial Gauge)
  const projectSummaryMetrics: ProjectSummaryMetrics = useMemo(() => {
    const total = projects.length > 0 ? projects.length : 8;
    const completed = projects.filter((p) => p.status === 'Completed').length;
    const inProgress = projects.filter((p) => p.status === 'In Progress').length;
    const early = total - completed - inProgress;

    // Average project completion rate
    const averageCompletionRate =
      total > 0
        ? Math.round(
            projects.reduce((acc, p) => acc + (p.progress || 55), 0) / total
          )
        : 55;

    // Create 24 tick segments across 180 degrees (-90 to +90 degrees)
    const totalTicks = 24;
    const completedTicks = Math.round((totalTicks * 4) / 24); // ~4 purple
    const inProgressTicks = Math.round((totalTicks * 12) / 24); // ~12 mint/teal
    // remaining ~8 amber

    const ticks = Array.from({ length: totalTicks }, (_, index) => {
      let status: 'completed' | 'in-progress' | 'early' = 'early';
      if (index < completedTicks) {
        status = 'completed';
      } else if (index < completedTicks + inProgressTicks) {
        status = 'in-progress';
      }

      // Angle from 180deg (left) to 0deg (right)
      const angle = 180 - (index / (totalTicks - 1)) * 180;
      return {
        id: index,
        angle,
        status,
      };
    });

    return {
      averageCompletionRate,
      completedRatio: 100,
      inProgressRatio: 50,
      earlyRatio: 50,
      totalProjects: total,
      gaugeTicks: ticks,
    };
  }, [projects]);

  // 4. Combined Activity Feed (Seeded Items + Live Storage Events)
  const detailedActivities: DetailedActivityItem[] = useMemo(() => {
    // Map live dashboard activities into DetailedActivityItem
    const liveActivities: DetailedActivityItem[] = rawActivities.slice(0, 10).map((act) => ({
      id: act.id,
      type: 'task_status_change' as const,
      category: 'status' as const,
      actor: {
        name: act.actorName || 'Team Member',
        avatar: act.actorAvatar || '/Avatar.jpg',
      },
      timestamp: act.timestamp || 'Just now',
      timeAgo: act.timestamp || 'Just now',
      standardActivity: {
        title: act.title,
        description: act.description,
      },
    }));

    // Merge live activities with the seeded rich items
    const merged = [...SEEDED_ACTIVITIES, ...liveActivities];

    // Apply Access Request override state
    return merged.map((item) => {
      if (item.type === 'access_request' && item.accessRequest) {
        const currentStatus = activityAccessState[item.id] || item.accessRequest.status;
        return {
          ...item,
          accessRequest: {
            ...item.accessRequest,
            status: currentStatus,
          },
        };
      }
      return item;
    });
  }, [rawActivities, activityAccessState]);

  // Handlers for interactive actions
  const handleApproveAccess = (activityId: string, channelName: string) => {
    setActivityAccessState((prev) => ({
      ...prev,
      [activityId]: 'approved',
    }));
    toast.success(`Approved access to #${channelName}`);
  };

  const handleDenyAccess = (activityId: string, channelName: string) => {
    setActivityAccessState((prev) => ({
      ...prev,
      [activityId]: 'denied',
    }));
    toast.info(`Denied request for #${channelName}`);
  };

  return {
    // Metrics
    workCompletedMetrics,
    hoursLoggedMetrics,
    projectSummaryMetrics,
    detailedActivities,
    // Filters & States
    workTimeframe,
    setWorkTimeframe,
    hoursFilter,
    setHoursFilter,
    projectSummaryFilter,
    setProjectSummaryFilter,
    // Operations
    projects,
    tasks,
    teams,
    handleApproveAccess,
    handleDenyAccess,
  };
}
