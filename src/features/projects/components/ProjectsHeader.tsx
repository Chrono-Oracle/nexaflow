'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LuListFilter, LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { ProjectStatus, ProjectPriority } from '../types/project.types';

interface ProjectsHeaderProps {
  totalProjects: number;
  onNewProject: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ProjectStatus | 'All';
  onStatusFilterChange: (status: ProjectStatus | 'All') => void;
  priorityFilter: ProjectPriority | 'All';
  onPriorityFilterChange: (priority: ProjectPriority | 'All') => void;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const STATUS_OPTIONS: (ProjectStatus | 'All')[] = [
  'All',
  'In Progress',
  'Completed',
  'In Review',
  'At Risk',
  'Pending',
];

const PRIORITY_OPTIONS: (ProjectPriority | 'All')[] = [
  'All',
  'Urgent',
  'High',
  'Medium',
  'Low',
];

export function ProjectsHeader({
  totalProjects,
  onNewProject,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  isFiltersOpen,
  onToggleFilters,
  onResetFilters,
  activeFilterCount,
}: ProjectsHeaderProps) {
  const t = useTranslations('projectsPage');
  const tOverview = useTranslations('projectOverview');

  return (
    <div
      data-projects-header
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:px-6 sm:py-3.5 border border-primary-medium/15 shadow-xs font-elms transition-all"
    >
      {/* Main Top Header Bar matching reference UI */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Total Projects (0 when zero, 01, 02... from 1) */}
        <div className="flex items-center gap-2 select-none">
          <h1 className="text-base sm:text-lg font-bold text-primary-dark tracking-tight">
            <span>{t('totalProjects')}</span>{' '}
            <span className="font-bold text-primary-dark">
              ({totalProjects === 0 ? '0' : String(totalProjects).padStart(2, '0')})
            </span>
          </h1>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Filters Button */}
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={isFiltersOpen}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md border text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${
              isFiltersOpen || activeFilterCount > 0
                ? 'bg-[#f0ece4] border-primary-dark/40 text-primary-dark font-semibold'
                : 'bg-white border-primary-medium/20 text-primary-dark hover:bg-primary-surface/40 hover:border-primary-medium/40'
            }`}
          >
            <LuListFilter className="w-4 h-4 text-primary-medium/80 shrink-0" />
            <span>{t('filters')}</span>
            {activeFilterCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-primary-dark text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* New Project CTA Button (Themed with rounded-md as on home page) */}
          <button
            type="button"
            onClick={onNewProject}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-primary-dark text-white text-xs sm:text-sm font-medium shadow-md hover:bg-primary transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shrink-0"
          >
            <LuPlus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>{t('newProject')}</span>
          </button>
        </div>
      </div>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-primary-medium/10 pt-3.5 space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex items-center flex-1 max-w-md">
                <LuSearch
                  className="absolute left-3 w-4 h-4 text-primary-medium/60 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-primary-surface/30 hover:bg-primary-surface/50 focus:bg-white border border-primary-medium/20 text-xs sm:text-sm text-primary-dark placeholder:text-primary-medium/60 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 p-1 rounded hover:bg-primary-surface/60 text-primary-medium/60 hover:text-primary-dark"
                  >
                    <LuX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reset Filters CTA if any filter is active */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs text-primary-medium/80 hover:text-primary-dark font-medium underline self-start md:self-auto cursor-pointer"
                >
                  {t('resetFilters')}
                </button>
              )}
            </div>

            {/* Filter Pills Rows */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-xs">
              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-primary-medium/70 font-medium shrink-0">
                  {t('filterByStatus')}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = statusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onStatusFilterChange(st)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary-dark text-white font-semibold shadow-2xs'
                            : 'bg-primary-surface/35 text-primary-dark/80 hover:bg-primary-surface/60 hover:text-primary-dark border border-primary-medium/15'
                        }`}
                      >
                        {st === 'All'
                          ? t('allStatus')
                          : tOverview(`status.${st === 'In Progress' ? 'inProgress' : st === 'At Risk' ? 'atRisk' : st === 'In Review' ? 'inReview' : st.toLowerCase()}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                <span className="text-primary-medium/70 font-medium shrink-0">
                  {t('filterByPriority')}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRIORITY_OPTIONS.map((pr) => {
                    const isSelected = priorityFilter === pr;
                    return (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => onPriorityFilterChange(pr)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary-dark text-white font-semibold shadow-2xs'
                            : 'bg-primary-surface/35 text-primary-dark/80 hover:bg-primary-surface/60 hover:text-primary-dark border border-primary-medium/15'
                        }`}
                      >
                        {pr === 'All'
                          ? t('allPriorities')
                          : tOverview(`priority.${pr.toLowerCase()}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
