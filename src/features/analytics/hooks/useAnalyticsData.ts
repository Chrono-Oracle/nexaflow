'use client';

import { useMemo, useState, useEffect } from 'react';
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
  DurationFilter,
} from '../types/analytics.types';

// Helper to generate smooth Catmull-Rom cubic bezier SVG wave path from data points
function computeWavePath(points: { val: number }[], width = 340, height = 90, padY = 14) {
  if (!points || points.length === 0) {
    return {
      path: `M 0,${height - padY} L ${width},${height - padY}`,
      area: `M 0,${height - padY} L ${width},${height - padY} L ${width},${height} L 0,${height} Z`,
      lastPoint: { x: width, y: height - padY },
    };
  }

  const n = points.length;
  const coords = points.map((p, i) => {
    const x = Number(((i / (n - 1)) * width).toFixed(1));
    const normalizedVal = Math.min(100, Math.max(0, p.val));
    const y = Number((height - padY - (normalizedVal / 100) * (height - 2 * padY)).toFixed(1));
    return { x, y };
  });

  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < n ? i + 2 : i + 1];

    const cp1x = Number((p1.x + (p2.x - p0.x) / 6).toFixed(1));
    const cp1y = Number((p1.y + (p2.y - p0.y) / 6).toFixed(1));
    const cp2x = Number((p2.x - (p3.x - p1.x) / 6).toFixed(1));
    const cp2y = Number((p2.y - (p3.y - p1.y) / 6).toFixed(1));

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const area = `${path} L ${width},${height} L 0,${height} Z`;
  return { path, area, lastPoint: coords[coords.length - 1] };
}

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

/**
 * Safely extracts the exact creation timestamp (in milliseconds) for an item (project or task).
 * Prioritizes:
 * 1. Full ISO timestamp in createdAt (e.g. "2026-11-10T13:45:12.345Z")
 * 2. Embedded creation millisecond in item.id (e.g. "proj_1794320140145_abc")
 * 3. Initial activity timestamp inside activities
 * 4. Fallback to parsing createdAt or startDate
 */
export function getExactItemTimestamp(item?: {
  id?: string;
  createdAt?: string;
  startDate?: string;
  activities?: Array<{ timestamp?: string; id?: string }>;
}): number {
  if (!item) return 0;

  // 1. Full ISO string with 'T' (explicit exact creation timestamp)
  if (item.createdAt && item.createdAt.includes('T')) {
    const ms = new Date(item.createdAt).getTime();
    if (!isNaN(ms) && ms > 0) return ms;
  }

  // 2. Embedded millisecond timestamp in ID (e.g. proj_1794320140145_... / task_...)
  if (item.id) {
    const match = item.id.match(/(?:proj|task|act)_(\d{11,14})/);
    if (match) {
      const ms = parseInt(match[1], 10);
      if (!isNaN(ms) && ms > 1600000000000) {
        return ms;
      }
    }
  }

  // 3. Embedded timestamp in activities
  if (item.activities && item.activities.length > 0) {
    for (const act of item.activities) {
      if (act.timestamp && act.timestamp.includes('T')) {
        const ms = new Date(act.timestamp).getTime();
        if (!isNaN(ms) && ms > 0) return ms;
      }
      if (act.id) {
        const actMatch = act.id.match(/act_(\d{11,14})/);
        if (actMatch) {
          const ms = parseInt(actMatch[1], 10);
          if (!isNaN(ms) && ms > 1600000000000) return ms;
        }
      }
    }
  }

  // 4. Fallback to createdAt string
  if (item.createdAt) {
    const ms = new Date(item.createdAt).getTime();
    if (!isNaN(ms) && ms > 0) return ms;
  }

  // 5. Fallback to startDate string
  if (item.startDate) {
    const ms = new Date(item.startDate).getTime();
    if (!isNaN(ms) && ms > 0) return ms;
  }

  return 0;
}

export function useAnalyticsData() {
  const { data: projects = [] } = useProjectsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: teams = [] } = useTeamsQuery();
  const { data: rawActivities = [] } = useActivitiesQuery();

  // Filter selections
  const [workTimeframe, setWorkTimeframe] = useState<TimeframeFilter>('today');
  const [hoursFilter, setHoursFilter] = useState<DurationFilter>('projects');
  const [projectSummaryFilter, setProjectSummaryFilter] = useState<ProjectFilter>('all');
  const [activityAccessState, setActivityAccessState] = useState<Record<string, 'pending' | 'approved' | 'denied'>>({
    'act-access-2': 'pending',
  });

  // Real-time ticking state to keep the active duration counter strictly live and synchronized
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000); // Ticks every 15 seconds
    return () => clearInterval(timer);
  }, []);

  // Active Project IDs to ensure deleted projects and their leftover tasks are never counted
  const validProjectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects]);

  // Tasks belonging strictly to active projects or general standalone tasks
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.projectId || t.projectId === 'proj-general') return true;
      return validProjectIds.has(t.projectId);
    });
  }, [tasks, validProjectIds]);

  // 1. Work Completed Metrics (Strictly Active Projects & Associated Deliverables)
  const workCompletedMetrics: WorkCompletedMetrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime(); // Monday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const isTaskInPeriod = (t: typeof activeTasks[0]) => {
      if (workTimeframe === 'all') return true;
      const dateStr = t.createdAt || t.startDate;
      if (!dateStr) return true;
      const tMs = new Date(dateStr).getTime();
      if (isNaN(tMs)) return true;
      if (workTimeframe === 'today') return tMs >= startOfToday;
      if (workTimeframe === 'week') return tMs >= startOfWeek;
      if (workTimeframe === 'month') return tMs >= startOfMonth;
      return true;
    };

    const periodTasks = activeTasks.filter(isTaskInPeriod);
    const totalTasksCount = periodTasks.length;
    const completedTasksCount = periodTasks.filter((t) => t.status === 'Completed').length;
    const totalProjects = projects.length;

    let rate = 0;
    let comparisonText = '';

    if (totalTasksCount > 0) {
      rate = Math.round((completedTasksCount / totalTasksCount) * 100);
      comparisonText = `${completedTasksCount} of ${totalTasksCount} tasks completed across ${totalProjects} ${totalProjects === 1 ? 'project' : 'projects'}.`;
    } else if (totalProjects > 0) {
      const completedProjects = projects.filter((p) => p.status === 'Completed').length;
      rate = Math.round(projects.reduce((acc, p) => acc + (p.progress ?? 0), 0) / totalProjects);
      comparisonText = `${completedProjects} of ${totalProjects} projects completed (${totalProjects - completedProjects} active).`;
    } else {
      rate = 0;
      comparisonText = 'No active projects or tasks logged yet for this period.';
    }

    // Dynamic Histogram Bars (Strictly current, active projects - zero deleted projects/leftover tasks)
    let bars: {
      id: string;
      label: string;
      value: number;
      color: 'purple' | 'amber' | 'neutral';
      tooltip: string;
    }[] = [];

    if (totalProjects === 0 && activeTasks.length === 0) {
      bars = Array.from({ length: 8 }, (_, i) => ({
        id: `empty-${i}`,
        label: '--',
        value: 6,
        color: 'neutral' as const,
        tooltip: 'No active projects',
      }));
    } else if (workTimeframe === 'week') {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      bars = dayNames.map((name, i) => {
        const d = new Date(startOfWeek + i * 24 * 3600 * 1000);
        const dStr = d.toISOString().split('T')[0];
        const dayTasks = activeTasks.filter((t) => {
          const tDate = t.createdAt?.split('T')[0] || t.startDate;
          return tDate === dStr;
        });
        const dayCompleted = dayTasks.filter((t) => t.status === 'Completed').length;
        const dayRate = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;
        const color: 'purple' | 'amber' | 'neutral' =
          dayCompleted > 0 ? 'purple' : dayTasks.length > 0 ? 'amber' : 'neutral';
        return {
          id: `day-${name}-${i}`,
          label: name,
          value: Math.max(6, dayRate),
          color,
          tooltip: dayTasks.length > 0 ? `${name}: ${dayCompleted}/${dayTasks.length} tasks completed (${dayRate}%)` : `${name}: No tasks scheduled`,
        };
      });
    } else if (totalProjects > 0) {
      // Each bar strictly maps 1:1 to an ACTIVE existing project
      bars = projects.map((p, idx) => {
        const pTasks = activeTasks.filter((t) => t.projectId === p.id);
        const pCompleted = pTasks.filter((t) => t.status === 'Completed').length;
        const progress = p.progress ?? (pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : (p.status === 'Completed' ? 100 : 0));
        const color: 'purple' | 'amber' | 'neutral' =
          progress >= 100 ? 'purple' : progress > 0 ? 'amber' : 'neutral';
        return {
          id: p.id || `proj-${idx}`,
          label: p.name.length > 10 ? p.name.slice(0, 8) + '…' : p.name,
          value: Math.max(8, progress),
          color,
          tooltip: `${p.name}: ${progress}% completed (${pCompleted}/${pTasks.length || p.taskCount || 0} tasks)`,
        };
      });
    } else {
      // If only standalone general tasks exist without projects
      bars = activeTasks.slice(0, 8).map((t, i) => {
        const tProgress = t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 65 : 25;
        const tColor: 'purple' | 'amber' | 'neutral' =
          t.status === 'Completed' ? 'purple' : t.status === 'In Progress' ? 'amber' : 'neutral';
        return {
          id: `task-${t.id || i}`,
          label: t.title.slice(0, 8),
          value: Math.max(8, tProgress),
          color: tColor,
          tooltip: `Task: "${t.title}" (${t.status})`,
        };
      });
    }

    return {
      rate,
      completedCount: completedTasksCount,
      totalCount: totalTasksCount,
      comparisonText,
      histogramBars: bars,
    };
  }, [activeTasks, projects, workTimeframe]);

  // 2. Active Duration & Running Uptime Metrics (Exact Creation Elapsed Time)
  const hoursLoggedMetrics: HoursLoggedMetrics = useMemo(() => {
    const now = new Date(currentTime);
    let startMs = 0;
    let targetName = '';
    let statusLabel = 'Idle';
    let statusVariant: 'active' | 'completed' | 'idle' = 'idle';
    let comparisonText = '';

    if (hoursFilter === 'projects') {
      // Sort projects by exact creation timestamp descending so the truly newest project is first
      const sortedProjects = [...projects].sort(
        (a, b) => getExactItemTimestamp(b) - getExactItemTimestamp(a)
      );

      // Pick latest active project (prefer 'In Progress', fallback to latest created)
      const inProgressProj = sortedProjects.find((p) => p.status === 'In Progress');
      const latestProj = inProgressProj || sortedProjects[0];

      if (latestProj) {
        startMs = getExactItemTimestamp(latestProj);
        targetName = latestProj.name;
        statusLabel = latestProj.status;
        statusVariant = latestProj.status === 'Completed' ? 'completed' : 'active';

        const createdDate = startMs > 0 ? new Date(startMs) : null;
        const isToday = createdDate && createdDate.toDateString() === now.toDateString();
        const formattedDate = createdDate
          ? isToday
            ? `Today at ${createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
            : createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'recently';
        comparisonText = `Latest project: "${latestProj.name}" • Created ${formattedDate} • ${latestProj.taskCount ?? 0} tasks`;
      } else {
        comparisonText = 'No active projects currently in progress.';
      }
    } else if (hoursFilter === 'tasks') {
      // Sort active tasks by exact creation timestamp descending
      const sortedTasks = [...activeTasks].sort(
        (a, b) => getExactItemTimestamp(b) - getExactItemTimestamp(a)
      );

      // Pick latest active task (prefer 'In Progress', fallback to latest created)
      const inProgressTask = sortedTasks.find((t) => t.status === 'In Progress');
      const latestTask = inProgressTask || sortedTasks[0];

      if (latestTask) {
        startMs = getExactItemTimestamp(latestTask);
        targetName = latestTask.title;
        statusLabel = latestTask.status;
        statusVariant = latestTask.status === 'Completed' ? 'completed' : 'active';
        const parentProj = projects.find((p) => p.id === latestTask.projectId);
        const createdDate = startMs > 0 ? new Date(startMs) : null;
        const isToday = createdDate && createdDate.toDateString() === now.toDateString();
        const formattedDate = createdDate
          ? isToday
            ? `Today at ${createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
            : createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'recently';
        comparisonText = `Latest task: "${latestTask.title}" • Created ${formattedDate} • ${latestTask.priority} Priority • ${parentProj ? parentProj.name : 'General'}`;
      } else {
        comparisonText = 'No active tasks currently in progress.';
      }
    } else {
      // 'all'
      const activeProjects = projects.filter((p) => p.status === 'In Progress');
      const activeTasksInProgress = activeTasks.filter((t) => t.status === 'In Progress');

      const allActiveTimestamps = [
        ...activeProjects.map((p) => getExactItemTimestamp(p)),
        ...activeTasksInProgress.map((t) => getExactItemTimestamp(t)),
      ].filter((ms) => ms > 0);

      if (allActiveTimestamps.length > 0) {
        allActiveTimestamps.sort((a, b) => a - b);
        startMs = allActiveTimestamps[0]; // Earliest active item
        targetName = 'Operations Workspace';
        statusLabel = 'Active';
        statusVariant = 'active';
        comparisonText = `Tracking ${activeProjects.length} active projects & ${activeTasksInProgress.length} operational tasks`;
      } else {
        comparisonText = 'No active projects or tasks currently in progress.';
      }
    }

    // Compute elapsed duration strictly from exact creation timestamp
    let days = 0;
    let hours = 0;
    let minutes = 0;

    if (startMs > 0) {
      // Guard against future timestamps due to minor clock jitter
      const effectiveStartMs = Math.min(startMs, now.getTime());
      const elapsedMs = Math.max(0, now.getTime() - effectiveStartMs);
      days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      hours = Math.floor((elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    }

    // Compute real 7-day wave curve data points
    const wavePoints: { x: number; y: number; label: string; hours: number; tooltip: string; val: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const isToday = i === 0;
      const dayEnd = isToday ? now.getTime() : dayStart + 24 * 3600 * 1000;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      let runningHours = 0;
      if (startMs > 0 && startMs < dayEnd) {
        const activeStart = Math.max(startMs, dayStart);
        const activeMs = Math.max(0, dayEnd - activeStart);
        runningHours = Math.min(24, Math.round((activeMs / (3600 * 1000)) * 10) / 10);
      }

      const val = runningHours > 0 ? Math.min(95, Math.max(15, Math.round((runningHours / 24) * 80) + 12)) : 0;
      wavePoints.push({
        x: 0,
        y: 0,
        label: dayLabel,
        hours: runningHours,
        val,
        tooltip: `${dayLabel}: ${runningHours > 0 ? `${runningHours.toFixed(1)}h active` : '0h (Idle)'}`,
      });
    }

    const { path, area, lastPoint } = computeWavePath(wavePoints, 340, 90, 14);

    return {
      days,
      hours,
      minutes,
      statusBadge: {
        label: statusLabel,
        variant: statusVariant,
      },
      targetName,
      comparisonText,
      wavePoints,
      svgPath: path,
      svgArea: area,
      endpointMarker: lastPoint,
    };
  }, [projects, activeTasks, hoursFilter, currentTime]);

  // 3. Project Summary Metrics (Radial Speedometer Gauge with Task-Weighted Health Tiers)
  const projectSummaryMetrics: ProjectSummaryMetrics = useMemo(() => {
    // Filter projects based on the active dropdown filter ('all' | 'active' | 'completed')
    let filteredProjects = projects;
    if (projectSummaryFilter === 'active') {
      filteredProjects = projects.filter((p) => p.status !== 'Completed');
    } else if (projectSummaryFilter === 'completed') {
      filteredProjects = projects.filter((p) => p.status === 'Completed' || (p.progress ?? 0) >= 100);
    }

    const total = filteredProjects.length;

    let totalPcr = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let earlyCount = 0;

    // Calculate individual project completion rates (PCR) using task-weighting & deliverable milestones
    filteredProjects.forEach((p) => {
      const pTasks = activeTasks.filter((t) => t.projectId === p.id);
      let pcr = 0;

      if (pTasks.length > 0) {
        const taskScores = pTasks.map((t) => {
          if (t.subtasks && t.subtasks.length > 0) {
            const done = t.subtasks.filter((s) => s.completed).length;
            return done / t.subtasks.length;
          }
          if (t.status === 'Completed') return 1;
          if (t.status === 'Approved') return 0.9;
          if (t.status === 'In Review') return 0.75;
          if (t.status === 'In Progress') return 0.5;
          return 0; // 'To Do'
        });
        pcr = Math.round((taskScores.reduce((a, b) => a + b, 0) / pTasks.length) * 100);
      } else if (p.subtasks && p.subtasks.length > 0) {
        const done = p.subtasks.filter((s) => s.completed).length;
        pcr = Math.round((done / p.subtasks.length) * 100);
      } else if (p.status === 'Completed') {
        pcr = 100;
      } else {
        pcr = p.progress ?? 0;
      }

      totalPcr += pcr;

      // Classify into the three visual legend tiers
      if (pcr >= 100) {
        completedCount++;
      } else if (pcr >= 50) {
        inProgressCount++;
      } else {
        earlyCount++;
      }
    });

    const averageCompletionRate = total > 0 ? Math.round(totalPcr / total) : 0;

    // Allocate 24 radial arc ticks according to the project health tier proportions
    const totalTicks = 24;
    const completedTicks = total > 0 ? Math.round((totalTicks * completedCount) / total) : 0;
    const inProgressTicks = total > 0 ? Math.round((totalTicks * inProgressCount) / total) : 0;

    const ticks = Array.from({ length: totalTicks }, (_, index) => {
      let status: 'completed' | 'in-progress' | 'early' | 'empty' = 'empty';
      let tooltip = 'No projects recorded';

      if (total > 0) {
        if (index < completedTicks) {
          status = 'completed';
          tooltip = `${completedCount} project${completedCount === 1 ? '' : 's'} fully completed (100%)`;
        } else if (index < completedTicks + inProgressTicks) {
          status = 'in-progress';
          tooltip = `${inProgressCount} project${inProgressCount === 1 ? '' : 's'} well underway (>50%)`;
        } else {
          status = 'early';
          tooltip = `${earlyCount} project${earlyCount === 1 ? '' : 's'} in early stage (<50%)`;
        }
      }

      // Angle from 180deg (left) to 0deg (right) with fixed 2-decimal precision
      const angle = Number((180 - (index / (totalTicks - 1)) * 180).toFixed(2));
      return {
        id: index,
        angle,
        status,
        tooltip,
      };
    });

    return {
      averageCompletionRate,
      completedCount,
      inProgressCount,
      earlyCount,
      completedRatio: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      inProgressRatio: total > 0 ? Math.round((inProgressCount / total) * 100) : 0,
      earlyRatio: total > 0 ? Math.round((earlyCount / total) * 100) : 0,
      totalProjects: total,
      gaugeTicks: ticks,
    };
  }, [projects, activeTasks, projectSummaryFilter]);

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
    tasks: activeTasks,
    teams,
    handleApproveAccess,
    handleDenyAccess,
  };
}
