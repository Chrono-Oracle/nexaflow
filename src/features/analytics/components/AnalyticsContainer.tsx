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
    <div className="w-full space-y-6 pb-16 font-elms">
      {/* Header */}
      <AnalyticsHeader onRefresh={handleRefresh} />

      {/* Top 3 Interactive Metric & Chart Cards (matching uploaded UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <ProjectSummaryGaugeCard
          metrics={projectSummaryMetrics}
          filter={projectSummaryFilter}
          onFilterChange={setProjectSummaryFilter}
        />
      </div>

      {/* Middle Operations & Telemetry Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <OperationsOverviewCard projects={projects} tasks={tasks} />
        </div>
        <div className="lg:col-span-1">
          <TeamWorkloadWidget teams={teams} tasks={tasks} />
        </div>
      </div>

      {/* Detailed Activity Log Feed (matching uploaded UI) */}
      <ActivityLogWidget
        activities={detailedActivities}
        onApproveAccess={handleApproveAccess}
        onDenyAccess={handleDenyAccess}
      />
    </div>
  );
}
