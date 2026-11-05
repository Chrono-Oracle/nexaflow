'use client';

import { DynamicCalendarWidget } from './DynamicCalendarWidget';

export function DashboardAside() {
  return (
    <div className="w-full space-y-6">
      {/* Dynamic Real-Time Calendar Widget */}
      <DynamicCalendarWidget />
    </div>
  );
}
