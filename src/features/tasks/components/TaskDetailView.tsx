'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LuX,
  LuMaximize2,
  LuEllipsis,
  LuSquarePen,
  LuCircleDot,
  LuCalendar,
  LuUsers,
  LuTag,
  LuFileText,
  LuPaperclip,
  LuDownload,
  LuPlus,
  LuGitBranchPlus,
  LuCheck,
  LuTrash2,
  LuSend,
  LuClock,
  LuActivity,
  LuMessageSquare,
  LuLayers,
} from 'react-icons/lu';
import {
  Task,
  TaskStatus,
  TaskAttachment,
  Subtask,
  TaskComment,
} from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { getAuthUsers, getCurrentUser } from '@/data/users';
import {
  getTaskStatusStyle,
  getProjectPriorityStyle,
} from '@/features/projects/utils/badgeStyles';
import { FileIconBadge, FileUploadModal } from '@/components/ui/FileUpload';
import { useUpdateTaskMutation } from '@/hooks/useDashboardData';

export type TaskDetailLayoutMode = 'modal' | 'full' | 'sidebar';

interface TaskDetailViewProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
}

const ALL_STATUSES: TaskStatus[] = [
  'To Do',
  'In Progress',
  'In Review',
  'Approved',
  'Completed',
];

const STATUS_KEY_MAP: Record<TaskStatus, string> = {
  'To Do': 'status.todo',
  'In Progress': 'status.inProgress',
  'In Review': 'status.inReview',
  'Approved': 'status.approved',
  'Completed': 'status.completed',
};

function formatDetailDate(dateStr?: string, locale: string = 'en'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function formatCommentTime(dateStr: string, locale: string = 'en'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return locale === 'fr' ? 'À l’instant' : 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

function generateSubtaskId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateCommentId(): string {
  return `comm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function TaskDetailView({
  task,
  projects,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailViewProps) {
  const t = useTranslations('tasksPage');
  const tBadges = useTranslations('projectOverview');
  const locale = useLocale();
  const authUsers = useMemo(() => getAuthUsers(), []);
  const currentUser = useMemo(() => getCurrentUser(), []);

  // Cache task in state so exit animations can render smoothly before unmount
  const [cachedTask, setCachedTask] = useState<Task | null>(task);
  if (task && task.id !== cachedTask?.id) {
    setCachedTask(task);
  }

  const activeTask = task ?? cachedTask;

  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'activities'>(
    'subtasks'
  );

  // Status dropdown state
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  // Layout mode state: 'modal' | 'full' | 'sidebar' (defaults to 'sidebar')
  const [layoutMode, setLayoutMode] = useState<TaskDetailLayoutMode>('sidebar');
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const layoutMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLayoutMouseEnter = () => {
    if (layoutMenuTimeoutRef.current) {
      clearTimeout(layoutMenuTimeoutRef.current);
      layoutMenuTimeoutRef.current = null;
    }
    setIsLayoutMenuOpen(true);
  };

  const handleLayoutMouseLeave = () => {
    layoutMenuTimeoutRef.current = setTimeout(() => {
      setIsLayoutMenuOpen(false);
    }, 180);
  };

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Quick add subtask input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // New comment input
  const [commentText, setCommentText] = useState('');

  // Editing title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Mutations
  const updateTaskMutation = useUpdateTaskMutation();

  // Dynamic measurement of the task header bottom boundary
  const [headerBottom, setHeaderBottom] = useState<number>(148);

  useEffect(() => {
    if (!isOpen) return;

    const measureHeader = () => {
      const headerEl = document.querySelector('[data-tasks-header]');
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      } else {
        setHeaderBottom(148);
      }
    };

    measureHeader();
    window.addEventListener('resize', measureHeader);
    window.addEventListener('scroll', measureHeader, { passive: true });
    return () => {
      window.removeEventListener('resize', measureHeader);
      window.removeEventListener('scroll', measureHeader);
    };
  }, [isOpen]);

  const handleStartEditTitle = () => {
    if (activeTask) setTitleDraft(activeTask.title);
    setIsEditingTitle(true);
  };

  const handleToggleEditTitle = () => {
    if (!isEditingTitle && activeTask) {
      setTitleDraft(activeTask.title);
    }
    setIsEditingTitle((prev) => !prev);
  };

  // Close status dropdown on outside click
  useEffect(() => {
    if (!isStatusMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-detail-status-menu]')) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isStatusMenuOpen]);

  // Close layout menu on outside click
  useEffect(() => {
    if (!isLayoutMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-detail-layout-menu]')) {
        setIsLayoutMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLayoutMenuOpen]);

  // Cleanup layout timeout on unmount
  useEffect(() => {
    return () => {
      if (layoutMenuTimeoutRef.current) {
        clearTimeout(layoutMenuTimeoutRef.current);
      }
    };
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close when clicking outside the panel without needing a dark backdrop
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (
        target.closest('[data-modal-portal]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[data-file-upload-modal]')
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!activeTask) return null;

  const project = projects.find((p) => p.id === activeTask.projectId);
  const statusStyle = getTaskStatusStyle(activeTask.status);
  const priorityStyle = getProjectPriorityStyle(activeTask.priority || 'Medium');

  // Assignees list
  const assignees =
    activeTask.assigneeIds && activeTask.assigneeIds.length > 0
      ? activeTask.assigneeIds
          .map((id) => authUsers.find((u) => u.id === id))
          .filter((u): u is (typeof authUsers)[0] => Boolean(u))
      : activeTask.assigneeId
      ? [authUsers.find((u) => u.id === activeTask.assigneeId)].filter(
          (u): u is (typeof authUsers)[0] => Boolean(u)
        )
      : [];

  const subtasksList: Subtask[] = activeTask.subtasks || [];
  const completedSubtasksCount = subtasksList.filter((s) => s.completed).length;

  const attachmentsList: TaskAttachment[] = activeTask.attachments || [];

  // Comments list
  const commentsList: TaskComment[] = activeTask.comments || [];

  // Top offset calculated right below the task header
  const topOffsetPx = Math.max(headerBottom + 8, 120);

  // Status Change Handler
  const handleSelectStatus = (newStatus: TaskStatus) => {
    if (!activeTask || newStatus === activeTask.status) {
      setIsStatusMenuOpen(false);
      return;
    }
    const updated = { ...activeTask, status: newStatus };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { status: newStatus } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updated);
          toast.success(
            t('columnActions.taskMoved', {
              title: activeTask.title,
              status: t(STATUS_KEY_MAP[newStatus]),
            })
          );
        },
      }
    );
    setIsStatusMenuOpen(false);
  };

  // Title Save Handler
  const handleSaveTitle = () => {
    if (!activeTask) return;
    if (!titleDraft.trim() || titleDraft.trim() === activeTask.title) {
      setIsEditingTitle(false);
      return;
    }
    const updated = { ...activeTask, title: titleDraft.trim() };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { title: titleDraft.trim() } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updated);
          setIsEditingTitle(false);
        },
      }
    );
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (subtaskId: string) => {
    if (!activeTask) return;
    const updatedSubtasks = subtasksList.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const updatedTask = { ...activeTask, subtasks: updatedSubtasks };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { subtasks: updatedSubtasks } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updatedTask);
        },
      }
    );
  };

  // Add New Subtask
  const handleCreateSubtask = () => {
    if (!activeTask || !newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: generateSubtaskId(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updatedSubtasks = [...subtasksList, newSubtask];
    const updatedTask = { ...activeTask, subtasks: updatedSubtasks };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { subtasks: updatedSubtasks } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updatedTask);
          setNewSubtaskTitle('');
          setIsAddingSubtask(false);
        },
      }
    );
  };

  // Remove Subtask
  const handleRemoveSubtask = (subtaskId: string) => {
    if (!activeTask) return;
    const updatedSubtasks = subtasksList.filter((s) => s.id !== subtaskId);
    const updatedTask = { ...activeTask, subtasks: updatedSubtasks };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { subtasks: updatedSubtasks } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updatedTask);
        },
      }
    );
  };

  // Attach New Files Handler
  const handleAttachFiles = (newAttachments: TaskAttachment[]) => {
    if (!activeTask) return;
    const updatedAttachments = [...attachmentsList, ...newAttachments];
    const updatedTask = { ...activeTask, attachments: updatedAttachments };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { attachments: updatedAttachments } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updatedTask);
        },
      }
    );
  };

  // Add Comment Handler
  const handleAddComment = () => {
    if (!activeTask || !commentText.trim()) return;
    const newComment: TaskComment = {
      id: generateCommentId(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...commentsList, newComment];
    const updatedTask = { ...activeTask, comments: updatedComments };
    updateTaskMutation.mutate(
      { id: activeTask.id, updates: { comments: updatedComments } },
      {
        onSuccess: () => {
          onTaskUpdated?.(updatedTask);
          setCommentText('');
        },
      }
    );
  };

  // Layout mode container styling
  const layoutContainerClasses: Record<TaskDetailLayoutMode, string> = {
    sidebar:
      'right-3 sm:right-5 lg:right-6 w-[calc(100vw-1.5rem)] sm:w-[440px] md:w-[470px] lg:w-[490px] xl:w-[510px]',
    modal:
      'left-3 right-3 sm:left-auto sm:right-auto sm:w-[480px] md:w-[520px] lg:w-[560px] xl:w-[600px] mx-auto inset-x-0',
    full: 'left-3 right-3 sm:left-6 sm:right-6 lg:left-8 lg:right-8 w-auto',
  };

  // Download All Handler
  const handleDownloadAll = () => {
    if (attachmentsList.length === 0) return;
    toast.success(t('taskDetail.downloadAllSuccess'));
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && activeTask && (
          /* Task Detail Panel: Configurable layout mode (Sidebar, Modal, Full screen) with smooth spring exit */
          <motion.div
            key="task-detail-panel"
            ref={panelRef}
            initial={{
              opacity: 0,
              x: layoutMode === 'sidebar' ? 360 : 0,
              y: layoutMode !== 'sidebar' ? 24 : 0,
              scale: layoutMode === 'modal' ? 0.95 : 1,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: layoutMode === 'sidebar' ? 420 : 0,
              y: layoutMode === 'modal' ? 24 : 0,
              scale: layoutMode === 'modal' ? 0.95 : layoutMode === 'full' ? 0.98 : 1,
              transition: {
                duration: 0.28,
                ease: [0.32, 0.72, 0, 1],
              },
            }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 340,
              mass: 0.8,
            }}
            style={{
              top: `${topOffsetPx}px`,
              height: `calc(98vh - ${topOffsetPx}px)`,
            }}
            className={`fixed z-50 pointer-events-auto bg-white rounded-3xl shadow-2xl border border-primary-medium/20 flex flex-col overflow-hidden font-elms ${layoutContainerClasses[layoutMode]}`}
          >
          {/* Top Bar matching reference UI:
              [ ⤢ Project Name / Status ]  ······  [ ✎  ···  ⤢  ✕ ] */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-primary-medium/10 bg-white shrink-0 select-none">
            {/* Breadcrumb Left */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-primary-medium/70 truncate">
                {project ? project.name : t('table.generalTask')}
              </span>
              <span className="text-primary-medium/30 text-xs">/</span>
              <span className="text-xs font-bold text-primary-dark truncate">
                {t(STATUS_KEY_MAP[activeTask.status])}
              </span>
            </div>

            {/* Actions Right */}
            <div className="flex items-center gap-1.5 shrink-0 text-primary-medium/70">
              {/* Edit Title Button */}
              <button
                type="button"
                onClick={handleToggleEditTitle}
                className="p-1.5 rounded-lg hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                title={t('taskDetail.editTitle')}
              >
                <LuSquarePen className="w-4 h-4" />
              </button>

              {/* Options Button */}
              <button
                type="button"
                className="p-1.5 rounded-lg hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer"
                title={t('columnActions.optionsFor', { title: activeTask.title })}
              >
                <LuEllipsis className="w-4 h-4" />
              </button>

              {/* Expand / View Mode Selector (with Hover Popover matching uploaded reference UI) */}
              <div
                className="relative"
                data-detail-layout-menu
                onMouseEnter={handleLayoutMouseEnter}
                onMouseLeave={handleLayoutMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsLayoutMenuOpen((prev) => !prev)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLayoutMenuOpen
                      ? 'text-primary-dark bg-primary-surface'
                      : 'hover:text-primary-dark hover:bg-primary-surface'
                  }`}
                  title={t('taskDetail.layout.viewAs')}
                  aria-label={t('taskDetail.layout.viewAs')}
                >
                  <LuMaximize2 className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isLayoutMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white text-primary-dark rounded-2xl p-2.5 shadow-xl border border-primary-medium/20 flex items-center gap-2 select-none font-elms"
                    >
                      {/* 1. Modal Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setLayoutMode('modal');
                          setIsLayoutMenuOpen(false);
                        }}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                          layoutMode === 'modal'
                            ? 'bg-[#f0ece4] border border-primary-medium/30 shadow-2xs'
                            : 'hover:bg-[#f7f6f2] border border-transparent'
                        }`}
                      >
                        {/* Mini Window Graphic for Modal */}
                        <div
                          className={`w-16 h-11 rounded-lg border p-1 flex flex-col justify-between overflow-hidden shadow-2xs transition-colors ${
                            layoutMode === 'modal'
                              ? 'bg-[#ede9e1] border-primary-dark/35'
                              : 'bg-[#f7f6f2] border-primary-medium/20'
                          }`}
                        >
                          {/* Top window dots */}
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#e06c53]" />
                            <span className="w-1 h-1 rounded-full bg-[#e8a838]" />
                            <span className="w-1 h-1 rounded-full bg-[#48bb78]" />
                          </div>
                          {/* Centered modal box */}
                          <div className="flex-1 flex items-center justify-center p-0.5">
                            <div
                              className={`w-9 h-5 rounded border transition-colors ${
                                layoutMode === 'modal'
                                  ? 'border-primary-dark bg-primary-dark/25'
                                  : 'border-primary-medium/35 bg-primary-medium/10'
                              }`}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[11px] tracking-tight transition-colors ${
                            layoutMode === 'modal'
                              ? 'text-primary-dark font-bold'
                              : 'text-primary-medium/70 group-hover:text-primary-dark font-medium'
                          }`}
                        >
                          {t('taskDetail.layout.modal')}
                        </span>
                      </button>

                      {/* 2. Full Screen Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setLayoutMode('full');
                          setIsLayoutMenuOpen(false);
                        }}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                          layoutMode === 'full'
                            ? 'bg-[#f0ece4] border border-primary-medium/30 shadow-2xs'
                            : 'hover:bg-[#f7f6f2] border border-transparent'
                        }`}
                      >
                        {/* Mini Window Graphic for Full screen */}
                        <div
                          className={`w-16 h-11 rounded-lg border p-1 flex flex-col justify-between overflow-hidden shadow-2xs transition-colors ${
                            layoutMode === 'full'
                              ? 'bg-[#ede9e1] border-primary-dark/35'
                              : 'bg-[#f7f6f2] border-primary-medium/20'
                          }`}
                        >
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#e06c53]" />
                            <span className="w-1 h-1 rounded-full bg-[#e8a838]" />
                            <span className="w-1 h-1 rounded-full bg-[#48bb78]" />
                          </div>
                          {/* Full content box */}
                          <div className="flex-1 p-0.5">
                            <div
                              className={`w-full h-full rounded border transition-colors ${
                                layoutMode === 'full'
                                  ? 'border-primary-dark bg-primary-dark/25'
                                  : 'border-primary-medium/35 bg-primary-medium/10'
                              }`}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[11px] tracking-tight transition-colors ${
                            layoutMode === 'full'
                              ? 'text-primary-dark font-bold'
                              : 'text-primary-medium/70 group-hover:text-primary-dark font-medium'
                          }`}
                        >
                          {t('taskDetail.layout.fullScreen')}
                        </span>
                      </button>

                      {/* 3. Sidebar Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setLayoutMode('sidebar');
                          setIsLayoutMenuOpen(false);
                        }}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                          layoutMode === 'sidebar'
                            ? 'bg-[#f0ece4] border border-primary-medium/30 shadow-2xs'
                            : 'hover:bg-[#f7f6f2] border border-transparent'
                        }`}
                      >
                        {/* Mini Window Graphic for Sidebar */}
                        <div
                          className={`w-16 h-11 rounded-lg border p-1 flex flex-col justify-between overflow-hidden shadow-2xs transition-colors ${
                            layoutMode === 'sidebar'
                              ? 'bg-[#ede9e1] border-primary-dark/35'
                              : 'bg-[#f7f6f2] border-primary-medium/20'
                          }`}
                        >
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#e06c53]" />
                            <span className="w-1 h-1 rounded-full bg-[#e8a838]" />
                            <span className="w-1 h-1 rounded-full bg-[#48bb78]" />
                          </div>
                          {/* Right sidebar box */}
                          <div className="flex-1 flex justify-end p-0.5">
                            <div
                              className={`w-6 h-full rounded border transition-colors ${
                                layoutMode === 'sidebar'
                                  ? 'border-primary-dark bg-primary-dark/25'
                                  : 'border-primary-medium/35 bg-primary-medium/10'
                              }`}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[11px] tracking-tight transition-colors ${
                            layoutMode === 'sidebar'
                              ? 'text-primary-dark font-bold'
                              : 'text-primary-medium/70 group-hover:text-primary-dark font-medium'
                          }`}
                        >
                          {t('taskDetail.layout.sidebar')}
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:text-primary-dark hover:bg-primary-surface transition-colors cursor-pointer ml-1"
                title={t('taskDetail.close')}
              >
                <LuX className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-7 py-5 space-y-6">
            {/* Task Title (Editable) */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="flex-1 text-xl sm:text-2xl font-extrabold text-primary-dark border-b-2 border-primary-dark bg-primary-surface/20 px-2 py-1 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="px-3 py-1 bg-primary-dark text-white text-xs font-semibold rounded-lg hover:bg-primary cursor-pointer"
                  >
                    {t('taskDetail.save')}
                  </button>
                </div>
              ) : (
                <h1
                  onClick={handleStartEditTitle}
                  className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight leading-tight hover:opacity-85 cursor-pointer transition-opacity"
                  title={t('taskDetail.editTitle')}
                >
                  {activeTask.title}
                </h1>
              )}
            </div>

            {/* Properties List matching reference UI:
                Status, Due date, Assignee, Tags */}
            <div className="space-y-3 pt-1 text-xs sm:text-sm">
              {/* 1. Status Row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary-medium/70 w-28 shrink-0 font-medium">
                  <LuCircleDot className="w-4 h-4 text-primary-medium/60 shrink-0" />
                  <span>{t('taskDetail.status')}</span>
                </div>

                {/* Status Selector Pill Dropdown */}
                <div className="relative" data-detail-status-menu>
                  <button
                    type="button"
                    onClick={() => setIsStatusMenuOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102 ${statusStyle.className}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusStyle.dotColor}`}
                    />
                    <span>{t(STATUS_KEY_MAP[activeTask.status])}</span>
                  </button>

                  <AnimatePresence>
                    {isStatusMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-primary-medium/15 p-1 z-30 space-y-0.5"
                      >
                        {ALL_STATUSES.map((st) => {
                          const isCur = st === activeTask.status;
                          const stStyle = getTaskStatusStyle(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleSelectStatus(st)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                                isCur
                                  ? 'bg-primary-surface text-primary-dark font-bold'
                                  : 'text-primary-medium/80 hover:bg-primary-surface/50 hover:text-primary-dark'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${stStyle.dotColor}`}
                                />
                                <span>{t(STATUS_KEY_MAP[st])}</span>
                              </div>
                              {isCur && <LuCheck className="w-3.5 h-3.5 text-primary-dark" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 2. Due Date Row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary-medium/70 w-28 shrink-0 font-medium">
                  <LuCalendar className="w-4 h-4 text-primary-medium/60 shrink-0" />
                  <span>{t('taskDetail.dueDate')}</span>
                </div>
                <div className="font-semibold text-primary-dark text-xs sm:text-sm">
                  {formatDetailDate(activeTask.deadline, locale)}
                </div>
              </div>

              {/* 3. Assignee Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-primary-medium/70 w-28 shrink-0 font-medium">
                  <LuUsers className="w-4 h-4 text-primary-medium/60 shrink-0" />
                  <span>{t('taskDetail.assignee')}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {assignees.map((user) => (
                    <div
                      key={user.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f2ec] border border-primary-medium/15 text-xs font-semibold text-primary-dark shadow-2xs"
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.fullName}
                          width={18}
                          height={18}
                          unoptimized
                          className="w-4.5 h-4.5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {user.fullName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span>{user.fullName}</span>
                    </div>
                  ))}

                  {/* Invite Button matching reference UI */}
                  <button
                    type="button"
                    onClick={() => toast.info(t('taskDetail.inviteSuccess'))}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-primary-medium/30 hover:border-primary-dark/60 bg-[#faf9f5] hover:bg-[#f3f1ec] text-xs font-semibold text-primary-dark/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>{t('taskDetail.invite')}</span>
                  </button>
                </div>
              </div>

              {/* 4. Tags / Priority Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-primary-medium/70 w-28 shrink-0 font-medium">
                  <LuTag className="w-4 h-4 text-primary-medium/60 shrink-0" />
                  <span>{t('taskDetail.tags')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Project Tag Badge */}
                  {project && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]">
                      <LuLayers className="w-3 h-3" />
                      <span>{project.name}</span>
                    </span>
                  )}
                  {/* Priority Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${priorityStyle.className}`}
                  >
                    <span>•</span>
                    <span>{tBadges(priorityStyle.labelKey)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-dark">
                <LuFileText className="w-4 h-4 text-primary-medium/70 shrink-0" />
                <span>{t('taskDetail.description')}</span>
              </div>
              <div className="bg-[#faf9f5] border border-primary-medium/15 rounded-2xl p-4 text-xs sm:text-sm text-primary-dark/85 leading-relaxed">
                {activeTask.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: activeTask.description }}
                    className="prose prose-sm max-w-none"
                  />
                ) : (
                  <span className="text-primary-medium/50 italic">
                    {t('taskDetail.noDescription')}
                  </span>
                )}
              </div>
            </div>

            {/* Attachments Section matching reference UI:
                Attachment (count)  ······  Download All
                [ Card 1 ] [ Card 2 ] [ + ] */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-dark">
                  <LuPaperclip className="w-4 h-4 text-primary-medium/70 shrink-0" />
                  <span>
                    {t('taskDetail.attachments', {
                      count: attachmentsList.length,
                    })}
                  </span>
                </div>

                {attachmentsList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="text-xs font-semibold text-primary-dark hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LuDownload className="w-3.5 h-3.5" />
                    <span>{t('taskDetail.downloadAll')}</span>
                  </button>
                )}
              </div>

              {/* Attachments Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachmentsList.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-2.5 bg-white border border-primary-medium/20 hover:border-primary-medium/40 rounded-xl p-2.5 shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileIconBadge name={att.name} type={att.type} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span
                          className="font-bold text-xs text-primary-dark block truncate"
                          title={att.name}
                        >
                          {att.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-primary-medium/70 mt-0.5">
                          <span>{att.formattedSize}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              toast.success(t('taskDetail.downloadSuccess'))
                            }
                            className="font-semibold text-primary-dark hover:underline cursor-pointer"
                          >
                            {t('taskDetail.download')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Plus button to add more files */}
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="h-16 border-2 border-dashed border-primary-medium/25 hover:border-primary-dark/40 bg-[#faf9f5] hover:bg-[#f3f1ec] rounded-xl flex items-center justify-center text-primary-medium/70 hover:text-primary-dark transition-all cursor-pointer shadow-2xs"
                  title={t('modal.addMore')}
                >
                  <LuPlus className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Bottom Tabs Section: Subtasks | Comments [count] | Activities */}
            <div className="pt-2 border-t border-primary-medium/10">
              {/* Tab Navigation */}
              <div className="flex items-center gap-6 border-b border-primary-medium/10 pb-2 select-none">
                {/* 1. Subtasks Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('subtasks')}
                  className={`relative pb-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'subtasks'
                      ? 'text-primary-dark'
                      : 'text-primary-medium/60 hover:text-primary-dark'
                  }`}
                >
                  <span>{t('taskDetail.subtasks')}</span>
                  {activeTab === 'subtasks' && (
                    <motion.div
                      layoutId="detailTabIndicator"
                      className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-primary-dark rounded-full"
                    />
                  )}
                </button>

                {/* 2. Comments Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`relative pb-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'comments'
                      ? 'text-primary-dark'
                      : 'text-primary-medium/60 hover:text-primary-dark'
                  }`}
                >
                  <span>{t('taskDetail.comments')}</span>
                  {commentsList.length > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-primary-surface text-primary-dark text-[10px] font-extrabold flex items-center justify-center border border-primary-medium/20 shadow-2xs">
                      {commentsList.length}
                    </span>
                  )}
                  {activeTab === 'comments' && (
                    <motion.div
                      layoutId="detailTabIndicator"
                      className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-primary-dark rounded-full"
                    />
                  )}
                </button>

                {/* 3. Activities Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('activities')}
                  className={`relative pb-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'activities'
                      ? 'text-primary-dark'
                      : 'text-primary-medium/60 hover:text-primary-dark'
                  }`}
                >
                  <span>{t('taskDetail.activities')}</span>
                  {activeTab === 'activities' && (
                    <motion.div
                      layoutId="detailTabIndicator"
                      className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-primary-dark rounded-full"
                    />
                  )}
                </button>
              </div>

              {/* Tab 1: Subtasks Content matching reference layout */}
              {activeTab === 'subtasks' && (
                <div className="py-4 space-y-3">
                  {/* Header: Design Process / Subtasks Title + Progress Fraction */}
                  <div className="flex items-center justify-between text-xs font-bold text-primary-dark">
                    <span>{t('taskDetail.designProcess')}</span>
                    <div className="flex items-center gap-1.5 text-primary-medium/80">
                      <span className="text-[11px] font-extrabold text-primary-dark">
                        {t('taskDetail.progress', {
                          completed: completedSubtasksCount,
                          total: subtasksList.length,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Subtask Items List */}
                  <div className="max-h-60 sm:max-h-72 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 p-0.5">
                    {subtasksList.length === 0 ? (
                      <div className="py-6 text-center text-xs text-primary-medium/60 border border-dashed border-primary-medium/20 rounded-xl">
                        {t('taskDetail.noSubtasks')}
                      </div>
                    ) : (
                      subtasksList.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="bg-[#faf9f5] border border-primary-medium/15 rounded-xl p-3 space-y-2 transition-all group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Completion Checkmark Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSubtask(subtask.id)}
                                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  subtask.completed
                                    ? 'bg-primary-dark text-white border border-primary-dark shadow-2xs'
                                    : 'border border-primary-medium/40 bg-white hover:border-primary-dark'
                                }`}
                              >
                                {subtask.completed && (
                                  <LuCheck className="w-3 h-3 stroke-[3]" />
                                )}
                              </button>

                              {/* Title */}
                              <span
                                className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                                  subtask.completed
                                    ? 'line-through text-primary-medium/50'
                                    : 'text-primary-dark'
                                }`}
                              >
                                {subtask.title}
                              </span>
                            </div>

                            {/* Delete on hover */}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                              className="p-1 rounded-md text-primary-medium/40 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title={t('modal.removeSubtask')}
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Optional Note / Blocker Card underneath */}
                          {subtask.note && (
                            <div className="pl-7">
                              <div className="bg-white border border-primary-medium/15 rounded-lg p-2 text-xs text-primary-dark/80 font-medium">
                                {subtask.note}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Subtask Row */}
                  {isAddingSubtask ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateSubtask();
                          if (e.key === 'Escape') setIsAddingSubtask(false);
                        }}
                        autoFocus
                        placeholder={t('modal.subtaskPlaceholder')}
                        className="flex-1 text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl px-3 py-2 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
                      />
                      <button
                        type="button"
                        onClick={handleCreateSubtask}
                        className="px-3.5 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold hover:bg-primary cursor-pointer shadow-2xs"
                      >
                        {t('modal.addTask')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingSubtask(false)}
                        className="p-2 rounded-xl text-primary-medium/60 hover:text-primary-dark hover:bg-primary-surface cursor-pointer"
                      >
                        <LuX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingSubtask(true)}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-dashed border-primary-medium/25 hover:border-primary-dark/40 bg-[#faf9f5] hover:bg-[#f3f1ec] text-xs font-semibold text-primary-dark/80 transition-all cursor-pointer shadow-2xs group"
                    >
                      <LuGitBranchPlus className="w-4 h-4 text-primary-medium/70 group-hover:text-primary-dark transition-colors shrink-0" />
                      <span>{t('taskDetail.addSubtask')}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Tab 2: Comments Content */}
              {activeTab === 'comments' && (
                <div className="py-4 space-y-4">
                  {commentsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-primary-medium/60 border border-dashed border-primary-medium/20 rounded-xl">
                      <LuMessageSquare className="w-6 h-6 mx-auto mb-2 text-primary-medium/40" />
                      <span>{t('taskDetail.noComments')}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {commentsList.map((comm) => (
                        <div
                          key={comm.id}
                          className="flex items-start gap-3 bg-[#faf9f5] border border-primary-medium/15 rounded-xl p-3"
                        >
                          {comm.userAvatar ? (
                            <Image
                              src={comm.userAvatar}
                              alt={comm.userName}
                              width={24}
                              height={24}
                              unoptimized
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {comm.userName.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-primary-dark">
                                {comm.userName}
                              </span>
                              <span className="text-[10px] text-primary-medium/60">
                                {formatCommentTime(comm.createdAt, locale)}
                              </span>
                            </div>
                            <p className="text-xs text-primary-dark/85 mt-1 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment();
                      }}
                      placeholder={t('taskDetail.addCommentPlaceholder')}
                      className="flex-1 text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl px-3 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
                    />
                    <button
                      type="button"
                      disabled={!commentText.trim()}
                      onClick={handleAddComment}
                      className="px-4 py-2.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
                    >
                      <LuSend className="w-3.5 h-3.5" />
                      <span>{t('taskDetail.send')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Activities Content */}
              {activeTab === 'activities' && (
                <div className="py-4 space-y-3">
                  <div className="flex items-start gap-3 bg-[#faf9f5] border border-primary-medium/15 rounded-xl p-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-primary-surface text-primary-dark flex items-center justify-center shrink-0">
                      <LuActivity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-primary-dark">
                        {activeTask.title}
                      </span>{' '}
                      <span className="text-primary-medium/70">
                        {t('taskDetail.wasCreatedOn', {
                          date: formatDetailDate(activeTask.createdAt, locale),
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#faf9f5] border border-primary-medium/15 rounded-xl p-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <LuClock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-primary-medium/70">
                        {t('taskDetail.currentStatusIs')}
                      </span>{' '}
                      <span className="font-bold text-primary-dark">
                        {t(STATUS_KEY_MAP[activeTask.status])}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* File Upload Modal for adding files to task */}
    <FileUploadModal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onAttachFiles={handleAttachFiles}
      initialAttachments={attachmentsList}
    />
  </>
);
}
