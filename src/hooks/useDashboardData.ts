'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageApi } from '@/lib/storage';
import { Project } from '@/features/projects/types/project.types';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';

export const QUERY_KEYS = {
  PROJECTS: ['projects'] as const,
  TASKS: ['tasks'] as const,
  TEAM: ['team'] as const,
  ACTIVITIES: ['activities'] as const,
  STATS: ['dashboardStats'] as const,
};

// 1. Projects Query
export function useProjectsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: () => storageApi.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

// 2. Tasks Query
export function useTasksQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS,
    queryFn: () => storageApi.getTasks(),
    staleTime: 5 * 60 * 1000,
  });
}

// 3. Team Query
export function useTeamQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM,
    queryFn: () => storageApi.getTeam(),
    staleTime: 10 * 60 * 1000,
  });
}

// 4. Activities Query
export function useActivitiesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVITIES,
    queryFn: () => storageApi.getActivities(),
    staleTime: 60 * 1000,
  });
}

// 5. Dashboard Aggregate Stats Query
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: () => storageApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000,
  });
}

// 6. Add Project Mutation
export function useAddProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: Omit<Project, 'id' | 'createdAt'>) =>
      storageApi.addProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

// 7. Update Task Status Mutation
export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      storageApi.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
    },
  });
}

// 8. Reset Demo Data Mutation
export function useResetDemoDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => storageApi.resetDemoData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}
