'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuCheck,
  LuFlag,
  LuEllipsis,
  LuCircleArrowRight,
  LuTrash2,
  LuSquareCheck,
  LuGitBranchPlus,
  LuX,
  LuPlus,
  LuChevronDown,
  LuChevronRight,
  LuGripVertical,
  LuFileText,
  LuPaperclip,
  LuPencil,
  LuTag,
  LuCircleDot,
  LuClock,
  LuZap,
  LuBadgeCheck,
  LuCircleCheck,
} from 'react-icons/lu';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { getAuthUsers } from '@/data/users';
import { getTaskStatusStyle } from '@/features/projects/utils/badgeStyles';
import {
  useBatchDeleteTasksMutation,
  useBatchUpdateTaskStatusMutation,
  useReorderTasksMutation,
} from '@/hooks/useDashboardData';

interface TaskListViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onToggleTask?: (task: Task) => void;
  onAddTask?: (defaultStatus?: TaskStatus) => void;
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

const PRIORITY_STYLES: Record<
  string,
  { textColor: string; flagColor: string; labelKey: string }
> = {
  Urgent: {
    textColor: 'text-rose-600',
    flagColor: 'text-rose-500 fill-rose-500',
    labelKey: 'priority.urgent',
  },
  High: {
    textColor: 'text-orange-600',
    flagColor: 'text-orange-500 fill-orange-500',
    labelKey: 'priority.high',
  },
  Medium: {
    textColor: 'text-amber-600',
    flagColor: 'text-amber-500 fill-amber-500',
    labelKey: 'priority.medium',
  },
  Low: {
    textColor: 'text-blue-600',
    flagColor: 'text-blue-500 fill-blue-500',
    labelKey: 'priority.low',
  },
};

function formatListDueDate(dateStr?: string, locale: string = 'en'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  }).format(d);
}

function AssigneeAvatar({
  user,
}: {
  user: { id: string; fullName: string; avatar?: string };
}) {
  const initials = useMemo(() => {
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  }, [user.fullName]);

  const bgClass = useMemo(() => {
    const colors = [
      'bg-[#2563eb] text-white',
      'bg-[#1e293b] text-white',
      'bg-[#7c3aed] text-white',
      'bg-[#059669] text-white',
      'bg-[#d97706] text-white',
    ];
    let hash = 0;
    for (let i = 0; i < user.fullName.length; i++) {
      hash = user.fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [user.fullName]);

  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.fullName}
        title={user.fullName}
        width={24}
        height={24}
        unoptimized
        className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-2xs"
      />
    );
  }

  return (
    <div
      title={user.fullName}
      className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0 select-none ${bgClass}`}
    >
      {initials}
    </div>
  );
}

function LivelyBounceIcon({
  Icon,
  className = '',
  sizeClass = 'w-5 h-5',
}: {
  Icon: React.ComponentType<{ className?: string }>;
  className?: string;
  sizeClass?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="flex items-center justify-center shrink-0"
    >
      <Icon className={`${sizeClass} ${className}`} />
    </motion.div>
  );
}

export function TaskListView({
  tasks,
  projects,
  searchQuery,
  onToggleTask,
  onAddTask,
  onTaskClick,
}: TaskListViewProps) {
  const t = useTranslations('tasksPage');
  const locale = useLocale();
  const authUsers = useMemo(() => getAuthUsers(), []);

  // Collapsed sections state
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<TaskStatus>>(
    new Set()
  );

  const toggleCollapse = (groupId: TaskStatus) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Dropdown & multi-selection state
  const [activeMenuGroupId, setActiveMenuGroupId] = useState<TaskStatus | null>(
    null
  );
  const [confirmClearGroupId, setConfirmClearGroupId] = useState<TaskStatus | null>(
    null
  );
  const [selectionModeGroupId, setSelectionModeGroupId] =
    useState<TaskStatus | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Drag and Drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | null>(
    null
  );
  const [dragOverGroupId, setDragOverGroupId] = useState<TaskStatus | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  // Mutations
  const batchDeleteMutation = useBatchDeleteTasksMutation();
  const batchUpdateStatusMutation = useBatchUpdateTaskStatusMutation();
  const reorderTasksMutation = useReorderTasksMutation();

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

  const draggingTask = useMemo(
    () => (draggingTaskId ? tasks.find((t) => t.id === draggingTaskId) : null),
    [draggingTaskId, tasks]
  );

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (selectionModeGroupId) return;
    hasDraggedRef.current = true;
    setDraggingTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverTaskId(null);
    setDragOverPosition(null);
    setDragOverGroupId(null);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  const handleTaskDragOver = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!draggingTaskId || draggingTaskId === targetTask.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'top' : 'bottom';

    if (dragOverTaskId !== targetTask.id || dragOverPosition !== position) {
      setDragOverTaskId(targetTask.id);
      setDragOverPosition(position);
      setDragOverGroupId(targetTask.status);
    }
  };

  const handleGroupDragOver = (e: React.DragEvent, groupId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverGroupId !== groupId) {
      setDragOverGroupId(groupId);
    }
  };

  const handleDropOnTask = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    const position = dragOverPosition || 'bottom';

    setDraggingTaskId(null);
    setDragOverTaskId(null);
    setDragOverPosition(null);
    setDragOverGroupId(null);

    if (!draggedId || draggedId === targetTask.id) return;

    const draggedItem = tasks.find((t) => t.id === draggedId);
    if (!draggedItem) return;

    const targetStatus = targetTask.status;
    const statusChanged = draggedItem.status !== targetStatus;

    // 1. Get all tasks in the target status group, excluding the dragged task
    const targetGroupTasks = tasks.filter(
      (t) => t.status === targetStatus && t.id !== draggedId
    );

    // 2. Find target task index in this group
    const targetIndex = targetGroupTasks.findIndex((t) => t.id === targetTask.id);
    const insertIndex =
      position === 'top' ? Math.max(0, targetIndex) : targetIndex + 1;

    // 3. Insert dragged task into the group at target index
    const newGroupTasks = [...targetGroupTasks];
    newGroupTasks.splice(insertIndex, 0, { ...draggedItem, status: targetStatus });

    // 4. Construct complete ordered array for all tasks across all groups
    const newAllTaskIds: string[] = [];
    for (const group of GROUPS) {
      if (group.id === targetStatus) {
        newAllTaskIds.push(...newGroupTasks.map((t) => t.id));
      } else {
        newAllTaskIds.push(
          ...tasks
            .filter((t) => t.status === group.id && t.id !== draggedId)
            .map((t) => t.id)
        );
      }
    }

    // 5. Persist mutation
    reorderTasksMutation.mutate(
      {
        orderedTaskIds: newAllTaskIds,
        targetStatus: statusChanged
          ? { taskId: draggedId, newStatus: targetStatus }
          : undefined,
      },
      {
        onSuccess: () => {
          if (statusChanged) {
            toast.success(
              t('columnActions.taskMoved', {
                title: draggedItem.title,
                status: t(STATUS_KEY_MAP[targetStatus]),
              })
            );
          }
        },
      }
    );
  };

  const handleDropOnGroup = (e: React.DragEvent, targetGroupId: TaskStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain') || draggingTaskId;

    setDraggingTaskId(null);
    setDragOverTaskId(null);
    setDragOverPosition(null);
    setDragOverGroupId(null);

    if (!draggedId) return;

    const draggedItem = tasks.find((t) => t.id === draggedId);
    if (!draggedItem) return;

    const statusChanged = draggedItem.status !== targetGroupId;
    if (!statusChanged) return;

    // Append to end of target group
    const targetGroupTasks = tasks.filter(
      (t) => t.status === targetGroupId && t.id !== draggedId
    );
    const newGroupTasks = [
      ...targetGroupTasks,
      { ...draggedItem, status: targetGroupId },
    ];

    const newAllTaskIds: string[] = [];
    for (const group of GROUPS) {
      if (group.id === targetGroupId) {
        newAllTaskIds.push(...newGroupTasks.map((t) => t.id));
      } else {
        newAllTaskIds.push(
          ...tasks
            .filter((t) => t.status === group.id && t.id !== draggedId)
            .map((t) => t.id)
        );
      }
    }

    reorderTasksMutation.mutate(
      {
        orderedTaskIds: newAllTaskIds,
        targetStatus: { taskId: draggedId, newStatus: targetGroupId },
      },
      {
        onSuccess: () => {
          toast.success(
            t('columnActions.taskMoved', {
              title: draggedItem.title,
              status: t(STATUS_KEY_MAP[targetGroupId]),
            })
          );
        },
      }
    );
  };

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
          toast.success(
            t('columnActions.transferSuccess', { count: groupTasks.length })
          );
        },
      }
    );
    setActiveMenuGroupId(null);
  };

  const handleConfirmClear = (groupTasks: Task[]) => {
    if (groupTasks.length === 0) return;
    batchDeleteMutation.mutate(groupTasks.map((t) => t.id), {
      onSuccess: () => {
        toast.success(
          t('columnActions.clearSuccess', {
            title: t(
              STATUS_KEY_MAP[
                confirmClearGroupId || groupTasks[0]?.status || 'To Do'
              ]
            ),
          })
        );
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
    <div className="space-y-5 font-elms">
      {GROUPS.map((group) => {
        const groupTasks = filteredTasks.filter((t) => t.status === group.id);
        const isCollapsed = collapsedGroupIds.has(group.id);
        const isSelectionMode = selectionModeGroupId === group.id;
        const isMenuOpen = activeMenuGroupId === group.id;
        const isConfirmClear = confirmClearGroupId === group.id;
        const isGroupDragTarget =
          dragOverGroupId === group.id &&
          Boolean(draggingTask && draggingTask.status !== group.id);

        return (
          <div
            key={group.id}
            onDragOver={(e) => handleGroupDragOver(e, group.id)}
            onDrop={(e) => handleDropOnGroup(e, group.id)}
            className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs space-y-2 transition-all ${
              isGroupDragTarget
                ? 'border-primary-dark/40 ring-2 ring-primary-dark/15 bg-primary-surface/10'
                : 'border-primary-medium/15'
            }`}
          >
            {/* Group Header matching reference UI:
                [▼/▶] [ (icon) STATUS ]  Count  ···  + */}
            <div className="flex items-center justify-between pb-2 relative select-none">
              <div className="flex items-center gap-2">
                {/* Collapse / Expand Toggle */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(group.id)}
                  aria-label={
                    isCollapsed ? t('list.expand') : t('list.collapse')
                  }
                  className="p-1 -ml-1 text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/60 rounded-lg transition-colors cursor-pointer"
                >
                  {isCollapsed ? (
                    <LuChevronRight className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <LuChevronDown className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>

                {/* Status Capsule Pill */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${group.tagClass}`}
                >
                  <group.Icon
                    className={`w-3.5 h-3.5 shrink-0 ${group.iconClass}`}
                  />
                  <span className="tracking-tight uppercase">
                    {t(STATUS_KEY_MAP[group.id])}
                  </span>
                </div>

                {/* Plain task count number matching reference layout */}
                <span className="text-xs font-bold text-primary-medium/80 ml-1">
                  {groupTasks.length}
                </span>
              </div>

              {/* Header Right Actions: Options menu & Quick Add button */}
              <div className="flex items-center gap-1">
                {/* Three-dots menu */}
                <div className="relative" data-list-group-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuGroupId((prev) =>
                        prev === group.id ? null : group.id
                      )
                    }
                    className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                    aria-label={t('columnActions.optionsFor', {
                      title: t(STATUS_KEY_MAP[group.id]),
                    })}
                    title={t('columnActions.optionsFor', {
                      title: t(STATUS_KEY_MAP[group.id]),
                    })}
                  >
                    <LuEllipsis className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Popdown dropdown menu */}
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
                        {/* Option 1: Transfer all tasks to next stage */}
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
                                status: t(
                                  STATUS_KEY_MAP[NEXT_STATUS_MAP[group.id]]
                                ),
                              })}
                            </div>
                            <div className="text-[10px] text-primary-medium/70 font-normal truncate">
                              {t('columnActions.transferSub', {
                                count: groupTasks.length,
                              })}
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

                        {/* Option 3: Clear all tasks */}
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
                              {t('columnActions.clearAllSub', {
                                count: groupTasks.length,
                              })}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Add Task Button */}
                <button
                  type="button"
                  onClick={() => onAddTask?.(group.id)}
                  aria-label={t('columnActions.addTask')}
                  title={t('columnActions.addTask')}
                  className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                >
                  <LuPlus className="w-4 h-4 stroke-[2.2]" />
                </button>
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
                        groupTasks.length > 0 &&
                        selectedTaskIds.size === groupTasks.length
                      }
                      onChange={() => {
                        if (selectedTaskIds.size === groupTasks.length) {
                          setSelectedTaskIds(new Set());
                        } else {
                          setSelectedTaskIds(
                            new Set(groupTasks.map((t) => t.id))
                          );
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
                      disabled={
                        selectedTaskIds.size === 0 || batchDeleteMutation.isPending
                      }
                      onClick={handleDeleteSelected}
                      className="px-2.5 py-1 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <LuTrash2 className="w-3 h-3" />
                      <span>
                        {t('columnActions.deleteCount', {
                          count: selectedTaskIds.size,
                        })}
                      </span>
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

            {/* Collapsible Content Area */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {/* Column Subheader aligned with item row columns:
                      Name (left) | Assignee (w-36) | Due date (w-28) | Priority (w-24) */}
                  <div className="hidden sm:flex items-center justify-between text-xs font-semibold text-primary-medium/70 px-3 py-2 border-b border-primary-medium/10 select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-4 shrink-0" /> {/* Space for grip handle */}
                      <div className="w-4 shrink-0" /> {/* Space for checkbox */}
                      <div className="w-3 shrink-0" /> {/* Space for status dot */}
                      <span>{t('list.name')}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-36 text-left">{t('list.assignee')}</div>
                      <div className="w-28 text-left">{t('list.dueDate')}</div>
                      <div className="w-24 text-left">{t('list.priority')}</div>
                    </div>
                  </div>

                  {/* Task Items List */}
                  <div className="divide-y divide-primary-medium/10 pt-1">
                    {groupTasks.length === 0 ? (
                      isGroupDragTarget ? (
                        <div className="py-7 border-2 border-dashed border-primary-dark/50 bg-primary-surface/75 rounded-2xl flex items-center justify-center gap-3 my-2 text-xs font-bold text-primary-dark shadow-2xs">
                          <LivelyBounceIcon
                            Icon={group.Icon}
                            className={group.iconClass}
                            sizeClass="w-5 h-5"
                          />
                          <span className="tracking-tight">
                            {t('columnActions.dropTaskHere')}
                          </span>
                        </div>
                      ) : (
                        <div className="py-7 text-center text-xs text-primary-medium/60 border border-dashed border-primary-medium/20 rounded-xl my-2">
                          {t('columnActions.emptyColumn', {
                            title: t(STATUS_KEY_MAP[group.id]),
                          })}
                        </div>
                      )
                    ) : (
                      groupTasks.map((task) => {
                        const isCompleted = task.status === 'Completed';
                        const isCardSelected = selectedTaskIds.has(task.id);
                        const isDragging = draggingTaskId === task.id;
                        const isDropTarget = dragOverTaskId === task.id;

                        const assignee = authUsers.find(
                          (u) => u.id === task.assigneeId
                        );
                        const assignees =
                          task.assigneeIds && task.assigneeIds.length > 0
                            ? task.assigneeIds
                                .map((id) =>
                                  authUsers.find((u) => u.id === id)
                                )
                                .filter(
                                  (u): u is (typeof authUsers)[0] =>
                                    Boolean(u)
                                )
                            : assignee
                            ? [assignee]
                            : [];

                        const project = projects.find(
                          (p) => p.id === task.projectId
                        );
                        const statusStyle = getTaskStatusStyle(task.status);
                        const priorityCfg =
                          PRIORITY_STYLES[task.priority || 'Medium'] ||
                          PRIORITY_STYLES.Medium;

                        const isUrgent = task.priority === 'Urgent';
                        const isOverdue =
                          task.deadline &&
                          new Date(task.deadline).getTime() < Date.now();
                        const dateClass =
                          isUrgent || isOverdue
                            ? 'text-rose-600 font-semibold'
                            : 'text-primary-medium/80 font-medium';

                        return (
                          <motion.div
                            key={task.id}
                            layout
                            transition={{
                              type: 'spring',
                              damping: 30,
                              stiffness: 450,
                              mass: 0.8,
                            }}
                            className="relative"
                          >
                            {/* Animated drop insertion indicator line */}
                            {isDropTarget && dragOverPosition === 'top' && (
                              <div className="absolute -top-1 left-2 right-2 h-0.5 bg-primary-dark rounded-full shadow-sm z-20 pointer-events-none" />
                            )}
                            {isDropTarget && dragOverPosition === 'bottom' && (
                              <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary-dark rounded-full shadow-sm z-20 pointer-events-none" />
                            )}

                            <div
                              draggable={!isSelectionMode}
                              onDragStart={(e) => handleDragStart(e, task)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleTaskDragOver(e, task)}
                              onDrop={(e) => handleDropOnTask(e, task)}
                              onClick={() => {
                                if (hasDraggedRef.current) return;
                                if (isSelectionMode) {
                                  toggleTaskSelection(task.id);
                                } else {
                                  onTaskClick?.(task);
                                }
                              }}
                              className={`group py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-primary-surface/30 rounded-xl transition-all cursor-pointer select-none ${
                                isDragging
                                  ? 'opacity-35 bg-primary-surface/40 border border-dashed border-primary-dark/30'
                                  : ''
                              } ${isCompleted ? 'opacity-60' : ''} ${
                                isCardSelected
                                  ? 'bg-red-50/50 ring-1 ring-red-400/50'
                                  : ''
                              }`}
                            >
                              {/* Left Section: Drag Grip, Checkbox, Status Dot, Title, Indicators */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* 6-dot drag grip handle: visible on hover at extreme left */}
                                <div
                                  className="w-4 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-primary-medium/40 hover:text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
                                  title="Drag to reorder or change status"
                                >
                                  <LuGripVertical className="w-4 h-4" />
                                </div>

                                {/* Checkbox: Select for delete or toggle completed */}
                                {isSelectionMode ? (
                                  <div
                                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                      isCardSelected
                                        ? 'bg-red-600 text-white shadow-2xs'
                                        : 'border border-primary-medium/40 bg-white hover:border-red-500'
                                    }`}
                                  >
                                    {isCardSelected && (
                                      <LuCheck className="w-3 h-3 stroke-[3]" />
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    aria-label={
                                      isCompleted
                                        ? t('table.markIncomplete')
                                        : t('table.markCompleted')
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleTask?.(task);
                                    }}
                                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                      isCompleted
                                        ? 'bg-primary-dark border border-primary-dark text-white shadow-2xs'
                                        : 'border border-primary-medium/35 bg-white hover:border-primary-dark'
                                    }`}
                                  >
                                    {isCompleted && (
                                      <LuCheck className="w-3 h-3 stroke-[3]" />
                                    )}
                                  </button>
                                )}

                                {/* Status circle dot */}
                                <div className="w-3 flex items-center justify-center shrink-0">
                                  <span
                                    className={`w-2 h-2 rounded-full ${statusStyle.dotColor}`}
                                  />
                                </div>

                                {/* Task Title and Icons */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span
                                    className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
                                      isCompleted
                                        ? 'line-through text-primary-dark/50'
                                        : 'text-primary-dark'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {/* Description icon */}
                                  {task.description && (
                                    <LuFileText
                                      className="w-3.5 h-3.5 text-primary-medium/55 shrink-0"
                                      title={task.description}
                                    />
                                  )}

                                  {/* Media/attachments count badge */}
                                  {task.attachments &&
                                    task.attachments.length > 0 && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[10px] text-primary-medium/70 font-bold shrink-0 bg-primary-surface/60 px-1 py-0.5 rounded"
                                        title={`${task.attachments.length} attachments`}
                                      >
                                        <LuPaperclip className="w-2.5 h-2.5" />
                                        <span>{task.attachments.length}</span>
                                      </span>
                                    )}

                                  {/* Subtasks count badge */}
                                  {task.subtasks &&
                                    task.subtasks.length > 0 && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[10px] text-primary-medium/70 font-bold shrink-0 bg-primary-surface/60 px-1 py-0.5 rounded"
                                        title={`${task.subtasks.length} subtasks`}
                                      >
                                        <LuGitBranchPlus className="w-2.5 h-2.5" />
                                        <span>{task.subtasks.length}</span>
                                      </span>
                                    )}

                                  {/* Hover Quick Actions */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center gap-1 shrink-0 ml-1 text-primary-medium/60">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAddTask?.(task.status);
                                      }}
                                      className="p-1 hover:text-primary-dark hover:bg-primary-surface rounded-md transition-colors cursor-pointer"
                                      title={t('columnActions.addTask')}
                                    >
                                      <LuPlus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTaskClick?.(task);
                                      }}
                                      className="p-1 hover:text-primary-dark hover:bg-primary-surface rounded-md transition-colors cursor-pointer"
                                      title={project ? project.name : t('table.generalTask')}
                                    >
                                      <LuTag className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTaskClick?.(task);
                                      }}
                                      className="p-1 hover:text-primary-dark hover:bg-primary-surface rounded-md transition-colors cursor-pointer"
                                      title={t('table.task')}
                                    >
                                      <LuPencil className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Columns: Assignee (w-36), Due date (w-28), Priority (w-24) */}
                              <div className="flex items-center gap-4 shrink-0">
                                {/* Assignee column */}
                                <div className="w-36 flex items-center">
                                  {assignees.length > 0 ? (
                                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                                      {assignees.slice(0, 3).map((u) => (
                                        <AssigneeAvatar key={u.id} user={u} />
                                      ))}
                                      {assignees.length > 3 && (
                                        <span className="w-6 h-6 rounded-full bg-primary-medium/20 text-primary-dark font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                                          +{assignees.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-primary-medium/50 font-normal truncate">
                                      {t('table.unassigned')}
                                    </span>
                                  )}
                                </div>

                                {/* Due Date column */}
                                <div className={`w-28 text-xs ${dateClass}`}>
                                  {formatListDueDate(task.deadline, locale)}
                                </div>

                                {/* Priority column */}
                                <div className="w-24 flex items-center gap-1.5">
                                  <LuFlag
                                    className={`w-3.5 h-3.5 ${priorityCfg.flagColor}`}
                                  />
                                  <span
                                    className={`text-xs font-semibold ${priorityCfg.textColor}`}
                                  >
                                    {t(priorityCfg.labelKey)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    {isGroupDragTarget && groupTasks.length > 0 && (
                      <div className="py-3 border-2 border-dashed border-primary-dark/50 bg-primary-surface/75 rounded-xl flex items-center justify-center gap-2.5 my-2 text-xs font-bold text-primary-dark shadow-2xs">
                        <LivelyBounceIcon
                          Icon={group.Icon}
                          className={group.iconClass}
                          sizeClass="w-4 h-4"
                        />
                        <span className="tracking-tight">
                          {t('columnActions.dropTaskHere')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
