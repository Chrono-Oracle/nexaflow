'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuCalendar,
  LuFlag,
  LuEllipsisVertical,
  LuCircleArrowRight,
  LuTrash2,
  LuSquareCheck,
  LuX,
  LuCheck,
  LuPlus,
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

interface TaskBoardViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onAddTask?: (defaultStatus?: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  tagClass: string;
  iconClass: string;
  countClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const COLUMNS: ColumnConfig[] = [
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

export function TaskBoardView({
  tasks,
  projects,
  searchQuery,
  onAddTask,
  onTaskClick,
}: TaskBoardViewProps) {
  const t = useTranslations('tasksPage');
  const tBadges = useTranslations('projectOverview');
  const authUsers = useMemo(() => getAuthUsers(), []);

  // Dropdown & multi-selection state
  const [activeMenuColId, setActiveMenuColId] = useState<TaskStatus | null>(null);
  const [confirmClearColId, setConfirmClearColId] = useState<TaskStatus | null>(null);
  const [selectionModeColId, setSelectionModeColId] = useState<TaskStatus | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  // Mutations
  const batchDeleteMutation = useBatchDeleteTasksMutation();
  const batchUpdateStatusMutation = useBatchUpdateTaskStatusMutation();

  // Close open dropdown menu when clicking outside
  useEffect(() => {
    if (!activeMenuColId) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-column-menu]')) {
        setActiveMenuColId(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeMenuColId]);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  const handleTransferToNext = (colId: TaskStatus, colTasks: Task[]) => {
    if (colTasks.length === 0) return;
    const nextStatus = NEXT_STATUS_MAP[colId];
    batchUpdateStatusMutation.mutate({
      taskIds: colTasks.map((t) => t.id),
      newStatus: nextStatus,
    });
    setActiveMenuColId(null);
  };

  const handleConfirmClear = (colTasks: Task[]) => {
    if (colTasks.length === 0) return;
    batchDeleteMutation.mutate(colTasks.map((t) => t.id));
    setConfirmClearColId(null);
    setActiveMenuColId(null);
  };

  const handleStartSelectToDelete = (colId: TaskStatus) => {
    setSelectionModeColId(colId);
    setSelectedTaskIds(new Set());
    setActiveMenuColId(null);
  };

  const handleDeleteSelected = () => {
    if (selectedTaskIds.size === 0) return;
    batchDeleteMutation.mutate(Array.from(selectedTaskIds));
    setSelectedTaskIds(new Set());
    setSelectionModeColId(null);
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
    <div
      ref={containerRef}
      className="flex gap-4 items-start overflow-x-auto pb-6 custom-scrollbar font-elms min-w-full"
    >
      {COLUMNS.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id);
        const isSelectionMode = selectionModeColId === col.id;
        const isMenuOpen = activeMenuColId === col.id;
        const isConfirmClear = confirmClearColId === col.id;

        return (
          <div
            key={col.id}
            className="flex-1 min-w-[260px] sm:min-w-[280px] bg-white/80 rounded-2xl p-4 border border-primary-medium/15 shadow-2xs flex flex-col min-h-[460px] shrink-0 xl:shrink"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-primary-medium/10 mb-3 relative">
              {/* Status Capsule Pill with Icon & White Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${col.tagClass}`}
              >
                <col.Icon className={`w-3.5 h-3.5 shrink-0 ${col.iconClass}`} />
                <span className="tracking-tight">{t(STATUS_KEY_MAP[col.id])}</span>
                <span
                  className={`ml-0.5 text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs leading-tight ${col.countClass}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Three-Dotted Button & Pop-down Dropdown Menu */}
              <div className="relative" data-column-menu>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuColId((prev) => (prev === col.id ? null : col.id))
                  }
                  className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                  aria-label={t('columnActions.optionsFor', { title: t(STATUS_KEY_MAP[col.id]) })}
                  title={t('columnActions.optionsFor', { title: t(STATUS_KEY_MAP[col.id]) })}
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
                        disabled={colTasks.length === 0}
                        onClick={() => handleTransferToNext(col.id, colTasks)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-primary-dark hover:bg-primary-surface/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <LuCircleArrowRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div>
                            {t('columnActions.transferTo', {
                              status: t(STATUS_KEY_MAP[NEXT_STATUS_MAP[col.id]]),
                            })}
                          </div>
                          <div className="text-[10px] text-primary-medium/70 font-normal truncate">
                            {t('columnActions.transferSub', { count: colTasks.length })}
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Select tasks to delete */}
                      <button
                        type="button"
                        disabled={colTasks.length === 0}
                        onClick={() => handleStartSelectToDelete(col.id)}
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

                      {/* Option 3: Clear entire tasks on that card */}
                      <button
                        type="button"
                        disabled={colTasks.length === 0}
                        onClick={() => {
                          setConfirmClearColId(col.id);
                          setActiveMenuColId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <LuTrash2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div>{t('columnActions.clearAll')}</div>
                          <div className="text-[10px] text-red-500/80 font-normal truncate">
                            {t('columnActions.clearAllSub', { count: colTasks.length })}
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
                      count: colTasks.length,
                      title: t(STATUS_KEY_MAP[col.id]),
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmClear(colTasks)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                    >
                      {t('columnActions.yesClearAll')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearColId(null)}
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
                        colTasks.length > 0 && selectedTaskIds.size === colTasks.length
                      }
                      onChange={() => {
                        if (selectedTaskIds.size === colTasks.length) {
                          setSelectedTaskIds(new Set());
                        } else {
                          setSelectedTaskIds(new Set(colTasks.map((t) => t.id)));
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-primary-dark">
                      {t('columnActions.selectedCount', {
                        selected: selectedTaskIds.size,
                        total: colTasks.length,
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
                        setSelectionModeColId(null);
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

            {/* Column Tasks List */}
            <div className="flex-1 space-y-3">
              {colTasks.length === 0 ? (
                <div className="h-44 border-2 border-dashed border-primary-medium/15 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-xs font-medium text-primary-medium/60">
                    {t('columnActions.emptyColumn', { title: t(STATUS_KEY_MAP[col.id]) })}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddTask?.(col.id)}
                    className="mt-2 text-xs font-semibold text-primary-dark hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>{t('columnActions.addTask')}</span>
                  </button>
                </div>
              ) : (
                colTasks.map((task) => {
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
                  const isCardSelected = selectedTaskIds.has(task.id);

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
                      className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer space-y-2.5 group relative ${
                        isCardSelected
                          ? 'border-red-400 bg-red-50/20 ring-2 ring-red-400/20 shadow-xs'
                          : 'border-primary-medium/15 shadow-2xs hover:shadow-xs hover:border-primary-medium/30'
                      }`}
                    >
                      {/* Checkbox badge when in Selection Mode */}
                      {isSelectionMode && (
                        <div className="absolute top-3 right-3 z-10">
                          <div
                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
                              isCardSelected
                                ? 'bg-red-600 text-white shadow-2xs'
                                : 'border border-primary-medium/40 bg-white hover:border-red-500'
                            }`}
                          >
                            {isCardSelected && <LuCheck className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      )}

                      {/* Project Tag & Priority */}
                      <div className="flex items-center justify-between gap-2 pr-6">
                        <span className="text-[11px] font-medium text-primary-medium/80 truncate max-w-[140px]">
                          {project ? project.name : 'General'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${priorityStyle.className}`}
                        >
                          <LuFlag className="w-2.5 h-2.5 fill-current" />
                          <span>{tBadges(priorityStyle.labelKey)}</span>
                        </span>
                      </div>

                      {/* Task Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-primary-dark group-hover:text-primary transition-colors leading-snug">
                        {task.title}
                      </h4>

                      {/* Deadline & Assignee Avatars */}
                      <div className="flex items-center justify-between pt-1 border-t border-primary-medium/10 text-xs text-primary-medium/75">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <LuCalendar className="w-3.5 h-3.5 text-primary-medium/60" />
                          <span>{task.deadline || 'No deadline'}</span>
                        </div>

                        {assignees.length > 0 && (
                          <div className="flex items-center -space-x-1.5 overflow-hidden">
                            {assignees.slice(0, 3).map((a) => (
                              <Image
                                key={a.id}
                                src={a.avatar || '/Avatar.jpg'}
                                alt={a.fullName}
                                title={a.fullName}
                                width={22}
                                height={22}
                                unoptimized
                                className="w-5.5 h-5.5 rounded-full object-cover border border-white shadow-2xs"
                              />
                            ))}
                            {assignees.length > 3 && (
                              <span className="w-5.5 h-5.5 rounded-full bg-primary-medium/20 text-primary-dark font-bold text-[9px] flex items-center justify-center border border-white shadow-2xs">
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
