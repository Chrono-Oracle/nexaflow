'use client';

import { DynamicCalendarWidget } from './DynamicCalendarWidget';
import { AsideProjectCard } from './AsideProjectCard';

export function DashboardAside() {
  return (
    <div className="w-full space-y-6">
      {/* Dynamic Real-Time Calendar Widget */}
      <DynamicCalendarWidget />

      {/* Projects Spotlight Card Widget */}
      <AsideProjectCard />
    </div>
  );
}
