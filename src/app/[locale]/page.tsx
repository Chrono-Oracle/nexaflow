'use client';

import { useState } from 'react';
import { WelcomeBanner } from '@/features/home/components/WelcomeBanner';
import { StatsGrid } from '@/features/home/components/StatsGrid';
import { ProjectsOverviewWidget } from '@/features/home/components/ProjectsOverviewWidget';
import { TasksOverviewWidget } from '@/features/home/components/TasksOverviewWidget';
import { DashboardAside } from '@/features/home/components/DashboardAside';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="font-elms w-full flex flex-col lg:h-full min-h-0">
      {/* Top Welcome Header Section */}
      <div className="shrink-0 mb-4 sm:mb-5">
        <WelcomeBanner onCreateProject={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Main Dashboard: Two-Section Layout with Independent Column Scrolling on Large Screens */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
        {/* Left Section: Overview Contents */}
        <section
          aria-label="Overview Contents"
          className="lg:col-span-8 xl:col-span-8 space-y-6 lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-y-auto overscroll-y-contain lg:pr-2 custom-scrollbar pb-6"
        >
          <StatsGrid />
          <ProjectsOverviewWidget onCreateProject={() => setIsCreateModalOpen(true)} />
          <TasksOverviewWidget />
        </section>

        {/* Right Section: Aside Bar */}
        <aside
          aria-label="Dashboard Aside"
          className="lg:col-span-4 xl:col-span-4 lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-y-auto overscroll-y-contain lg:pr-1 custom-scrollbar pb-6"
        >
          <DashboardAside onCreateProject={() => setIsCreateModalOpen(true)} />
        </aside>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
