'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LuCheck, LuFlag, LuGitBranchPlus } from 'react-icons/lu';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { getAuthUsers } from '@/data/users';
import { getProjectPriorityStyle, getTaskStatusStyle } from '@/features/projects/utils/badgeStyles';
import { stripHtmlToPlainText } from '@/features/projects/utils/htmlSanitizer';

const STATUS_KEY_MAP: Record<TaskStatus, string> = {
  'To Do': 'status.todo',
  'In Progress': 'status.inProgress',
  'In Review': 'status.inReview',
  'Approved': 'status.approved',
  'Completed': 'status.completed',
};

interface TaskTableViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onToggleTask?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
}

export function TaskTableView({
  tasks,
  projects,
  searchQuery,
  onToggleTask,
  onTaskClick,
}: TaskTableViewProps) {
  const tTasks = useTranslations('tasksPage');
  const tBadges = useTranslations('projectOverview');
  const authUsers = useMemo(() => getAuthUsers(), []);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && stripHtmlToPlainText(t.description).toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-medium/15 shadow-xs font-elms">
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full min-w-140 text-left border-collapse">
          <thead>
            <tr className="border-b border-primary-medium/10 text-xs font-medium text-primary-medium/60">
              <th scope="col" className="py-3 px-3 pl-0 w-8">
                <span className="sr-only">{tTasks('table.statusToggle')}</span>
              </th>
              <th scope="col" className="py-3 px-3 font-medium">{tTasks('table.task')}</th>
              <th scope="col" className="py-3 px-3 font-medium">{tTasks('table.assignedTo')}</th>
              <th scope="col" className="py-3 px-3 font-medium">{tTasks('table.project')}</th>
              <th scope="col" className="py-3 px-3 font-medium">{tTasks('table.priority')}</th>
              <th scope="col" className="py-3 px-3 font-medium">{tTasks('table.status')}</th>
              <th scope="col" className="py-3 px-3 pr-0 font-medium">{tTasks('table.dueDate')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-medium/10">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-primary-medium/70">
                  {tTasks('table.noTasksFound')}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const project = projects.find((p) => p.id === task.projectId);
                const assignee = authUsers.find((u) => u.id === task.assigneeId);
                const assignees = task.assigneeIds && task.assigneeIds.length > 0
                  ? task.assigneeIds.map((id) => authUsers.find((u) => u.id === id)).filter((u): u is typeof authUsers[0] => Boolean(u))
                  : (assignee ? [assignee] : []);
                const priorityStyle = getProjectPriorityStyle(task.priority || 'Medium');
                const statusStyle = getTaskStatusStyle(task.status);

                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`hover:bg-primary-surface/30 transition-colors group cursor-pointer ${
                      isCompleted ? 'bg-primary-surface/10' : ''
                    }`}
                  >
                    <td
                      className="py-3.5 px-3 pl-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask?.(task);
                      }}
                    >
                      <button
                        type="button"
                        aria-label={isCompleted ? tTasks('table.markIncomplete') : tTasks('table.markCompleted')}
                        className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-primary-dark border border-primary-dark text-white shadow-2xs'
                            : 'border border-primary-medium/35 bg-white hover:border-primary-dark'
                        }`}
                      >
                        {isCompleted && <LuCheck className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold tracking-tight transition-colors ${
                            isCompleted ? 'text-primary-dark/60 line-through' : 'text-primary-dark'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-primary-medium/80 font-bold shrink-0 bg-primary-surface/60 px-1.5 py-0.5 rounded"
                            title={`${task.subtasks.length} subtasks`}
                          >
                            <LuGitBranchPlus className="w-3 h-3 text-primary-medium/80 shrink-0" />
                            <span>{task.subtasks.length}</span>
                          </span>
                        )}
                      </div>
                    </td>

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
                            <span className="text-xs font-medium text-primary-dark tracking-tight whitespace-nowrap truncate max-w-[140px]">
                              {assignees.map((a) => a.fullName).join(', ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-primary-medium/60 tracking-tight whitespace-nowrap">
                            {tTasks('table.unassigned')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-xs font-normal text-primary-medium/85 truncate block max-w-44">
                        {project ? project.name : tTasks('table.generalTask')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shadow-2xs ${priorityStyle.className}`}
                      >
                        <LuFlag className="w-3 h-3 fill-current" />
                        <span>{tBadges(priorityStyle.labelKey)}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs ${statusStyle.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotColor}`} />
                        <span>{tTasks(STATUS_KEY_MAP[task.status] || 'status.todo')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 pr-0">
                      <span className="text-xs font-medium text-primary-dark/85 whitespace-nowrap">
                        {task.deadline || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
