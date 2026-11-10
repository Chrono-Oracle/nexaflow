'use client';

import { toast } from 'sonner';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { AnalyticsHeader } from './AnalyticsHeader';
import { WorkCompletedChartCard } from './charts/WorkCompletedChartCard';
import { HoursLoggedChartCard } from './charts/HoursLoggedChartCard';
import { ProjectSummaryGaugeCard } from './charts/ProjectSummaryGaugeCard';
import { OperationsOverviewCard } from './operations/OperationsOverviewCard';
import { TeamWorkloadWidget } from './operations/TeamWorkloadWidget';
import { ActivityLogWidget } from './activity/ActivityLogWidget';

export function AnalyticsContainer() {
  const {
    workCompletedMetrics,
    hoursLoggedMetrics,
    projectSummaryMetrics,
    detailedActivities,
    workTimeframe,
    setWorkTimeframe,
    hoursFilter,
    setHoursFilter,
    projectSummaryFilter,
    setProjectSummaryFilter,
    projects,
    tasks,
    teams,
    handleApproveAccess,
    handleDenyAccess,
  } = useAnalyticsData();

  const handleRefresh = () => {
    toast.success('Analytics telemetry refreshed');
  };

  return (
    <div className="font-elms w-full flex flex-col lg:h-full min-h-0">
      {/* Top Header Section */}
      <div className="shrink-0 mb-4 sm:mb-5">
        <AnalyticsHeader onRefresh={handleRefresh} />
      </div>

      {/* Main Dashboard: Two-Section Layout matching HomePage */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
        {/* Left Section: Operational Telemetry & Activity Feed */}
        <section
          aria-label="Analytics Overview"
          className="lg:col-span-8 xl:col-span-8 space-y-6 lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-y-auto overscroll-y-contain lg:pr-2 custom-scrollbar pb-6"
        >
          {/* Top Row: Work Completed & Active Duration side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <WorkCompletedChartCard
              metrics={workCompletedMetrics}
              timeframe={workTimeframe}
              onTimeframeChange={setWorkTimeframe}
            />
            <HoursLoggedChartCard
              metrics={hoursLoggedMetrics}
              filter={hoursFilter}
              onFilterChange={setHoursFilter}
            />
          </div>

          {/* Operational Throughput */}
          <OperationsOverviewCard projects={projects} tasks={tasks} />

          {/* Activity Log Feed */}
          <ActivityLogWidget
            activities={detailedActivities}
            onApproveAccess={handleApproveAccess}
            onDenyAccess={handleDenyAccess}
          />
        </section>

        {/* Right Section: Project Summary & Team Capacity */}
        <aside
          aria-label="Analytics Aside"
          className="lg:col-span-4 xl:col-span-4 space-y-6 lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-y-auto overscroll-y-contain lg:pr-1 custom-scrollbar pb-6"
        >
          <ProjectSummaryGaugeCard
            metrics={projectSummaryMetrics}
            filter={projectSummaryFilter}
            onFilterChange={setProjectSummaryFilter}
          />
          <TeamWorkloadWidget teams={teams} tasks={tasks} projects={projects} />
        </aside>
      </div>
    </div>
  );
}
