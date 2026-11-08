'use client';

import { useState, useMemo } from 'react';
import { useProjectsQuery } from '@/hooks/useDashboardData';
import { ProjectsHeader } from '@/features/projects/components/ProjectsHeader';
import { ProjectsTable } from '@/features/projects/components/ProjectsTable';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { ProjectDetailModal } from '@/features/projects/components/ProjectDetailModal';
import { ProjectStatus, ProjectPriority } from '@/features/projects/types/project.types';

export default function ProjectsPage() {
  const { data: projects = [] } = useProjectsQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'All'>('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

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

      {/* Main Projects Table / Empty State Container */}
      <ProjectsTable
        projects={filteredProjects}
        totalProjectsCount={projects.length}
        onNewProject={() => setIsCreateModalOpen(true)}
        onResetFilters={handleResetFilters}
        onProjectClick={(project) => setSelectedProjectId(project.id)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Project Detail Modal matching reference design */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
}
