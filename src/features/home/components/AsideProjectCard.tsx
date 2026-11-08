'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  LuFilter,
  LuCalendar,
  LuArrowRight,
  LuCheck,
  LuFolderKanban,
  LuPlus,
  LuClock,
} from 'react-icons/lu';
import { Link } from '@/i18n/routing';
import { useProjectsQuery, useTasksQuery } from '@/hooks/useDashboardData';
import {
  getProjectStatusStyle,
  getProjectPriorityStyle,
} from '@/features/projects/utils/badgeStyles';
import { stripHtmlToPlainText } from '@/features/projects/utils/htmlSanitizer';
import { ProjectDetailModal } from '@/features/projects/components/ProjectDetailModal';
import { getAuthUsers } from '@/data/users';

interface AsideProjectCardProps {
  onCreateProject?: () => void;
}

export function AsideProjectCard({ onCreateProject }: AsideProjectCardProps) {
  const t = useTranslations('asideProjects');
  const tBadges = useTranslations('projectOverview');
  const locale = useLocale();

  // Read real projects and tasks from storage
  const { data: projects = [] } = useProjectsQuery();
  const { data: allTasks = [] } = useTasksQuery();

  // Manual project override ID (when selected from Filter dropdown)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Modal view details state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Time reference stored in state to keep rendering pure
  const [currentTime] = useState(() => Date.now());

  const todayStartTimestamp = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [currentTime]);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!isFilterOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterOpen]);

  // Find the project closer to the deadline (or the single project in the dashboard)
  const defaultTrackedProject = useMemo(() => {
    if (projects.length === 0) return null;
    if (projects.length === 1) return projects[0];

    // Prioritize active (non-completed) projects
    const activeProjects = projects.filter((p) => p.status !== 'Completed');
    const pool = activeProjects.length > 0 ? activeProjects : projects;

    // Sort projects:
    // 1. Projects with valid deadlines:
    //    - Overdue active projects (deadline < currentTime): urgent, sort by earliest
    //    - Upcoming active projects (deadline >= currentTime): sorted by closest upcoming due date
    // 2. Projects with no deadline: sorted by priority & creation date
    const sorted = [...pool].sort((a, b) => {
      const timeA = a.deadline ? new Date(a.deadline).getTime() : NaN;
      const timeB = b.deadline ? new Date(b.deadline).getTime() : NaN;

      const hasA = !isNaN(timeA);
      const hasB = !isNaN(timeB);

      if (hasA && hasB) {
        const aOverdue = timeA < currentTime;
        const bOverdue = timeB < currentTime;

        if (aOverdue && !bOverdue) return -1; // Overdue project needs immediate attention
        if (!aOverdue && bOverdue) return 1;

        // If both are overdue, or both are upcoming, the earlier deadline comes first
        return timeA - timeB;
      }

      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      // Priority fallback if neither has a deadline
      const priorityOrder: Record<string, number> = {
        Urgent: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };
      const pA = priorityOrder[a.priority || 'Medium'] || 2;
      const pB = priorityOrder[b.priority || 'Medium'] || 2;
      if (pA !== pB) return pB - pA;

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return sorted[0] || null;
  }, [projects, currentTime]);

  // Currently spotlighted project (manual override or auto closest deadline)
  const trackedProject = useMemo(() => {
    if (selectedProjectId) {
      const found = projects.find((p) => p.id === selectedProjectId);
      if (found) return found;
    }
    return defaultTrackedProject;
  }, [projects, selectedProjectId, defaultTrackedProject]);

  // Compute live metrics for the tracked project (Total, Completed, Blocked, Progress)
  const metrics = useMemo(() => {
    if (!trackedProject) {
      return { total: 0, completed: 0, blocked: 0, progress: 0 };
    }

    const projectTasks = allTasks.filter((t) => t.projectId === trackedProject.id);

    // Total tasks count
    const total =
      projectTasks.length > 0
        ? projectTasks.length
        : trackedProject.taskCount || trackedProject.subtasks?.length || 0;

    // Completed tasks count
    const completed =
      projectTasks.length > 0
        ? projectTasks.filter((t) => t.status === 'Completed').length
        : trackedProject.subtasks?.filter((s) => s.completed).length || 0;

    // Blocked tasks count: tasks in 'In Review', or overdue tasks that are not yet completed
    const blocked = projectTasks.filter((t) => {
      if (t.status === 'Completed') return false;
      const isOverdue = t.deadline && new Date(t.deadline).getTime() < todayStartTimestamp;
      const isInReview = t.status === 'In Review';
      return isOverdue || isInReview;
    }).length;

    // Progress percentage
    const progress =
      total > 0
        ? Math.round((completed / total) * 100)
        : trackedProject.progress || 0;

    return { total, completed, blocked, progress };
  }, [trackedProject, allTasks, todayStartTimestamp]);

  // Compute members/assignees list for the tracked project
  const memberAvatars = useMemo(() => {
    if (!trackedProject) return [];

    // 1. If project has explicit members assigned
    if (trackedProject.members && trackedProject.members.length > 0) {
      return trackedProject.members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar || '/Avatar.jpg',
        role: m.role,
      }));
    }

    // 2. If project has a manager
    if (trackedProject.manager) {
      return [
        {
          id: trackedProject.manager.id,
          name: trackedProject.manager.name,
          avatar: trackedProject.manager.avatar || '/Avatar.jpg',
          role: trackedProject.manager.role,
        },
      ];
    }

    // 3. Fallback to task assignees
    const authUsers = getAuthUsers();
    const taskAssigneeIds = new Set<string>();
    allTasks
      .filter((t) => t.projectId === trackedProject.id)
      .forEach((t) => {
        if (t.assigneeId) taskAssigneeIds.add(t.assigneeId);
        t.assigneeIds?.forEach((id) => taskAssigneeIds.add(id));
      });

    if (taskAssigneeIds.size > 0) {
      return authUsers
        .filter((u) => taskAssigneeIds.has(u.id))
        .map((u) => ({
          id: u.id,
          name: u.fullName,
          avatar: u.avatar || '/Avatar.jpg',
          role: u.title,
        }));
    }

    return [];
  }, [trackedProject, allTasks]);

  // Format deadline date nicely (e.g. "Mar 30" or "8 déc.")
  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const statusStyle = trackedProject
    ? getProjectStatusStyle(trackedProject.status)
    : getProjectStatusStyle('Pending');

  const priorityStyle = trackedProject
    ? getProjectPriorityStyle(trackedProject.priority || 'Medium')
    : getProjectPriorityStyle('Medium');

  return (
    <div className="w-full font-elms select-none">
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

        {/* Filter Button & Dropdown */}
        <div ref={filterMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            disabled={projects.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer ${
              projects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <LuFilter className="w-3.5 h-3.5 text-white" />
            <span>{t('filter')}</span>
          </button>

          {isFilterOpen && projects.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-primary-medium/15 p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-primary-medium/60 uppercase tracking-wider">
                Tracked Project
              </div>

              {/* Option 1: Auto (Closest Deadline) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null);
                  setIsFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  selectedProjectId === null
                    ? 'bg-primary-surface/60 text-primary-dark font-bold'
                    : 'text-primary-dark hover:bg-primary-surface/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-primary-surface/60 flex items-center justify-center text-primary-dark shrink-0">
                    <LuClock className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">Auto: Closest Deadline</div>
                    <div className="text-[10px] text-primary-medium/60 font-normal">
                      {defaultTrackedProject?.name || 'Default'}
                    </div>
                  </div>
                </div>
                {selectedProjectId === null && (
                  <LuCheck className="w-3.5 h-3.5 text-primary-dark shrink-0" />
                )}
              </button>

              {projects.length > 1 && (
                <>
                  <div className="my-1.5 border-t border-primary-medium/10" />
                  <div className="px-2 py-1 text-[11px] font-bold text-primary-medium/60 uppercase tracking-wider">
                    All Projects ({projects.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                    {projects.map((p) => {
                      const isSelected = selectedProjectId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-primary-surface/60 text-primary-dark font-bold'
                              : 'text-primary-dark hover:bg-primary-surface/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: p.color || '#26150b' }}
                            />
                            <span className="truncate">{p.name}</span>
                          </div>
                          {isSelected && (
                            <LuCheck className="w-3.5 h-3.5 text-primary-dark shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Project Card Container */}
      {!trackedProject ? (
        // Empty State when user has no projects
        <div className="bg-white rounded-2xl p-7 border border-primary-medium/15 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-surface/60 mx-auto flex items-center justify-center text-primary-dark">
            <LuFolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-dark">
              No projects to track
            </h3>
            <p className="text-xs text-primary-medium/60 mt-1 max-w-xs mx-auto leading-relaxed">
              Create your first project to start tracking deadlines, milestones, and task progress here.
            </p>
          </div>
          {onCreateProject ? (
            <button
              type="button"
              onClick={onCreateProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold hover:bg-primary transition-colors cursor-pointer shadow-xs"
            >
              <LuPlus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          ) : (
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold hover:bg-primary transition-colors cursor-pointer shadow-xs"
            >
              <LuPlus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>
          )}
        </div>
      ) : (
        // Live Project Spotlight Card
        <div className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs space-y-4">
          {/* Top: Project Title, Plain Text Subtitle & Status Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-primary-dark tracking-tight truncate">
                {trackedProject.name}
              </h3>
              <p className="text-xs text-primary-medium/70 mt-0.5 line-clamp-1">
                {stripHtmlToPlainText(trackedProject.description) ||
                  trackedProject.manager?.name ||
                  'Project'}
              </p>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs shrink-0 ${statusStyle.className}`}
            >
              {tBadges(statusStyle.labelKey)}
            </span>
          </div>

          {/* Progress Bar & Percentage */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-primary-medium/75">{t('progress')}</span>
              <span className="text-primary-dark font-bold">{metrics.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#edeae4] overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-dark transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, metrics.progress))}%`,
                }}
              />
            </div>
          </div>

          {/* 3-Column Metrics Row (Total, Completed, Blocked) */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-primary-medium/10 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-base sm:text-lg font-bold text-primary-dark">
                {String(metrics.total).padStart(2, '0')}
              </div>
              <div className="text-xs text-primary-medium/65 mt-0.5">
                {t('total')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-base sm:text-lg font-bold text-primary-dark">
                {String(metrics.completed).padStart(2, '0')}
              </div>
              <div className="text-xs text-primary-medium/65 mt-0.5">
                {t('completed')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-base sm:text-lg font-bold text-primary-dark">
                {String(metrics.blocked).padStart(2, '0')}
              </div>
              <div className="text-xs text-primary-medium/65 mt-0.5">
                {t('blocked')}
              </div>
            </div>
          </div>

          {/* Metadata Bottom Row: Deadline + Priority on left, User Avatars on right */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark/85">
                <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70 shrink-0" />
                <span className="truncate">{formatDeadline(trackedProject.deadline)}</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium shadow-2xs shrink-0 ${priorityStyle.className}`}
              >
                {tBadges(priorityStyle.labelKey)}
              </span>
            </div>

            {/* Overlapping User Avatars with fallback and overflow count */}
            <div className="flex items-center -space-x-2 shrink-0">
              {memberAvatars.length === 0 ? (
                <div className="w-7 h-7 rounded-full bg-primary-surface/60 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary-dark">
                  —
                </div>
              ) : (
                <>
                  {memberAvatars.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-2xs"
                      title={`${user.name} • ${user.role || 'Member'}`}
                    >
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {memberAvatars.length > 3 && (
                    <div
                      className="w-7 h-7 rounded-full bg-[#f4f2ec] border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary-dark shadow-2xs"
                      title={`${memberAvatars.length - 3} more members`}
                    >
                      +{memberAvatars.length - 3}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom CTA Button: Opens Project Detail Modal */}
          <button
            type="button"
            onClick={() => setIsDetailModalOpen(true)}
            className="w-full py-2.5 rounded-md bg-primary-surface/60 hover:bg-primary-surface text-primary-dark text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-primary-medium/10 mt-1 cursor-pointer group"
          >
            <span>{t('viewDetails')}</span>
            <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Project Detail Modal Integration */}
      <ProjectDetailModal
        project={trackedProject}
        isOpen={isDetailModalOpen && !!trackedProject}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
