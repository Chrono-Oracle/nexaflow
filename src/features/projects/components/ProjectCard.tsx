'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { LuCalendar, LuTag } from 'react-icons/lu';
import { Project } from '../types/project.types';
import {
  getProjectStatusStyle,
  getProjectPriorityStyle,
} from '../utils/badgeStyles';
import { stripHtmlToPlainText } from '../utils/htmlSanitizer';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const tBadges = useTranslations('projectOverview');
  const tPage = useTranslations('projectsPage');
  const locale = useLocale();

  const statusStyle = getProjectStatusStyle(project.status);
  const priorityStyle = getProjectPriorityStyle(project.priority || 'Medium');

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 font-elms flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Top: Color Accent Pill + Status & Priority Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#735840' }}
              aria-hidden="true"
            />
            {project.tags && project.tags.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-medium/80 bg-primary-surface/40 px-2 py-0.5 rounded-md">
                <LuTag className="w-3 h-3 text-primary-medium/60" />
                <span className="truncate max-w-[100px]">{project.tags[0]}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${priorityStyle.className}`}
            >
              {tBadges(priorityStyle.labelKey)}
            </span>
            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${statusStyle.className}`}
            >
              {tBadges(statusStyle.labelKey)}
            </span>
          </div>
        </div>

        {/* Project Title & Description */}
        <div>
          <h2 className="text-base font-bold text-primary-dark group-hover:text-primary transition-colors tracking-tight line-clamp-1">
            {project.name}
          </h2>
          <p className="text-xs text-primary-medium/75 mt-1 line-clamp-2 leading-relaxed">
            {stripHtmlToPlainText(project.description) || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="space-y-3.5 pt-2 border-t border-primary-medium/10">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-primary-medium/75">{tPage('progress')}</span>
            <span className="text-primary-dark font-bold">{project.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#edeae4] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${project.progress}%`,
                backgroundColor: project.color || '#26150b',
              }}
            />
          </div>
        </div>

        {/* Footer Row: Manager Info + Deadline */}
        <div className="flex items-center justify-between pt-1 text-xs">
          {/* Manager Avatar + Name */}
          <div className="flex items-center gap-2 min-w-0">
            {project.manager?.avatar ? (
              <Image
                src={project.manager.avatar}
                alt={project.manager.name}
                width={22}
                height={22}
                unoptimized
                className="w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-primary-medium/15"
              />
            ) : (
              <span className="w-5.5 h-5.5 rounded-full bg-primary-dark text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {(project.manager?.name || 'U').slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-medium text-primary-dark/85 truncate max-w-[110px]">
              {project.manager?.name || 'Unassigned'}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-1.5 text-primary-medium/80 shrink-0 font-medium">
            <LuCalendar className="w-3.5 h-3.5 text-primary-medium/60" />
            <span>{formatDeadline(project.deadline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
