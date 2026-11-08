'use client';

import { useLocale, useTranslations } from 'next-intl';
import { LuCalendar, LuChevronRight } from 'react-icons/lu';
import { Project } from '../types/project.types';
import {
  getProjectStatusStyle,
  getProjectPriorityStyle,
} from '../utils/badgeStyles';
import { stripHtmlToPlainText } from '../utils/htmlSanitizer';
import { ProjectsEmptyState } from '@/features/home/components/ProjectsEmptyState';

interface ProjectsTableProps {
  projects: Project[];
  totalProjectsCount: number;
  onNewProject: () => void;
  onResetFilters?: () => void;
  onProjectClick?: (project: Project) => void;
}

export function ProjectsTable({
  projects,
  totalProjectsCount,
  onNewProject,
  onResetFilters,
  onProjectClick,
}: ProjectsTableProps) {
  const t = useTranslations('projectOverview');
  const tPage = useTranslations('projectsPage');
  const locale = useLocale();

  // Helper to format deadline dates nicely (e.g. "Apr 22" or "22 avr.")
  const formatDeadline = (dateStr: string) => {
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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-medium/15 shadow-xs font-elms">
      {/* 1. Empty State when zero projects exist in workspace */}
      {totalProjectsCount === 0 ? (
        <ProjectsEmptyState
          title={t('emptyTitle')}
          description={t('emptyDesc')}
          onAction={onNewProject}
          actionLabel={tPage('newProject')}
        />
      ) : projects.length === 0 ? (
        /* 2. When filters yield no match */
        <div className="py-12 text-center space-y-3 select-none">
          <h3 className="text-base font-bold text-primary-dark">
            {tPage('noProjectsFound')}
          </h3>
          <p className="text-xs text-primary-medium/70 max-w-md mx-auto">
            {tPage('noProjectsFoundDesc')}
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {tPage('resetFilters')}
            </button>
          )}
        </div>
      ) : (
        /* 3. Populated Projects Table matching uploaded UI */
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full min-w-160 text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-primary-medium/10 text-xs font-medium text-primary-medium/60">
                <th scope="col" className="py-3 px-3 pl-0 font-medium">
                  {t('columns.projectName')}
                </th>
                <th scope="col" className="py-3 px-3 font-medium">
                  {t('columns.status')}
                </th>
                <th scope="col" className="py-3 px-3 font-medium">
                  {t('columns.progress')}
                </th>
                <th scope="col" className="py-3 px-3 font-medium">
                  {t('columns.priority')}
                </th>
                <th scope="col" className="py-3 px-3 font-medium">
                  {t('columns.deadline')}
                </th>
                <th scope="col" className="py-3 px-3 pr-0 text-right font-medium">
                  {t('columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-medium/10">
              {projects.map((project) => {
                const statusStyle = getProjectStatusStyle(project.status);
                const priorityStyle = getProjectPriorityStyle(project.priority || 'Medium');

                return (
                  <tr
                    key={project.id}
                    onClick={() => onProjectClick?.(project)}
                    className="hover:bg-primary-surface/30 transition-colors group cursor-pointer"
                  >
                    {/* 1. Project Name & Subtitle */}
                    <td className="py-4 px-3 pl-0">
                      <div className="font-bold text-sm text-primary-dark tracking-tight group-hover:text-primary transition-colors">
                        {project.name}
                      </div>
                      <div className="text-xs text-primary-medium/65 mt-0.5 font-normal truncate max-w-56">
                        {stripHtmlToPlainText(project.description) || project.manager?.name || 'Project'}
                      </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs ${statusStyle.className}`}
                      >
                        {t(statusStyle.labelKey)}
                      </span>
                    </td>

                    {/* 3. Progress Bar & % */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-28 h-2 rounded-full bg-[#edeae4] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-dark transition-all duration-300"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-primary-dark/80 shrink-0 w-8 text-right">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </td>

                    {/* 4. Priority Badge */}
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs ${priorityStyle.className}`}
                      >
                        {t(priorityStyle.labelKey)}
                      </span>
                    </td>

                    {/* 5. Deadline */}
                    <td className="py-4 px-3">
                      <div className="inline-flex items-center gap-1.5 text-xs text-primary-dark/85 font-medium">
                        <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70" />
                        <span>{formatDeadline(project.deadline)}</span>
                      </div>
                    </td>

                    {/* 6. Action (View >) */}
                    <td className="py-4 px-3 pr-0 text-right">
                      <div className="inline-flex items-center gap-1 text-xs text-primary-medium/80 group-hover:text-primary-dark font-medium transition-colors">
                        <span>{t('view')}</span>
                        <LuChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
