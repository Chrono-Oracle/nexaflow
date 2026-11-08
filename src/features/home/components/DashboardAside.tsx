'use client';

import { DynamicCalendarWidget } from './DynamicCalendarWidget';
import { AsideProjectCard } from './AsideProjectCard';

interface DashboardAsideProps {
  onCreateProject?: () => void;
}

export function DashboardAside({ onCreateProject }: DashboardAsideProps) {
  return (
    <div className="w-full space-y-6">
      {/* Dynamic Real-Time Calendar Widget */}
      <DynamicCalendarWidget />

      {/* Projects Spotlight Card Widget */}
      <AsideProjectCard onCreateProject={onCreateProject} />
    </div>
  );
}
