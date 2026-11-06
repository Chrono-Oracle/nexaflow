'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectsQuery } from '@/hooks/useDashboardData';
import { ProjectsHeader } from '@/features/projects/components/ProjectsHeader';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { ProjectsEmptyState } from '@/features/home/components/ProjectsEmptyState';
import { ProjectStatus, ProjectPriority } from '@/features/projects/types/project.types';

export default function ProjectsPage() {
  const t = useTranslations('projectsPage');
  const tOverview = useTranslations('projectOverview');

  const { data: projects = [] } = useProjectsQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'All'>('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter (name, description, tags, manager name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(query);
        const matchesDesc = project.description?.toLowerCase().includes(query);
        const matchesManager = project.manager?.name.toLowerCase().includes(query);
        const matchesTag = project.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesName && !matchesDesc && !matchesManager && !matchesTag) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && project.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && project.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'All') count++;
    if (priorityFilter !== 'All') count++;
    return count;
  }, [searchQuery, statusFilter, priorityFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="font-elms w-full space-y-6 pb-12">
      {/* Top Header Toolbar Card matching uploaded UI & home page buttons */}
      <ProjectsHeader
        totalProjects={projects.length}
        onNewProject={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Projects Content Area */}
      <div>
        {projects.length === 0 ? (
          /* Render Empty State when no project exists */
          <div className="bg-white rounded-2xl p-8 border border-primary-medium/15 shadow-xs">
            <ProjectsEmptyState
              title={tOverview('emptyTitle')}
              description={tOverview('emptyDesc')}
              onAction={() => setIsCreateModalOpen(true)}
              actionLabel={t('newProject')}
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          /* When filters yield no match */
          <div className="bg-white rounded-2xl p-12 border border-primary-medium/15 shadow-xs text-center space-y-3">
            <h3 className="text-base font-bold text-primary-dark">
              {t('noProjectsFound')}
            </h3>
            <p className="text-xs text-primary-medium/70 max-w-md mx-auto">
              {t('noProjectsFoundDesc')}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all cursor-pointer"
              >
                {t('resetFilters')}
              </button>
            )}
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
