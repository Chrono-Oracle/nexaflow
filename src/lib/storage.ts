import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACTIVITIES,
  calculateDashboardStats,
} from '@/data/mockData';
import { Project } from '@/features/projects/types/project.types';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { TeamMember } from '@/features/team/types/team.types';
import { ActivityItem } from '@/features/notifications/types/activity.types';
import { DashboardStats } from '@/features/home/types/dashboard.types';

const STORAGE_KEYS = {
  PROJECTS: 'nexaflow_projects',
  TASKS: 'nexaflow_tasks',
  TEAM: 'nexaflow_team',
  ACTIVITIES: 'nexaflow_activities',
};

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist to localStorage [${key}]:`, error);
  }
}

export const storageApi = {
  // Projects
  async getProjects(): Promise<Project[]> {
    return getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const projects = await storageApi.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newProject, ...projects];
    setStoredItem(STORAGE_KEYS.PROJECTS, updated);

    // Also record activity
    await storageApi.addActivity({
      type: 'project_created',
      title: 'New project created',
      description: `"${newProject.name}" was created.`,
      actorName: 'Tankeu Daniel',
      actorAvatar: '/Avatar.jpg',
    });

    return newProject;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return getStoredItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task | null> {
    const tasks = await storageApi.getTasks();
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return null;

    targetTask.status = newStatus;
    setStoredItem(STORAGE_KEYS.TASKS, tasks);

    // Record activity
    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Task status updated',
      description: `"${targetTask.title}" moved to ${newStatus}.`,
      actorName: 'Tankeu Daniel',
      actorAvatar: '/Avatar.jpg',
    });

    return targetTask;
  },

  // Team
  async getTeam(): Promise<TeamMember[]> {
    return getStoredItem<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
  },

  // Activities
  async getActivities(): Promise<ActivityItem[]> {
    return getStoredItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const activities = await storageApi.getActivities();
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    const updated = [newActivity, ...activities.slice(0, 19)]; // Keep latest 20
    setStoredItem(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },

  // Aggregate Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const [projects, tasks, team] = await Promise.all([
      storageApi.getProjects(),
      storageApi.getTasks(),
      storageApi.getTeam(),
    ]);

    return calculateDashboardStats(projects, tasks, team);
  },

  // Reset to initial demo state
  async resetDemoData(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.TEAM);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  },
};
