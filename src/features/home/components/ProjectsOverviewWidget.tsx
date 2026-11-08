'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LuCalendar, LuChevronRight } from 'react-icons/lu';
import { useProjectsQuery } from '@/hooks/useDashboardData';
import {
  getProjectStatusStyle,
  getProjectPriorityStyle,
} from '@/features/projects/utils/badgeStyles';
import { ProjectsEmptyState } from './ProjectsEmptyState';
import { ProjectDetailModal } from '@/features/projects/components/ProjectDetailModal';

export function ProjectsOverviewWidget() {
  const t = useTranslations('projectOverview');
  const locale = useLocale();

  // Read live projects from local storage state
  const { data: projects = [] } = useProjectsQuery();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

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

        {/* "View all" CTA Button (Replacing "New project") */}
        <Link
          href="/projects"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {t('viewAll')}
        </Link>
      </div>

      {/* Render Empty State when no project has been created */}
      {projects.length === 0 ? (
        <ProjectsEmptyState
          title={t('emptyTitle')}
          description={t('emptyDesc')}
        />
      ) : (
        /* Projects Table when populated with projects */
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full min-w-155 text-left border-collapse">
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
                    onClick={() => setSelectedProjectId(project.id)}
                    className="hover:bg-primary-surface/40 transition-colors group cursor-pointer"
                  >
                    {/* 1. Project Name & Subtitle */}
                    <td className="py-4 px-3 pl-0">
                      <div className="font-bold text-sm text-primary-dark tracking-tight">
                        {project.name}
                      </div>
                      <div className="text-xs text-primary-medium/65 mt-0.5 font-normal truncate max-w-50">
                        {project.description || project.manager?.name || 'Project'}
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

                    {/* 5. Deadline with Calendar Icon */}
                    <td className="py-4 px-3">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark/85">
                        <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70" />
                        <span>{formatDeadline(project.deadline)}</span>
                      </div>
                    </td>

                    {/* 6. Actions (View >) */}
                    <td className="py-4 px-3 pr-0 text-right">
                      <Link
                        href="/projects"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-medium/75 hover:text-primary-dark transition-colors"
                      >
                        <span>{t('view')}</span>
                        <LuChevronRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
}
