'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { LuCheck } from 'react-icons/lu';
import {
  useTasksQuery,
  useProjectsQuery,
  useUpdateTaskStatusMutation,
} from '@/hooks/useDashboardData';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { getAuthUsers } from '@/data/users';

export function TasksOverviewWidget() {
  const t = useTranslations('taskOverview');
  const locale = useLocale();
  const router = useRouter();

  // Read live tasks and projects from local storage via React Query
  const { data: tasks = [] } = useTasksQuery();
  const { data: projects = [] } = useProjectsQuery();
  const updateStatusMutation = useUpdateTaskStatusMutation();

  // ONLY show after the user has created at least one task in their dashboard
  if (!tasks || tasks.length === 0) {
    return null;
  }

  // Pre-fetch auth users for assignee lookup
  const authUsers = getAuthUsers();

  const handleToggleTask = (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'Completed' ? 'To Do' : 'Completed';
    updateStatusMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return {
          label: t('status.todo'),
          className: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
          dotClassName: 'bg-[#d97706]',
        };
      case 'In Progress':
        return {
          label: t('status.inProgress'),
          className: 'bg-[#eef4ff] text-[#3b82f6] border border-[#dbeafe]',
          dotClassName: 'bg-[#3b82f6]',
        };
      case 'In Review':
        return {
          label: 'In Review',
          className: 'bg-[#faf5ff] text-[#9333ea] border border-[#f3e8ff]',
          dotClassName: 'bg-[#9333ea]',
        };
      case 'Approved':
        return {
          label: 'Approved',
          className: 'bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]',
          dotClassName: 'bg-[#0d9488]',
        };
      case 'Completed':
      default:
        return {
          label: t('status.completed'),
          className: 'bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5]',
          dotClassName: 'bg-[#10b981]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-medium/15 shadow-xs font-elms">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary-dark tracking-tight">
            {t('title')}
          </h2>
          <p className="text-xs text-primary-medium/70 mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        {/* Consistent "View all" Button */}
        <Link
          href="/tasks"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {t('viewAll')}
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full min-w-140 text-left border-collapse">
          <thead>
            <tr className="border-b border-primary-medium/10 text-xs font-medium text-primary-medium/60">
              <th scope="col" className="py-3 px-3 pl-0 w-8">
                <span className="sr-only">Selection</span>
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.task')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.assignedTo')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.project')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.status')}
              </th>
              <th scope="col" className="py-3 px-3 pr-0 font-medium">
                {t('columns.dueDate')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-medium/10">
            {tasks.map((task) => {
              const badge = getStatusBadge(task.status);
              const isCompleted = task.status === 'Completed';

              // Resolve project name from projectId
              const project = projects.find((p) => p.id === task.projectId);
              const projectName = project ? project.name : 'General Task';

              // Resolve assignee user from assigneeId / assigneeIds
              const assignees = task.assigneeIds && task.assigneeIds.length > 0
                ? task.assigneeIds.map((id) => authUsers.find((u) => u.id === id)).filter((u): u is typeof authUsers[0] => Boolean(u))
                : (task.assigneeId ? [authUsers.find((u) => u.id === task.assigneeId)].filter((u): u is typeof authUsers[0] => Boolean(u)) : []);

              return (
                <tr
                  key={task.id}
                  onClick={() => router.push('/tasks')}
                  className={`hover:bg-primary-surface/30 transition-colors group cursor-pointer ${
                    isCompleted ? 'bg-primary-surface/10' : ''
                  }`}
                >
                  {/* 1. Custom Interactive Checkbox */}
                  <td
                    className="py-3.5 px-3 pl-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task);
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Mark "${task.title}" as ${
                        isCompleted ? 'incomplete' : 'completed'
                      }`}
                      className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-primary-dark border border-primary-dark text-white shadow-2xs'
                          : 'border border-primary-medium/35 bg-white hover:border-primary-dark'
                      }`}
                    >
                      {isCompleted && (
                        <LuCheck className="w-3 h-3 stroke-[3]" />
                      )}
                    </button>
                  </td>

                  {/* 2. Task Name */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-sm font-semibold tracking-tight transition-colors ${
                        isCompleted
                          ? 'text-primary-dark/60 line-through'
                          : 'text-primary-dark'
                      }`}
                    >
                      {task.title}
                    </span>
                  </td>

                  {/* 3. Assigned To User */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      {assignees.length > 0 ? (
                        <>
                          <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                            {assignees.slice(0, 2).map((a) => (
                              <Image
                                key={a.id}
                                src={a.avatar || '/Avatar.jpg'}
                                alt={a.fullName}
                                title={a.fullName}
                                width={24}
                                height={24}
                                unoptimized
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-white shadow-2xs"
                              />
                            ))}
                            {assignees.length > 2 && (
                              <span className="w-6 h-6 rounded-full bg-primary-medium/20 text-primary-dark font-bold text-[10px] flex items-center justify-center border border-white shadow-2xs">
                                +{assignees.length - 2}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-primary-dark tracking-tight whitespace-nowrap truncate max-w-[130px]">
                            {assignees.map((a) => a.fullName).join(', ')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-primary-medium/60 tracking-tight whitespace-nowrap">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Project Name */}
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-normal text-primary-medium/85 truncate block max-w-44">
                      {projectName}
                    </span>
                  </td>

                  {/* 5. Status Badge */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs shrink-0 ${badge.className}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-sm ${badge.dotClassName}`}
                        aria-hidden="true"
                      />
                      {badge.label}
                    </span>
                  </td>

                  {/* 6. Due Date */}
                  <td className="py-3.5 px-3 pr-0">
                    <span className="text-xs font-medium text-primary-dark/85 whitespace-nowrap">
                      {formatDueDate(task.deadline)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
