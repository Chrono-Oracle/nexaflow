'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LuCheck, LuCalendar, LuFlag } from 'react-icons/lu';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { getAuthUsers } from '@/data/users';
import { getProjectPriorityStyle } from '@/features/projects/utils/badgeStyles';

interface TaskListViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onToggleTask?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
}

const GROUPS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: 'To Do', label: 'To Do', dotColor: 'bg-amber-500' },
  { status: 'In Progress', label: 'In Progress', dotColor: 'bg-blue-500' },
  { status: 'In Review', label: 'In Review', dotColor: 'bg-purple-500' },
  { status: 'Approved', label: 'Approved', dotColor: 'bg-teal-500' },
  { status: 'Completed', label: 'Completed', dotColor: 'bg-emerald-500' },
];

export function TaskListView({
  tasks,
  projects,
  searchQuery,
  onToggleTask,
  onTaskClick,
}: TaskListViewProps) {
  const tBadges = useTranslations('projectOverview');
  const authUsers = useMemo(() => getAuthUsers(), []);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  return (
    <div className="space-y-6 font-elms">
      {GROUPS.map((group) => {
        const groupTasks = filteredTasks.filter((t) => t.status === group.status);

        return (
          <div
            key={group.status}
            className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs space-y-3"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between pb-3 border-b border-primary-medium/10">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${group.dotColor}`} />
                <h3 className="text-sm font-bold text-primary-dark tracking-tight">
                  {group.label}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-surface text-primary-dark">
                  {groupTasks.length}
                </span>
              </div>
            </div>

            {/* Group Task Items */}
            <div className="divide-y divide-primary-medium/10">
              {groupTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-primary-medium/60">
                  No tasks in {group.label}.
                </div>
              ) : (
                groupTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const project = projects.find((p) => p.id === task.projectId);
                  const assignee = authUsers.find((u) => u.id === task.assigneeId);
                  const assignees = task.assigneeIds && task.assigneeIds.length > 0
                    ? task.assigneeIds.map((id) => authUsers.find((u) => u.id === id)).filter((u): u is typeof authUsers[0] => Boolean(u))
                    : (assignee ? [assignee] : []);
                  const priorityStyle = getProjectPriorityStyle(task.priority || 'Medium');

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className={`py-3 flex items-center justify-between gap-3 hover:bg-primary-surface/20 rounded-lg px-2 transition-colors cursor-pointer ${
                        isCompleted ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask?.(task);
                          }}
                          className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isCompleted
                              ? 'bg-primary-dark border border-primary-dark text-white shadow-2xs'
                              : 'border border-primary-medium/35 bg-white hover:border-primary-dark'
                          }`}
                        >
                          {isCompleted && <LuCheck className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`text-sm font-semibold tracking-tight block truncate ${
                              isCompleted ? 'line-through text-primary-dark/60' : 'text-primary-dark'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-primary-medium/70 block mt-0.5 truncate">
                            {project ? project.name : 'General Task'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${priorityStyle.className}`}
                        >
                          <LuFlag className="w-2.5 h-2.5 fill-current" />
                          <span>{tBadges(priorityStyle.labelKey)}</span>
                        </span>

                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary-medium/80">
                          <LuCalendar className="w-3.5 h-3.5 text-primary-medium/60" />
                          <span>{task.deadline || '—'}</span>
                        </div>

                        {assignees.length > 0 && (
                          <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                            {assignees.slice(0, 3).map((a) => (
                              <Image
                                key={a.id}
                                src={a.avatar || '/Avatar.jpg'}
                                alt={a.fullName}
                                title={a.fullName}
                                width={24}
                                height={24}
                                unoptimized
                                className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
                              />
                            ))}
                            {assignees.length > 3 && (
                              <span className="w-6 h-6 rounded-full bg-primary-medium/20 text-primary-dark font-bold text-[10px] flex items-center justify-center border border-white shadow-2xs">
                                +{assignees.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
