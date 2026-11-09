'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageApi, initClientStorage } from '@/lib/storage';
import { Project } from '@/features/projects/types/project.types';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { TeamMember, Team } from '@/features/team/types/team.types';

export const QUERY_KEYS = {
  PROJECTS: ['projects'] as const,
  PROJECT: (id: string) => ['projects', id] as const,
  TASKS: ['tasks'] as const,
  TASK: (id: string) => ['tasks', id] as const,
  TEAM: ['team'] as const,
  TEAMS: ['teams'] as const,
  ACTIVITIES: ['activities'] as const,
  STATS: ['dashboardStats'] as const,
};

// Hook to initialize storage and listen for cross-tab or cross-component storage changes
export function useStorageSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Run client initialization
    initClientStorage();

    const handleStorageChange = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nexaflow_storage_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nexaflow_storage_updated', handleStorageChange);
    };
  }, [queryClient]);
}

// ==========================================
// PROJECTS HOOKS
// ==========================================
export function useProjectsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: () => storageApi.getProjects(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT(id),
    queryFn: () => storageApi.getProjectById(id),
    enabled: !!id,
  });
}

export function useAddProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: Omit<Project, 'id' | 'createdAt'>) =>
      storageApi.addProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Project, 'id' | 'createdAt'>> }) =>
      storageApi.updateProject(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

// ==========================================
// TASKS HOOKS
// ==========================================
export function useTasksQuery(projectId?: string) {
  return useQuery({
    queryKey: projectId ? [...QUERY_KEYS.TASKS, { projectId }] : QUERY_KEYS.TASKS,
    queryFn: () => (projectId ? storageApi.getTasksByProject(projectId) : storageApi.getTasks()),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TASK(id),
    queryFn: () => storageApi.getTaskById(id),
    enabled: !!id,
  });
}

export function useAddTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: Omit<Task, 'id' | 'createdAt'>) =>
      storageApi.addTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> }) =>
      storageApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      storageApi.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useReorderTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderedTaskIds,
      targetStatus,
    }: {
      orderedTaskIds: string[];
      targetStatus?: { taskId: string; newStatus: TaskStatus };
    }) => storageApi.reorderTasks(orderedTaskIds, targetStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useBatchDeleteTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => storageApi.deleteMultipleTasks(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useBatchUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskIds, newStatus }: { taskIds: string[]; newStatus: TaskStatus }) =>
      storageApi.batchUpdateTaskStatus(taskIds, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

// ==========================================
// TEAM HOOKS
// ==========================================
export function useTeamQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM,
    queryFn: () => storageApi.getTeam(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAddTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: Omit<TeamMember, 'id'>) => storageApi.addTeamMember(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

export function useUpdateTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<TeamMember, 'id'>> }) =>
      storageApi.updateTeamMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
    },
  });
}

export function useDeleteTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageApi.deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// ==========================================
// TEAMS HOOKS
// ==========================================
export function useTeamsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.TEAMS,
    queryFn: () => storageApi.getTeams(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTeam: Omit<Team, 'id' | 'createdAt'>) => storageApi.createTeam(newTeam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useDeleteTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageApi.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Team, 'id' | 'createdAt'>>;
    }) => storageApi.updateTeam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// ==========================================
// ACTIVITIES HOOK
// ==========================================
export function useActivitiesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVITIES,
    queryFn: () => storageApi.getActivities(),
    staleTime: 1000 * 60,
  });
}

// ==========================================
// DASHBOARD STATS HOOK
// ==========================================
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: () => storageApi.getDashboardStats(),
    staleTime: 1000 * 60 * 2,
  });
}

// ==========================================
// LIVE DEMO RESET / CLEAR DATA HOOK
// ==========================================
export function useClearDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => storageApi.clearAllData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useResetDemoDataMutation() {
  return useClearDataMutation();
}
