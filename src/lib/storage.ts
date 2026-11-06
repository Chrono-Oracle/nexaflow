import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACTIVITIES,
  calculateDashboardStats,
} from '@/data/mockData';
import { currentUser } from '@/data/userDashboard';
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
  INITIALIZED: 'nexaflow_initialized_v2',
};

// Helper: safe local storage read with JSON parse
function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);

    // If legacy mock dummy projects were stored previously (e.g. proj-1, proj-2), purge them for live demo
    if (key === STORAGE_KEYS.PROJECTS && Array.isArray(parsed)) {
      const hasDummyMock = parsed.some((p: { id?: string }) => p.id === 'proj-1' || p.id === 'proj-2');
      if (hasDummyMock) {
        setStoredItem(key, fallback);
        return fallback;
      }
    }
    return parsed;
  } catch (err) {
    console.warn(`Error reading localStorage [${key}]:`, err);
    return fallback;
  }
}

// Helper: safe local storage write with JSON stringify & event dispatch
function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event for reactive tab/window updates
    window.dispatchEvent(new CustomEvent('nexaflow_storage_updated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to persist to localStorage [${key}]:`, error);
  }
}

// Ensure clean live demo initialization on client load
export function initClientStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      // Clear legacy dummy projects & tasks if present
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      setStoredItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
      setStoredItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
      setStoredItem(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
      setStoredItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch {
    // Ignore private browsing restrictions
  }
}

export const storageApi = {
  // ==========================================
  // PROJECTS CRUD
  // ==========================================
  async getProjects(): Promise<Project[]> {
    return getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const projects = await storageApi.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const projects = await storageApi.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
      taskCount: project.taskCount ?? 0,
      progress: project.progress ?? 0,
      tags: project.tags ?? [],
    };

    const updated = [newProject, ...projects];
    setStoredItem(STORAGE_KEYS.PROJECTS, updated);

    // Record activity
    await storageApi.addActivity({
      type: 'project_created',
      title: 'Project created',
      description: `Project "${newProject.name}" was created.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return newProject;
  },

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const projects = await storageApi.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedProject = {
      ...projects[index],
      ...updates,
    };

    projects[index] = updatedProject;
    setStoredItem(STORAGE_KEYS.PROJECTS, projects);

    await storageApi.addActivity({
      type: 'project_created',
      title: 'Project updated',
      description: `Project "${updatedProject.name}" was modified.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return updatedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    const projects = await storageApi.getProjects();
    const target = projects.find((p) => p.id === id);
    if (!target) return false;

    const filteredProjects = projects.filter((p) => p.id !== id);
    setStoredItem(STORAGE_KEYS.PROJECTS, filteredProjects);

    // Cascade delete associated tasks
    const tasks = await storageApi.getTasks();
    const remainingTasks = tasks.filter((t) => t.projectId !== id);
    setStoredItem(STORAGE_KEYS.TASKS, remainingTasks);

    await storageApi.addActivity({
      type: 'project_created',
      title: 'Project deleted',
      description: `Project "${target.name}" and its tasks were removed.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return true;
  },

  // ==========================================
  // TASKS CRUD
  // ==========================================
  async getTasks(): Promise<Task[]> {
    const tasks = getStoredItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    let hasMissing = false;
    let maxNum = 0;
    for (const t of tasks) {
      if (t.taskNumber) {
        maxNum = Math.max(maxNum, t.taskNumber);
      } else {
        hasMissing = true;
      }
    }

    if (hasMissing && tasks.length > 0) {
      // Sort chronologically (earliest createdAt first)
      const sorted = [...tasks].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

      let seq = 1;
      for (const t of sorted) {
        if (!t.taskNumber) {
          const found = tasks.find((item) => item.id === t.id);
          if (found) {
            found.taskNumber = seq;
          }
        }
        seq = Math.max(seq + 1, (t.taskNumber || seq) + 1);
      }
      setStoredItem(STORAGE_KEYS.TASKS, tasks);
    }

    return tasks;
  },

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const tasks = await storageApi.getTasks();
    return tasks.filter((t) => t.projectId === projectId);
  },

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await storageApi.getTasks();
    return tasks.find((t) => t.id === id) || null;
  },

  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const tasks = await storageApi.getTasks();
    const maxNumber = tasks.reduce((max, t) => Math.max(max, t.taskNumber || 0), 0);
    const taskNumber = task.taskNumber ?? (maxNumber > 0 ? maxNumber + 1 : tasks.length + 1);

    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      taskNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setStoredItem(STORAGE_KEYS.TASKS, updated);

    // Sync project task count & recalculate progress
    await storageApi.syncProjectStats(task.projectId);

    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Task created',
      description: `Task "${newTask.title}" added to project.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return newTask;
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const tasks = await storageApi.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTask = {
      ...tasks[index],
      ...updates,
    };

    tasks[index] = updatedTask;
    setStoredItem(STORAGE_KEYS.TASKS, tasks);

    // Recalculate project progress
    if (updatedTask.projectId) {
      await storageApi.syncProjectStats(updatedTask.projectId);
    }

    return updatedTask;
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task | null> {
    const tasks = await storageApi.getTasks();
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return null;

    const oldStatus = targetTask.status;
    targetTask.status = newStatus;
    setStoredItem(STORAGE_KEYS.TASKS, tasks);

    // Recalculate project progress
    if (targetTask.projectId) {
      await storageApi.syncProjectStats(targetTask.projectId);
    }

    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Task status changed',
      description: `"${targetTask.title}" moved from ${oldStatus} to ${newStatus}.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return targetTask;
  },

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await storageApi.getTasks();
    const target = tasks.find((t) => t.id === id);
    if (!target) return false;

    const remainingTasks = tasks.filter((t) => t.id !== id);
    setStoredItem(STORAGE_KEYS.TASKS, remainingTasks);

    if (target.projectId) {
      await storageApi.syncProjectStats(target.projectId);
    }

    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Task deleted',
      description: `Task "${target.title}" was removed.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return true;
  },

  async deleteMultipleTasks(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const tasks = await storageApi.getTasks();
    const idSet = new Set(ids);
    const remainingTasks = tasks.filter((t) => !idSet.has(t.id));
    setStoredItem(STORAGE_KEYS.TASKS, remainingTasks);

    const affectedProjectIds = new Set(
      tasks.filter((t) => idSet.has(t.id) && t.projectId).map((t) => t.projectId)
    );

    for (const pId of affectedProjectIds) {
      await storageApi.syncProjectStats(pId);
    }

    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Tasks deleted',
      description: `${ids.length} task(s) were removed.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return true;
  },

  async batchUpdateTaskStatus(taskIds: string[], newStatus: TaskStatus): Promise<boolean> {
    if (taskIds.length === 0) return true;
    const tasks = await storageApi.getTasks();
    const idSet = new Set(taskIds);
    const affectedProjectIds = new Set<string>();

    tasks.forEach((t) => {
      if (idSet.has(t.id)) {
        t.status = newStatus;
        if (t.projectId) affectedProjectIds.add(t.projectId);
      }
    });

    setStoredItem(STORAGE_KEYS.TASKS, tasks);

    for (const pId of affectedProjectIds) {
      await storageApi.syncProjectStats(pId);
    }

    await storageApi.addActivity({
      type: 'task_status_changed',
      title: 'Tasks status updated',
      description: `${taskIds.length} task(s) transferred to ${newStatus}.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return true;
  },

  // Recalculates and persists a project's progress % and task count based on its tasks
  async syncProjectStats(projectId: string): Promise<void> {
    const [projects, tasks] = await Promise.all([
      storageApi.getProjects(),
      storageApi.getTasks(),
    ]);

    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) return;

    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
    const taskCount = projectTasks.length;
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    projects[projectIndex] = {
      ...projects[projectIndex],
      taskCount,
      progress,
      status: progress === 100 && taskCount > 0 ? 'Completed' : projects[projectIndex].status,
    };

    setStoredItem(STORAGE_KEYS.PROJECTS, projects);
  },

  // ==========================================
  // TEAM MEMBERS CRUD
  // ==========================================
  async getTeam(): Promise<TeamMember[]> {
    return getStoredItem<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
  },

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    const team = await storageApi.getTeam();
    return team.find((m) => m.id === id) || null;
  },

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const team = await storageApi.getTeam();
    const newMember: TeamMember = {
      ...member,
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [...team, newMember];
    setStoredItem(STORAGE_KEYS.TEAM, updated);

    await storageApi.addActivity({
      type: 'member_assigned',
      title: 'Team member added',
      description: `${newMember.name} joined as ${newMember.role}.`,
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
    });

    return newMember;
  },

  async updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id'>>): Promise<TeamMember | null> {
    const team = await storageApi.getTeam();
    const index = team.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updatedMember = {
      ...team[index],
      ...updates,
    };

    team[index] = updatedMember;
    setStoredItem(STORAGE_KEYS.TEAM, team);
    return updatedMember;
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    const team = await storageApi.getTeam();
    const target = team.find((m) => m.id === id);
    if (!target) return false;

    // Do not allow deleting the current authenticated user
    if (target.email === currentUser.email) {
      return false;
    }

    const filtered = team.filter((m) => m.id !== id);
    setStoredItem(STORAGE_KEYS.TEAM, filtered);
    return true;
  },

  // ==========================================
  // ACTIVITIES
  // ==========================================
  async getActivities(): Promise<ActivityItem[]> {
    return getStoredItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const activities = await storageApi.getActivities();
    const newActivity: ActivityItem = {
      ...item,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: 'Just now',
    };
    const updated = [newActivity, ...activities.slice(0, 29)]; // Keep latest 30
    setStoredItem(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },

  async clearActivities(): Promise<void> {
    setStoredItem(STORAGE_KEYS.ACTIVITIES, []);
  },

  // ==========================================
  // DASHBOARD AGGREGATE STATS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    const [projects, tasks, team] = await Promise.all([
      storageApi.getProjects(),
      storageApi.getTasks(),
      storageApi.getTeam(),
    ]);

    return calculateDashboardStats(projects, tasks, team);
  },

  // ==========================================
  // LIVE PRESENTATION RESET & DEMO CONTROLS
  // ==========================================
  async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') return;
    setStoredItem(STORAGE_KEYS.PROJECTS, []);
    setStoredItem(STORAGE_KEYS.TASKS, []);
    setStoredItem(STORAGE_KEYS.ACTIVITIES, []);
    setStoredItem(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
  },

  async resetDemoData(): Promise<void> {
    await storageApi.clearAllData();
  },

  exportData(): string {
    if (typeof window === 'undefined') return '{}';
    return JSON.stringify({
      projects: getStoredItem(STORAGE_KEYS.PROJECTS, []),
      tasks: getStoredItem(STORAGE_KEYS.TASKS, []),
      team: getStoredItem(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS),
      activities: getStoredItem(STORAGE_KEYS.ACTIVITIES, []),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importData(jsonString: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.projects)) setStoredItem(STORAGE_KEYS.PROJECTS, data.projects);
      if (Array.isArray(data.tasks)) setStoredItem(STORAGE_KEYS.TASKS, data.tasks);
      if (Array.isArray(data.team)) setStoredItem(STORAGE_KEYS.TEAM, data.team);
      if (Array.isArray(data.activities)) setStoredItem(STORAGE_KEYS.ACTIVITIES, data.activities);
      return true;
    } catch {
      return false;
    }
  },
};
