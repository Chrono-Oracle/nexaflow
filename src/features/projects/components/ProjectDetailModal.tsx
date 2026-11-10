'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LuX,
  LuMaximize2,
  LuMinimize2,
  LuEllipsis,
  LuSquarePen,
  LuPlus,
  LuCheck,
  LuTrash2,
  LuClock,
  LuSend,
  LuShare2,
  LuEye,
  LuChevronDown,
  LuChevronRight,
  LuGripVertical,
  LuHourglass,
  LuChartPie,
  LuArrowRightToLine,
  LuDownload,
  LuPaperclip,
} from 'react-icons/lu';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectSubtask,
  ProjectComment,
  ProjectActivity,
  ProjectAttachment,
  ProjectAssignedMember,
} from '../types/project.types';
import { getCurrentUser } from '@/data/users';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useTasksQuery,
  useAddTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '@/hooks/useDashboardData';
import { FileIconBadge, FileUploadModal } from '@/components/ui/FileUpload';
import { AddTaskModal } from '@/features/tasks/components/AddTaskModal';
import { TaskAttachment, TaskStatus } from '@/features/tasks/types/task.types';
import { cleanTrailingEmptyHtml } from '../utils/htmlSanitizer';
import {
  getValidActivityDate,
  formatRealTimeRelative,
} from '../utils/activityTime';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (updated: Project) => void;
}

const ALL_STATUSES: ProjectStatus[] = [
  'In Progress',
  'Completed',
  'At Risk',
  'In Review',
  'Pending',
];

const ALL_PRIORITIES: ProjectPriority[] = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

function getStatusBadgeStyle(status: ProjectStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'In Progress':
      return { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', border: 'border-[#fef3c7]' };
    case 'Completed':
      return { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', border: 'border-[#a7f3d0]' };
    case 'At Risk':
      return { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', border: 'border-[#fecaca]' };
    case 'In Review':
      return { bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', border: 'border-[#bfdbfe]' };
    case 'Pending':
    default:
      return { bg: 'bg-[#f8fafc]', text: 'text-[#64748b]', border: 'border-[#e2e8f0]' };
  }
}

function getPriorityBadgeStyle(priority: ProjectPriority): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'Urgent':
      return { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', border: 'border-[#fecaca]' };
    case 'High':
      return { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', border: 'border-[#fef3c7]' };
    case 'Medium':
      return { bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', border: 'border-[#bfdbfe]' };
    case 'Low':
    default:
      return { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', border: 'border-[#a7f3d0]' };
  }
}

function formatDetailDate(dateStr?: string, locale: string = 'en'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function calculateTimeRemaining(deadline?: string): string {
  if (!deadline) return '—';
  const target = new Date(deadline).getTime();
  if (isNaN(target)) return '—';
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs < 0) return 'Overdue';
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}: ProjectDetailModalProps) {
  const t = useTranslations('projectsPage.detailModal');
  const locale = useLocale();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'task' | 'attachment' | 'comments'>('task');

  // Task section collapsed state
  const [isTaskCollapsed, setIsTaskCollapsed] = useState(false);

  // Quick add task input state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const addTaskInputRef = useRef<HTMLInputElement>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Dropdown states
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Maximize / standard modal toggle
  const [isMaximized, setIsMaximized] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Comment input state
  const [commentText, setCommentText] = useState('');

  // Editing title & description
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Clean description removing empty trailing tags/breaks
  const cleanedDescription = useMemo(() => {
    return cleanTrailingEmptyHtml(project?.description || '');
  }, [project?.description]);

  // Description expand/collapse state with read more blur
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const isDescriptionExpanded = expandedProjectId === project?.id;
  const setIsDescriptionExpanded = (expanded: boolean) => {
    setExpandedProjectId(expanded ? (project?.id || null) : null);
  };

  const [canExpand, setCanExpand] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = descriptionRef.current;
    if (el) {
      setCanExpand(el.scrollHeight > 96);
    }
  }, [cleanedDescription]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isStatusMenuOpen) {
          setIsStatusMenuOpen(false);
          return;
        }
        if (isPriorityMenuOpen) {
          setIsPriorityMenuOpen(false);
          return;
        }
        if (isMoreMenuOpen) {
          setIsMoreMenuOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isStatusMenuOpen, isPriorityMenuOpen, isMoreMenuOpen, onClose]);

  // Real-time ticker for activity timestamps (ticks every 5 seconds)
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus add task input when toggled open
  useEffect(() => {
    if (isAddingTask && addTaskInputRef.current) {
      addTaskInputRef.current.focus();
    }
  }, [isAddingTask]);

  // Tasks belonging to this project (from tasks store)
  const { data: projectTasks = [] } = useTasksQuery(project?.id);
  const addTaskMutation = useAddTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // Unified tasks list (combining tasks store items with any legacy project.subtasks)
  const tasks = useMemo(() => {
    const mapped = projectTasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.status === 'Completed',
      isFromTaskStore: true,
      rawTask: t,
    }));

    const legacy = (project?.subtasks || [])
      .filter(
        (s) =>
          !mapped.some(
            (m) =>
              m.id === s.id ||
              m.title.trim().toLowerCase() === s.title.trim().toLowerCase()
          )
      )
      .map((s) => ({
        id: s.id,
        title: s.title,
        completed: Boolean(s.completed),
        isFromTaskStore: false,
      }));

    return [...mapped, ...legacy];
  }, [projectTasks, project?.subtasks]);

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const calculatedProgress =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : project?.progress || 0;

  // Activities list directly from saved project data, or real project creation event
  const activities: ProjectActivity[] = useMemo(() => {
    if (project?.activities && project.activities.length > 0) {
      return project.activities;
    }
    if (project) {
      return [
        {
          id: `act_${project.id}`,
          actorName: project.manager?.name || currentUser.fullName,
          actorAvatar: project.manager?.avatar || currentUser.avatar,
          action: 'created project',
          target: project.name,
          timestamp: project.createdAt || project.startDate || new Date().toISOString(),
          badge: {
            type: 'create',
          },
        },
      ];
    }
    return [];
  }, [project, currentUser.fullName, currentUser.avatar]);

  // Assigned members list directly from saved project data
  const assignedMembers: ProjectAssignedMember[] = useMemo(() => {
    return project?.members || [];
  }, [project?.members]);

  // Split assigned members into Manager and Member groups
  const managers = useMemo(() => {
    return assignedMembers.filter((m) => m.role === 'Manager' || m.role === 'Owner');
  }, [assignedMembers]);

  const regularMembers = useMemo(() => {
    return assignedMembers.filter((m) => m.role === 'Member' || m.role === 'Members' || !m.role);
  }, [assignedMembers]);

  if (!isOpen || !project) return null;

  // Helper to persist updates
  const handleUpdate = async (updates: Partial<Project>) => {
    try {
      const updated = {
        ...project,
        ...updates,
      };
      await updateProjectMutation.mutateAsync({
        id: project.id,
        updates,
      });
      onUpdateProject?.(updated);
    } catch {
      toast.error('Failed to update project');
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskItem: {
    id: string;
    title: string;
    completed?: boolean;
    isFromTaskStore?: boolean;
  }) => {
    const nextCompleted = !taskItem.completed;
    const nextStatus: TaskStatus = nextCompleted ? 'Completed' : 'To Do';

    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: nextCompleted ? 'completed task' : 'reopened task',
      target: taskItem.title,
      timestamp: new Date().toISOString(),
      badge: {
        type: 'check',
        label: taskItem.title,
      },
    };

    if (taskItem.isFromTaskStore) {
      await updateTaskStatusMutation.mutateAsync({
        taskId: taskItem.id,
        status: nextStatus,
      });
    }

    const nextSubtasks = (project.subtasks || []).map((s) =>
      s.id === taskItem.id ? { ...s, completed: nextCompleted } : s
    );

    const updatedTasks = tasks.map((t) =>
      t.id === taskItem.id ? { ...t, completed: nextCompleted } : t
    );
    const newCompletedCount = updatedTasks.filter((t) => t.completed).length;
    const newProgress = Math.round((newCompletedCount / updatedTasks.length) * 100);

    handleUpdate({
      subtasks: nextSubtasks,
      progress: newProgress,
      activities: [newActivity, ...activities],
    });
  };

  // Add new task
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const title = newTaskTitle.trim();

    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: 'added task',
      target: title,
      timestamp: new Date().toISOString(),
      badge: {
        type: 'check',
        label: title,
      },
    };

    // Save as full Task in storage
    await addTaskMutation.mutateAsync({
      title,
      projectId: project.id,
      status: 'To Do',
      priority: 'Medium',
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      deadline: project.deadline || new Date().toISOString().split('T')[0],
    });

    // Also sync to project subtasks for legacy compatibility
    const newItem: ProjectSubtask = {
      id: generateId('sub'),
      title,
      completed: false,
    };
    const nextSubtasks = [...(project.subtasks || []), newItem];

    handleUpdate({
      subtasks: nextSubtasks,
      taskCount: (project.taskCount || 0) + 1,
      activities: [newActivity, ...activities],
    });

    setNewTaskTitle('');
    setIsAddingTask(false);
    toast.success('Task added');
  };

  // Save edited task title
  const handleSaveTaskTitle = async (taskItem: {
    id: string;
    title: string;
    isFromTaskStore?: boolean;
  }) => {
    if (!editingTaskTitle.trim()) return;
    const newTitle = editingTaskTitle.trim();
    if (newTitle === taskItem.title) {
      setEditingTaskId(null);
      return;
    }

    if (taskItem.isFromTaskStore) {
      await updateTaskMutation.mutateAsync({
        id: taskItem.id,
        updates: { title: newTitle },
      });
    }

    const nextSubtasks = (project.subtasks || []).map((s) =>
      s.id === taskItem.id ? { ...s, title: newTitle } : s
    );

    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: 'renamed task to',
      target: newTitle,
      timestamp: new Date().toISOString(),
    };

    handleUpdate({
      subtasks: nextSubtasks,
      activities: [newActivity, ...activities],
    });

    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  // Delete task
  const handleDeleteTask = async (taskItem: {
    id: string;
    title: string;
    isFromTaskStore?: boolean;
  }) => {
    if (taskItem.isFromTaskStore) {
      await deleteTaskMutation.mutateAsync(taskItem.id);
    }

    const nextSubtasks = (project.subtasks || []).filter((s) => s.id !== taskItem.id);
    const updatedTasks = tasks.filter((t) => t.id !== taskItem.id);
    const newCompletedCount = updatedTasks.filter((t) => t.completed).length;
    const newProgress =
      updatedTasks.length > 0
        ? Math.round((newCompletedCount / updatedTasks.length) * 100)
        : 0;

    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: 'deleted task',
      target: taskItem.title,
      timestamp: new Date().toISOString(),
    };

    handleUpdate({
      subtasks: nextSubtasks,
      progress: newProgress,
      taskCount: updatedTasks.length,
      activities: [newActivity, ...activities],
    });

    toast.info('Task deleted');
  };

  // Toggle reminder switch
  const handleToggleReminder = () => {
    const nextVal = !(project.reminderActive ?? false);
    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: nextVal ? 'activated reminder' : 'deactivated reminder',
      timestamp: new Date().toISOString(),
    };
    handleUpdate({
      reminderActive: nextVal,
      activities: [newActivity, ...activities],
    });
    if (nextVal) {
      toast.success('Reminder activated');
    } else {
      toast.info('Reminder deactivated');
    }
  };

  // Add comment
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: ProjectComment = {
      id: generateId('comm'),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextComments = [...(project.comments || []), newComment];
    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action: 'commented on project',
      timestamp: new Date().toISOString(),
    };
    handleUpdate({
      comments: nextComments,
      activities: [newActivity, ...activities],
    });
    setCommentText('');
    toast.success('Comment posted');
  };

  // Share link handler
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      toast.success(t('linkCopied'));
    }
  };

  // Save edited title
  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft.trim() !== project.name) {
      const newActivity: ProjectActivity = {
        id: generateId('act'),
        actorName: currentUser.fullName,
        actorAvatar: currentUser.avatar,
        action: 'renamed project to',
        target: titleDraft.trim(),
        timestamp: new Date().toISOString(),
      };
      handleUpdate({
        name: titleDraft.trim(),
        activities: [newActivity, ...activities],
      });
    }
    setIsEditingTitle(false);
  };

  // Upload attachments handler
  const handleUploadComplete = (newAttachments: TaskAttachment[]) => {
    const formatted: ProjectAttachment[] = newAttachments.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      formattedSize: a.formattedSize,
      type: a.type,
      url: a.url,
      uploadedAt: a.uploadedAt,
    }));
    const newActivity: ProjectActivity = {
      id: generateId('act'),
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      action:
        formatted.length === 1
          ? 'uploaded attachment'
          : `uploaded ${formatted.length} attachments`,
      target: formatted.length === 1 ? formatted[0].name : undefined,
      timestamp: new Date().toISOString(),
    };
    handleUpdate({
      attachments: [...(project.attachments || []), ...formatted],
      activities: [newActivity, ...activities],
    });
    setIsUploadModalOpen(false);
    toast.success('Attachments added');
  };

  const timeRemaining = calculateTimeRemaining(project.deadline);

  return (
    <>
      <AnimatePresence>
        {/* Backdrop with modern scroll containment */}
        <motion.div
          key="project-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] overflow-hidden"
          style={{ overscrollBehavior: 'contain' }}
        />

        {/* Modal Window Container */}
        <motion.div
          key="project-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ overscrollBehavior: 'contain' }}
          className={`fixed z-50 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-primary-medium/20 flex flex-col overflow-hidden font-elms ${
            isMaximized
              ? 'w-[98vw] h-[96vh] max-w-none max-h-none'
              : 'w-[94vw] max-w-5xl xl:max-w-6xl h-[88vh] max-h-[820px]'
          }`}
        >
          {/* ================================================================= */}
          {/* TOP HEADER BAR                                                    */}
          {/* ================================================================= */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-primary-medium/10 bg-white shrink-0 select-none">
            {/* Left Header Controls: Back/sidebar arrow, Fullscreen expand, Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-primary-medium/60 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
                title={t('close')}
                aria-label={t('close')}
              >
                <LuArrowRightToLine className="w-4 h-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                className="p-1 rounded-lg text-primary-medium/60 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
                title={isMaximized ? 'Minimize' : 'Maximize'}
                aria-label={isMaximized ? 'Minimize' : 'Maximize'}
              >
                {isMaximized ? (
                  <LuMinimize2 className="w-4 h-4" />
                ) : (
                  <LuMaximize2 className="w-4 h-4" />
                )}
              </button>
              <span className="text-xs font-semibold text-primary-medium/70 ml-1 truncate">
                {t('breadcrumb')}
              </span>
            </div>

            {/* Right Header Controls: Share, View count pill [👁 6], Ellipsis [...], Close [X] */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
                title={t('share')}
                aria-label={t('share')}
              >
                <LuShare2 className="w-4 h-4" />
              </button>

              {/* Viewers Pill */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-surface/30 border border-primary-medium/15 text-xs font-semibold text-primary-medium/80 select-none"
                title="Active viewers"
              >
                <LuEye className="w-3.5 h-3.5 text-primary-medium/70" />
                <span>{project.viewsCount ?? 1}</span>
              </div>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
                  title="More actions"
                  aria-label="More actions"
                >
                  <LuEllipsis className="w-4 h-4" />
                </button>
                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-primary-medium/15 py-1 z-30 font-elms">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        const newActivity: ProjectActivity = {
                          id: generateId('act'),
                          actorName: currentUser.fullName,
                          actorAvatar: currentUser.avatar,
                          action: 'marked project as completed',
                          timestamp: new Date().toISOString(),
                          badge: {
                            type: 'status_change',
                            from: project.status,
                            to: 'Completed',
                          },
                        };
                        handleUpdate({
                          status: 'Completed',
                          progress: 100,
                          activities: [newActivity, ...activities],
                        });
                        toast.success('Marked as completed');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-primary-dark hover:bg-primary-surface/50 transition-colors cursor-pointer"
                    >
                      {t('markCompleted')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        handleShare();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-primary-dark hover:bg-primary-surface/50 transition-colors cursor-pointer"
                    >
                      {t('share')}
                    </button>
                    <div className="h-px bg-primary-medium/10 my-1" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(t('deleteConfirm'))) {
                          setIsMoreMenuOpen(false);
                          await deleteProjectMutation.mutateAsync(project.id);
                          toast.success('Project deleted');
                          onClose();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      {t('deleteProject')}
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer ml-1"
                title={t('close')}
                aria-label={t('close')}
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* BODY: TWO-COLUMN LAYOUT (LEFT: MAIN CONTENT, RIGHT: STATS & FEED) */}
          {/* ================================================================= */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* --------------------------------------------------------------- */}
            {/* LEFT COLUMN: TITLE, DESCRIPTION, METADATA, TABS                 */}
            {/* --------------------------------------------------------------- */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col overflow-y-auto custom-scrollbar px-6 sm:px-8 py-5">
              {/* 1. Project Title */}
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
                      className="text-2xl sm:text-3xl font-bold text-primary-dark tracking-tight w-full bg-primary-surface/30 px-2 py-1 rounded-lg border border-primary-medium/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTitle}
                      className="px-3 py-1 bg-primary-dark text-white text-xs font-semibold rounded-md shadow-xs hover:bg-primary transition-colors cursor-pointer"
                    >
                      {t('save')}
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <h1
                      id="project-detail-title"
                      className="text-2xl sm:text-3xl font-bold text-primary-dark tracking-tight"
                    >
                      {project.name}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setTitleDraft(project.name);
                        setIsEditingTitle(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-primary-medium/60 hover:text-primary-dark transition-opacity cursor-pointer"
                      title={t('editTitle')}
                    >
                      <LuSquarePen className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Subtitle / Description with Expand / Minimise & Bottom Blur Fade */}
                {cleanedDescription ? (
                  <div className="relative mt-1.5">
                    <motion.div
                      initial={false}
                      animate={{
                        height: !isDescriptionExpanded && canExpand ? 96 : 'auto',
                      }}
                      transition={{
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={
                        !isDescriptionExpanded && canExpand
                          ? 'overflow-hidden select-none'
                          : 'overflow-hidden'
                      }
                    >
                      <div
                        ref={descriptionRef}
                        className="rich-text-editor-content text-xs sm:text-sm text-primary-dark/85 leading-relaxed max-w-2xl font-normal"
                        dangerouslySetInnerHTML={{ __html: cleanedDescription }}
                      />
                    </motion.div>

                    {/* Bottom Read More Blur / Fade Overlay with Dropdown Arrow */}
                    <AnimatePresence>
                      {!isDescriptionExpanded && canExpand && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          className="absolute -bottom-1 left-0 right-0 h-14 bg-gradient-to-t from-white via-white/85 to-transparent flex items-end justify-center pointer-events-none pb-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded(true)}
                            className="pointer-events-auto p-1 rounded-full text-primary-dark/75 hover:text-primary-dark bg-white/95 hover:bg-white border border-primary-medium/20 shadow-xs hover:shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                            title="Read more"
                            aria-label="Expand description"
                          >
                            <LuChevronDown className="w-4 h-4 text-primary-dark" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Minimise Arrow Button when Expanded */}
                    <AnimatePresence>
                      {isDescriptionExpanded && canExpand && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.92 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="flex justify-center mt-1"
                        >
                          <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded(false)}
                            className="p-1 rounded-full text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                            title="Minimise description"
                            aria-label="Minimise description"
                          >
                            <LuChevronDown className="w-4 h-4 rotate-180 text-primary-dark" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-primary-medium/50 italic mt-1.5">
                    No description provided.
                  </p>
                )}
              </div>

              {/* 2. Metadata Key-Value List matching uploaded UI */}
              <div className="space-y-2.5 mt-2.5 text-xs select-none">
                {/* Status Row */}
                <div className="flex items-center">
                  <span className="w-28 sm:w-32 text-primary-medium/60 font-medium">
                    {t('status')}
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusMenuOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs border transition-opacity cursor-pointer ${
                        getStatusBadgeStyle(project.status).bg
                      } ${getStatusBadgeStyle(project.status).text} ${
                        getStatusBadgeStyle(project.status).border
                      } hover:opacity-90`}
                    >
                      <span>{project.status}</span>
                      <LuChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                    {isStatusMenuOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-primary-medium/15 py-1 z-30">
                        {ALL_STATUSES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              if (st !== project.status) {
                                const newActivity: ProjectActivity = {
                                  id: generateId('act'),
                                  actorName: currentUser.fullName,
                                  actorAvatar: currentUser.avatar,
                                  action: 'changed status from',
                                  target: `${project.status} to ${st}`,
                                  timestamp: new Date().toISOString(),
                                  badge: {
                                    type: 'status_change',
                                    from: project.status,
                                    to: st,
                                  },
                                };
                                handleUpdate({
                                  status: st,
                                  progress: st === 'Completed' ? 100 : project.progress,
                                  activities: [newActivity, ...activities],
                                });
                              }
                              setIsStatusMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-primary-surface/50 transition-colors flex items-center justify-between cursor-pointer ${
                              st === project.status
                                ? 'text-primary font-bold'
                                : 'text-primary-dark'
                            }`}
                          >
                            <span>{st}</span>
                            {st === project.status && (
                              <LuCheck className="w-3 h-3 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Teams Row if any */}
                {project.teams && project.teams.length > 0 && (
                  <div className="flex items-start">
                    <span className="w-28 sm:w-32 text-primary-medium/60 font-medium pt-1">
                      Teams
                    </span>
                    <div className="flex-1 flex flex-wrap gap-2 min-w-0">
                      {project.teams.map((team) => (
                        <span
                          key={team.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-primary-medium/20 text-primary-dark shadow-2xs"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: team.color || '#3B82F6' }}
                          />
                          <span>{team.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned To Row - Split by Roles: Manager and Member */}
                <div className="flex items-start">
                  <span className="w-28 sm:w-32 text-primary-medium/60 font-medium pt-1">
                    {t('assignedTo')}
                  </span>
                  <div className="flex-1 space-y-2 min-w-0">
                    {assignedMembers.length === 0 ? (
                      <span className="text-xs text-primary-medium/50 italic pt-1 inline-block">
                        No members assigned
                      </span>
                    ) : (
                      <>
                        {/* Manager Group */}
                        {managers.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#f5efe6] text-primary-dark border border-primary-medium/20 tracking-wide shrink-0 self-start mt-0.5 min-w-[64px] text-center">
                              {managers.length > 1 ? 'Managers' : 'Manager'}
                            </span>
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-2 min-w-0">
                              {managers.map((member) => (
                                <div
                                  key={member.id}
                                  className="inline-flex items-center gap-1.5 min-w-0"
                                  title={member.name}
                                >
                                  <UserAvatar
                                    src={member.avatar}
                                    name={member.name}
                                    size="xs"
                                    className="border border-primary-medium/15 shadow-2xs"
                                  />
                                  <span className="text-xs font-semibold text-primary-dark truncate">
                                    {member.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Member Group */}
                        {regularMembers.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-primary-surface/50 text-primary-medium/80 border border-primary-medium/15 tracking-wide shrink-0 self-start mt-0.5 min-w-[64px] text-center">
                              {regularMembers.length > 1 ? 'Members' : 'Member'}
                            </span>
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-2 min-w-0">
                              {regularMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="inline-flex items-center gap-1.5 min-w-0"
                                  title={member.name}
                                >
                                  <UserAvatar
                                    src={member.avatar}
                                    name={member.name}
                                    size="xs"
                                    className="border border-primary-medium/15 shadow-2xs"
                                  />
                                  <span className="text-xs font-semibold text-primary-dark truncate">
                                    {member.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Start Date Row */}
                <div className="flex items-center">
                  <span className="w-28 sm:w-32 text-primary-medium/60 font-medium">
                    {t('startDate')}
                  </span>
                  <span className="text-xs font-semibold text-primary-dark">
                    {formatDetailDate(project.startDate || project.createdAt, locale)}
                  </span>
                </div>

                {/* Due Date Row */}
                <div className="flex items-center">
                  <span className="w-28 sm:w-32 text-primary-medium/60 font-medium">
                    {t('dueDate')}
                  </span>
                  <span className="text-xs font-semibold text-primary-dark">
                    {formatDetailDate(project.deadline, locale)}
                  </span>
                </div>

                {/* Priority Row */}
                <div className="flex items-center">
                  <span className="w-28 sm:w-32 text-primary-medium/60 font-medium">
                    {t('priority')}
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityMenuOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-xs border transition-opacity cursor-pointer ${
                        getPriorityBadgeStyle(project.priority || 'Low').bg
                      } ${getPriorityBadgeStyle(project.priority || 'Low').text} ${
                        getPriorityBadgeStyle(project.priority || 'Low').border
                      } hover:opacity-90`}
                    >
                      <span className="text-xs font-bold leading-none">+</span>
                      <span>{project.priority || 'Low'}</span>
                      <LuChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
                    </button>
                    {isPriorityMenuOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-primary-medium/15 py-1 z-30">
                        {ALL_PRIORITIES.map((pr) => (
                          <button
                            key={pr}
                            type="button"
                            onClick={() => {
                              if (pr !== (project.priority || 'Low')) {
                                const newActivity: ProjectActivity = {
                                  id: generateId('act'),
                                  actorName: currentUser.fullName,
                                  actorAvatar: currentUser.avatar,
                                  action: `updated priority to`,
                                  target: pr,
                                  timestamp: new Date().toISOString(),
                                };
                                handleUpdate({
                                  priority: pr,
                                  activities: [newActivity, ...activities],
                                });
                              }
                              setIsPriorityMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-primary-surface/50 transition-colors flex items-center justify-between cursor-pointer ${
                              pr === (project.priority || 'Low')
                                ? 'text-primary font-bold'
                                : 'text-primary-dark'
                            }`}
                          >
                            <span>{pr}</span>
                            {pr === (project.priority || 'Low') && (
                              <LuCheck className="w-3 h-3 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Tabs: [ Task ] [ Attachment ] [ Comments ] */}
              <div className="border-b border-primary-medium/15 pt-2 mt-5">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('task')}
                    className={`pb-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                      activeTab === 'task'
                        ? 'text-primary-dark font-bold'
                        : 'text-primary-medium/60 hover:text-primary-dark'
                    }`}
                  >
                    <span>Task</span>
                    {activeTab === 'task' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attachment')}
                    className={`pb-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                      activeTab === 'attachment'
                        ? 'text-primary-dark font-bold'
                        : 'text-primary-medium/60 hover:text-primary-dark'
                    }`}
                  >
                    <span>{t('tabs.attachment')}</span>
                    {activeTab === 'attachment' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    className={`pb-2.5 text-xs font-semibold transition-colors relative cursor-pointer ${
                      activeTab === 'comments'
                        ? 'text-primary-dark font-bold'
                        : 'text-primary-medium/60 hover:text-primary-dark'
                    }`}
                  >
                    <span>{t('tabs.comments')}</span>
                    {activeTab === 'comments' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark rounded-full" />
                    )}
                  </button>
                </div>
              </div>

              {/* 4. Tab Content */}
              <div className="flex-1 mt-3.5">
                {/* ---------------- TASK TAB ---------------- */}
                {activeTab === 'task' && (
                  <div className="space-y-4">
                    {/* Header Row: ▾ Task 1/3  ···  [+ Add Task] */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsTaskCollapsed((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-dark hover:text-primary transition-colors cursor-pointer select-none"
                      >
                        {isTaskCollapsed ? (
                          <LuChevronRight className="w-3.5 h-3.5 text-primary-medium/70" />
                        ) : (
                          <LuChevronDown className="w-3.5 h-3.5 text-primary-medium/70" />
                        )}
                        <span>
                          Task {completedTasksCount}/{totalTasksCount}
                        </span>
                      </button>

                      {/* Add Task button on right: Only visible when at least one task exists */}
                      {tasks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddTaskModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-primary-surface/40 hover:border-primary-medium/30 transition-all cursor-pointer shadow-2xs"
                        >
                          <LuPlus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Add Task Input Form */}
                    {isAddingTask && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary-medium/25 bg-primary-surface/20">
                        <input
                          ref={addTaskInputRef}
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTask();
                            if (e.key === 'Escape') setIsAddingTask(false);
                          }}
                          placeholder="Enter task title and press Enter..."
                          className="flex-1 bg-white px-3 py-1.5 text-xs font-medium text-primary-dark rounded-lg border border-primary-medium/20 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={handleAddTask}
                          className="px-3 py-1.5 bg-primary-dark text-white rounded-lg text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                        >
                          {t('add')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTaskTitle('');
                            setIsAddingTask(false);
                          }}
                          className="px-2.5 py-1.5 text-primary-medium/70 hover:text-primary-dark rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    )}

                    {/* Task Checklist Items */}
                    {!isTaskCollapsed && (
                      <div className="space-y-1">
                        {tasks.length === 0 ? (
                          <div className="py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 rounded-full bg-primary-surface/50 flex items-center justify-center text-primary-medium/60 mb-2.5">
                              <LuCheck className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-semibold text-primary-dark mb-1">
                              No tasks yet. Add one to track progress.
                            </p>
                            <p className="text-[11px] text-primary-medium/60 max-w-xs mb-3">
                              Break down this project into smaller tasks and track completion progress.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddTaskModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-dark text-white text-xs font-semibold hover:bg-primary transition-colors cursor-pointer shadow-2xs"
                            >
                              <LuPlus className="w-3.5 h-3.5" />
                              <span>Add Task</span>
                            </button>
                          </div>
                        ) : (
                          tasks.map((item) => {
                            const isEditing = editingTaskId === item.id;

                            return (
                              <div
                                key={item.id}
                                className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary-surface/30 transition-colors select-none"
                              >
                                {/* Left: Checkbox + Title */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTask(item)}
                                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                      item.completed
                                        ? 'bg-[#10b981] text-white shadow-2xs'
                                        : 'border border-primary-medium/30 hover:border-primary-medium/60 bg-white'
                                    }`}
                                  >
                                    {item.completed && (
                                      <LuCheck className="w-3 h-3 stroke-[3]" />
                                    )}
                                  </button>

                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editingTaskTitle}
                                      onChange={(e) =>
                                        setEditingTaskTitle(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter')
                                          handleSaveTaskTitle(item);
                                        if (e.key === 'Escape')
                                          setEditingTaskId(null);
                                      }}
                                      onBlur={() =>
                                        handleSaveTaskTitle(item)
                                      }
                                      autoFocus
                                      className="text-xs font-medium text-primary-dark bg-white px-2 py-1 rounded border border-primary-medium/30 flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  ) : (
                                    <span
                                      onClick={() => handleToggleTask(item)}
                                      className={`text-xs font-medium transition-colors cursor-pointer truncate ${
                                        item.completed
                                          ? 'text-primary-medium/50 line-through'
                                          : 'text-primary-dark'
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                  )}
                                </div>

                                {/* Right Hover Actions: Edit (Pencil), Delete (Trash), Drag Handle (Grip) */}
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-primary-medium/60 shrink-0 ml-2 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTaskId(item.id);
                                      setEditingTaskTitle(item.title);
                                    }}
                                    className="p-1 hover:text-primary-dark transition-colors cursor-pointer"
                                    title="Edit task"
                                  >
                                    <LuSquarePen className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(item)}
                                    className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Delete task"
                                  >
                                    <LuTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <div
                                    className="p-1 text-primary-medium/40 cursor-grab"
                                    title="Reorder"
                                  >
                                    <LuGripVertical className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- ATTACHMENT TAB ---------------- */}
                {activeTab === 'attachment' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-dark">
                        {t('tabs.attachment')} ({project.attachments?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-primary-surface/40 transition-all cursor-pointer shadow-2xs"
                      >
                        <LuPaperclip className="w-3.5 h-3.5" />
                        <span>{t('uploadAttachment')}</span>
                      </button>
                    </div>

                    {(!project.attachments || project.attachments.length === 0) ? (
                      <div className="py-8 text-center text-xs text-primary-medium/60">
                        {t('noAttachments')}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {project.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-primary-medium/15 bg-primary-surface/20 hover:bg-primary-surface/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileIconBadge name={att.name} type={att.type} />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-primary-dark truncate max-w-xs">
                                  {att.name}
                                </div>
                                <div className="text-[11px] text-primary-medium/60">
                                  {att.formattedSize}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {att.url && (
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="p-1.5 text-primary-medium/70 hover:text-primary-dark transition-colors"
                                  title="Download"
                                >
                                  <LuDownload className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = (project.attachments || []).filter(
                                    (a) => a.id !== att.id
                                  );
                                  const newActivity: ProjectActivity = {
                                    id: generateId('act'),
                                    actorName: currentUser.fullName,
                                    actorAvatar: currentUser.avatar,
                                    action: 'removed attachment',
                                    target: att.name,
                                    timestamp: new Date().toISOString(),
                                  };
                                  handleUpdate({
                                    attachments: filtered,
                                    activities: [newActivity, ...activities],
                                  });
                                }}
                                className="p-1.5 text-primary-medium/70 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- COMMENTS TAB ---------------- */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {/* Comments List */}
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {(!project.comments || project.comments.length === 0) ? (
                        <div className="py-8 text-center text-xs text-primary-medium/60">
                          {t('noComments')}
                        </div>
                      ) : (
                        project.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-primary-surface/20 border border-primary-medium/10"
                          >
                            <UserAvatar
                              src={comm.userAvatar}
                              name={comm.userName}
                              size="sm"
                              className="mt-0.5 border border-primary-medium/15 shadow-2xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary-dark">
                                  {comm.userName}
                                </span>
                                <span className="text-[11px] text-primary-medium/50">
                                  {new Date(comm.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-primary-medium/80 mt-1 leading-relaxed">
                                {comm.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Comment Input Box */}
                    <div className="flex items-center gap-2 pt-2 border-t border-primary-medium/10">
                      <UserAvatar
                        src={currentUser.avatar}
                        name={currentUser.fullName}
                        size="sm"
                        className="border border-primary-medium/15 shadow-2xs"
                      />
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment();
                        }}
                        placeholder={t('writeComment')}
                        className="flex-1 bg-primary-surface/30 px-3 py-1.5 text-xs text-primary-dark rounded-lg border border-primary-medium/20 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-primary-medium/40"
                      />
                      <button
                        type="button"
                        onClick={handleAddComment}
                        className="p-1.5 bg-primary-dark text-white rounded-lg hover:bg-primary transition-colors cursor-pointer"
                        title={t('send')}
                      >
                        <LuSend className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* RIGHT COLUMN: PROJECT STATS, ACTIVITIES, CREATED BY             */}
            {/* --------------------------------------------------------------- */}
            <div className="md:col-span-5 lg:col-span-4 border-t md:border-t-0 md:border-l border-primary-medium/10 bg-white flex flex-col justify-between overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="space-y-6">
                {/* 1. Project Stats Card */}
                <div>
                  <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider mb-2.5">
                    {t('projectStats')}
                  </h3>
                  <div className="bg-[#f8f9fa] border border-primary-medium/10 rounded-2xl p-4.5 space-y-4">
                    {/* Time Remaining */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-primary-medium/80 font-medium">
                        <LuHourglass className="w-4 h-4 text-primary-medium/60" />
                        <span>{t('timeRemaining')}</span>
                      </div>
                      <span className="font-bold text-xs text-primary-dark">
                        {timeRemaining}
                      </span>
                    </div>

                    {/* Activate Reminder Switch */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-primary-medium/10">
                      <span className="text-primary-medium/80 font-medium">
                        {t('activateReminder')}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={project.reminderActive ?? false}
                        onClick={handleToggleReminder}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          project.reminderActive ? 'bg-primary-dark' : 'bg-primary-medium/25'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            project.reminderActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Progress Section */}
                    <div className="pt-2 border-t border-primary-medium/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-primary-dark">
                          <LuChartPie className="w-3.5 h-3.5 text-primary-dark/70" />
                          <span>{t('progress')}</span>
                        </div>
                        <span className="font-bold text-xs text-primary-dark">
                          {calculatedProgress}%
                        </span>
                      </div>

                      {/* Styled Progress Bar matching uploaded UI */}
                      <div className="relative w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden flex items-center">
                        {/* Solid portion */}
                        <div
                          className="h-full bg-[#1E3A8A] rounded-full transition-all duration-300"
                          style={{ width: `${calculatedProgress}%` }}
                        />
                        {/* Segmented dashed effect matching reference styling */}
                        {calculatedProgress > 0 && calculatedProgress < 100 && (
                          <div
                            className="h-full w-8 shrink-0 bg-repeat-x opacity-90"
                            style={{
                              backgroundImage:
                                'repeating-linear-gradient(90deg, #1E3A8A 0px, #1E3A8A 2px, transparent 2px, transparent 4px)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Activities Card */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
                      {t('activities')}
                    </h3>
                    <LuClock className="w-3.5 h-3.5 text-primary-medium/60" />
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-primary-medium/15">
                    {activities.map((act) => {
                      const actDate = getValidActivityDate(
                        act,
                        project.createdAt,
                        project.id
                      );
                      const relativeTime = formatRealTimeRelative(
                        actDate,
                        new Date(currentTime)
                      );

                      return (
                        <div key={act.id} className="relative text-xs">
                          {/* Timeline Node Icon / Avatar */}
                          <div className="absolute -left-5 top-0.5 w-4.5 h-4.5 rounded-full overflow-hidden bg-white border border-primary-medium/20 flex items-center justify-center shrink-0">
                            {act.actorAvatar ? (
                              <Image
                                src={act.actorAvatar}
                                alt={act.actorName}
                                width={18}
                                height={18}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-primary-dark" />
                            )}
                          </div>

                          {/* Event Content */}
                          <div className="pl-2">
                            <div className="leading-snug">
                              <span className="font-bold text-primary-dark">
                                {act.actorName}
                              </span>{' '}
                              <span className="text-primary-medium/70 font-normal">
                                {act.action}
                              </span>{' '}
                              {act.target && (
                                <span className="font-bold text-primary-dark">
                                  {act.target}
                                </span>
                              )}
                            </div>
                            <div
                              className="text-[11px] text-primary-medium/50 mt-0.5 font-normal tabular-nums"
                              title={actDate.toLocaleString()}
                            >
                              {relativeTime}
                            </div>

                          {/* Event Badge / Transition Pill */}
                          {act.badge && act.badge.type === 'check' && (
                            <div className="mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] text-[11px] font-semibold">
                                <LuCheck className="w-3 h-3 stroke-[3]" />
                                <span>{act.badge.label}</span>
                              </span>
                            </div>
                          )}

                          {act.badge && act.badge.type === 'status_change' && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8] font-semibold">
                                {act.badge.from}
                              </span>
                              <span className="text-primary-medium/50">→</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] font-semibold">
                                {act.badge.to}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              {/* 3. Created by Section (Pinned at Bottom of Right Sidebar) */}
              <div className="pt-4 border-t border-primary-medium/10">
                <div className="text-[11px] font-medium text-primary-medium/60 mb-1.5">
                  {t('createdBy')}
                </div>
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={project.manager?.avatar || currentUser.avatar}
                    name={project.manager?.name || currentUser.fullName}
                    size="sm"
                    className="border border-primary-medium/15 shadow-2xs"
                  />
                  <span className="text-xs font-bold text-primary-dark">
                    {project.manager?.name || currentUser.fullName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Upload Modal Integration */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAttachFiles={handleUploadComplete}
        initialAttachments={(project.attachments as TaskAttachment[]) || []}
      />

      {/* Add Task Modal Integration */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultProjectId={project?.id}
      />
    </>
  );
}
