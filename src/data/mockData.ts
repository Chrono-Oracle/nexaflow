import { Project } from '@/features/projects/types/project.types';
import { Task } from '@/features/tasks/types/task.types';
import { TeamMember } from '@/features/team/types/team.types';
import { ActivityItem } from '@/features/notifications/types/activity.types';
import { DashboardStats } from '@/features/home/types/dashboard.types';
import { currentUser } from './userDashboard';

// Live Demo Setup: No dummy data except for the authenticated user
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-user-01',
    name: currentUser.fullName,
    email: currentUser.email,
    role: currentUser.workspace.role,
    department: 'Operations',
    avatar: currentUser.avatar,
    capacity: 100,
    activeTaskCount: 0,
    status: 'Active',
  },
];

// Start 100% clean with zero dummy projects, tasks, or activities
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export function calculateDashboardStats(
  projects: Project[],
  tasks: Task[],
  team: TeamMember[]
): DashboardStats {
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const tasksInProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Completed' || !t.deadline) return false;
    const deadlineDate = new Date(t.deadline);
    return deadlineDate < today;
  }).length;

  const totalProgress = projects.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  const overallProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

  return {
    activeProjects,
    tasksInProgress,
    completedTasks,
    overdueTasks,
    totalProjects: projects.length,
    overallProgress,
    totalTeamMembers: team.length,
  };
}
