'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuCheck,
  LuCalendar,
  LuFlag,
  LuEllipsisVertical,
  LuCircleArrowRight,
  LuTrash2,
  LuSquareCheck,
  LuX,
  LuCircleDot,
  LuClock,
  LuZap,
  LuBadgeCheck,
  LuCircleCheck,
} from 'react-icons/lu';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { getAuthUsers } from '@/data/users';
import { getProjectPriorityStyle } from '@/features/projects/utils/badgeStyles';
import {
  useBatchDeleteTasksMutation,
  useBatchUpdateTaskStatusMutation,
} from '@/hooks/useDashboardData';

interface TaskListViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onToggleTask?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
}

interface GroupConfig {
  id: TaskStatus;
  title: string;
  tagClass: string;
  iconClass: string;
  countClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const GROUPS: GroupConfig[] = [
  {
    id: 'To Do',
    title: 'To Do',
    tagClass: 'bg-[#f0ece4] text-[#3e372f] border border-[#ded8cc]',
    iconClass: 'text-[#63584c]',
    countClass: 'bg-white text-[#3e372f]',
    Icon: LuCircleDot,
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    tagClass: 'bg-[#feebe7] text-[#c2410c] border border-[#fecdd3]',
    iconClass: 'text-[#ea580c]',
    countClass: 'bg-white text-[#c2410c]',
    Icon: LuClock,
  },
  {
    id: 'In Review',
    title: 'In Review',
    tagClass: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]',
    iconClass: 'text-[#9333ea]',
    countClass: 'bg-white text-[#6b21a8]',
    Icon: LuZap,
  },
  {
    id: 'Approved',
    title: 'Approved',
    tagClass: 'bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4]',
    iconClass: 'text-[#0d9488]',
    countClass: 'bg-white text-[#0f766e]',
    Icon: LuBadgeCheck,
  },
  {
    id: 'Completed',
    title: 'Completed',
    tagClass: 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]',
    iconClass: 'text-[#16a34a]',
    countClass: 'bg-white text-[#15803d]',
    Icon: LuCircleCheck,
  },
];

const NEXT_STATUS_MAP: Record<TaskStatus, TaskStatus> = {
  'To Do': 'In Progress',
  'In Progress': 'In Review',
  'In Review': 'Approved',
  'Approved': 'Completed',
  'Completed': 'To Do',
};

const STATUS_KEY_MAP: Record<TaskStatus, string> = {
  'To Do': 'status.todo',
  'In Progress': 'status.inProgress',
  'In Review': 'status.inReview',
  'Approved': 'status.approved',
  'Completed': 'status.completed',
};

export function TaskListView({
  tasks,
  projects,
  searchQuery,
  onToggleTask,
  onTaskClick,
}: TaskListViewProps) {
  const t = useTranslations('tasksPage');
  const tBadges = useTranslations('projectOverview');
  const authUsers = useMemo(() => getAuthUsers(), []);

  // Dropdown & multi-selection state
  const [activeMenuGroupId, setActiveMenuGroupId] = useState<TaskStatus | null>(null);
  const [confirmClearGroupId, setConfirmClearGroupId] = useState<TaskStatus | null>(null);
  const [selectionModeGroupId, setSelectionModeGroupId] = useState<TaskStatus | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Mutations
  const batchDeleteMutation = useBatchDeleteTasksMutation();
  const batchUpdateStatusMutation = useBatchUpdateTaskStatusMutation();

  // Close open dropdown menu when clicking outside
  useEffect(() => {
    if (!activeMenuGroupId) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-list-group-menu]')) {
        setActiveMenuGroupId(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeMenuGroupId]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  const handleTransferToNext = (groupId: TaskStatus, groupTasks: Task[]) => {
    if (groupTasks.length === 0) return;
    const nextStatus = NEXT_STATUS_MAP[groupId];
    batchUpdateStatusMutation.mutate(
      {
        taskIds: groupTasks.map((t) => t.id),
        newStatus: nextStatus,
      },
      {
        onSuccess: () => {
          toast.success(t('columnActions.transferSuccess', { count: groupTasks.length }));
        },
      }
    );
    setActiveMenuGroupId(null);
  };

  const handleConfirmClear = (groupTasks: Task[]) => {
    if (groupTasks.length === 0) return;
    batchDeleteMutation.mutate(groupTasks.map((t) => t.id), {
      onSuccess: () => {
        toast.success(t('columnActions.clearSuccess', { title: t(STATUS_KEY_MAP[confirmClearGroupId || groupTasks[0]?.status || 'To Do']) }));
      },
    });
    setConfirmClearGroupId(null);
    setActiveMenuGroupId(null);
  };

  const handleStartSelectToDelete = (groupId: TaskStatus) => {
    setSelectionModeGroupId(groupId);
    setSelectedTaskIds(new Set());
    setActiveMenuGroupId(null);
  };

  const handleDeleteSelected = () => {
    if (selectedTaskIds.size === 0) return;
    const count = selectedTaskIds.size;
    batchDeleteMutation.mutate(Array.from(selectedTaskIds), {
      onSuccess: () => {
        toast.success(t('columnActions.deleteSuccess', { count }));
      },
    });
    setSelectedTaskIds(new Set());
    setSelectionModeGroupId(null);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 font-elms">
      {GROUPS.map((group) => {
        const groupTasks = filteredTasks.filter((t) => t.status === group.id);
        const isSelectionMode = selectionModeGroupId === group.id;
        const isMenuOpen = activeMenuGroupId === group.id;
        const isConfirmClear = confirmClearGroupId === group.id;

        return (
          <div
            key={group.id}
            className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs space-y-3"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between pb-3 border-b border-primary-medium/10 relative">
              {/* Status Capsule Pill with Icon & White Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${group.tagClass}`}
              >
                <group.Icon className={`w-3.5 h-3.5 shrink-0 ${group.iconClass}`} />
                <span className="tracking-tight">{t(STATUS_KEY_MAP[group.id])}</span>
                <span
                  className={`ml-0.5 text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs leading-tight ${group.countClass}`}
                >
                  {groupTasks.length}
                </span>
              </div>

              {/* Three-Dotted Button & Pop-down Dropdown Menu */}
              <div className="relative" data-list-group-menu>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuGroupId((prev) =>
                      prev === group.id ? null : group.id
                    )
                  }
                  className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                  aria-label={t('columnActions.optionsFor', { title: t(STATUS_KEY_MAP[group.id]) })}
                  title={t('columnActions.optionsFor', { title: t(STATUS_KEY_MAP[group.id]) })}
                >
                  <LuEllipsisVertical className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Animated Dropdown Menu with Pop-down and Mild Bounce Effect */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 24,
                        mass: 0.7,
                      }}
                      className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-primary-medium/15 p-1.5 z-40 font-elms origin-top-right space-y-1"
                    >
                      {/* Option 1: Transfer all tasks to next box */}
                      <button
                        type="button"
                        disabled={groupTasks.length === 0}
                        onClick={() => handleTransferToNext(group.id, groupTasks)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-primary-dark hover:bg-primary-surface/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <LuCircleArrowRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div>
                            {t('columnActions.transferTo', {
                              status: t(STATUS_KEY_MAP[NEXT_STATUS_MAP[group.id]]),
                            })}
                          </div>
                          <div className="text-[10px] text-primary-medium/70 font-normal truncate">
                            {t('columnActions.transferSub', { count: groupTasks.length })}
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Select tasks to delete */}
                      <button
                        type="button"
                        disabled={groupTasks.length === 0}
                        onClick={() => handleStartSelectToDelete(group.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-primary-dark hover:bg-primary-surface/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <LuSquareCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div>{t('columnActions.selectToDelete')}</div>
                          <div className="text-[10px] text-primary-medium/70 font-normal truncate">
                            {t('columnActions.selectToDeleteSub')}
                          </div>
                        </div>
                      </button>

                      {/* Option 3: Clear all tasks in this group */}
                      <button
                        type="button"
                        disabled={groupTasks.length === 0}
                        onClick={() => {
                          setConfirmClearGroupId(group.id);
                          setActiveMenuGroupId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <LuTrash2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div>{t('columnActions.clearAll')}</div>
                          <div className="text-[10px] text-red-500/80 font-normal truncate">
                            {t('columnActions.clearAllSub', { count: groupTasks.length })}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Clear All Confirmation Banner */}
            <AnimatePresence>
              {isConfirmClear && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 bg-red-50 border border-red-200 rounded-xl mb-3 text-xs space-y-2 overflow-hidden"
                >
                  <p className="font-semibold text-red-900 leading-tight">
                    {t('columnActions.confirmClear', {
                      count: groupTasks.length,
                      title: t(STATUS_KEY_MAP[group.id]),
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmClear(groupTasks)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                    >
                      {t('columnActions.yesClearAll')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearGroupId(null)}
                      className="px-2.5 py-1 bg-white hover:bg-primary-surface text-primary-dark font-medium border border-primary-medium/20 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      {t('columnActions.cancel')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Multi-Select Delete Toolbar */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3 overflow-hidden text-xs"
                >
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={
                        groupTasks.length > 0 && selectedTaskIds.size === groupTasks.length
                      }
                      onChange={() => {
                        if (selectedTaskIds.size === groupTasks.length) {
                          setSelectedTaskIds(new Set());
                        } else {
                          setSelectedTaskIds(new Set(groupTasks.map((t) => t.id)));
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-primary-dark">
                      {t('columnActions.selectedCount', {
                        selected: selectedTaskIds.size,
                        total: groupTasks.length,
                      })}
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={selectedTaskIds.size === 0 || batchDeleteMutation.isPending}
                      onClick={handleDeleteSelected}
                      className="px-2.5 py-1 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <LuTrash2 className="w-3 h-3" />
                      <span>{t('columnActions.deleteCount', { count: selectedTaskIds.size })}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionModeGroupId(null);
                        setSelectedTaskIds(new Set());
                      }}
                      className="p-1 rounded-lg text-primary-medium/80 hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                      title={t('columnActions.exitSelection')}
                    >
                      <LuX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Group Task Items */}
            <div className="divide-y divide-primary-medium/10">
              {groupTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-primary-medium/60">
                  {t('columnActions.emptyColumn', { title: t(STATUS_KEY_MAP[group.id]) })}
                </div>
              ) : (
                groupTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isCardSelected = selectedTaskIds.has(task.id);
                  const project = projects.find((p) => p.id === task.projectId);
                  const assignee = authUsers.find((u) => u.id === task.assigneeId);
                  const assignees =
                    task.assigneeIds && task.assigneeIds.length > 0
                      ? task.assigneeIds
                          .map((id) => authUsers.find((u) => u.id === id))
                          .filter((u): u is (typeof authUsers)[0] => Boolean(u))
                      : assignee
                      ? [assignee]
                      : [];
                  const priorityStyle = getProjectPriorityStyle(task.priority || 'Medium');

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleTaskSelection(task.id);
                        } else {
                          onTaskClick?.(task);
                        }
                      }}
                      className={`py-3 flex items-center justify-between gap-3 hover:bg-primary-surface/20 rounded-lg px-2 transition-colors cursor-pointer ${
                        isCompleted ? 'opacity-60' : ''
                      } ${isCardSelected ? 'bg-red-50/40 ring-1 ring-red-400/40' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox: In selection mode, select for deletion; otherwise toggle complete */}
                        {isSelectionMode ? (
                          <div
                            className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all shrink-0 ${
                              isCardSelected
                                ? 'bg-red-600 text-white shadow-2xs'
                                : 'border border-primary-medium/40 bg-white hover:border-red-500'
                            }`}
                          >
                            {isCardSelected && <LuCheck className="w-3 h-3 stroke-[3]" />}
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={isCompleted ? t('table.markIncomplete') : t('table.markCompleted')}
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
                        )}

                        <div className="min-w-0">
                          <span
                            className={`text-sm font-semibold tracking-tight block truncate ${
                              isCompleted ? 'line-through text-primary-dark/60' : 'text-primary-dark'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-primary-medium/70 block mt-0.5 truncate">
                            {project ? project.name : t('table.generalTask')}
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
