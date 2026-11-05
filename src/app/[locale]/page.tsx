'use client';

import { WelcomeBanner } from '@/features/home/components/WelcomeBanner';
import { StatsGrid } from '@/features/home/components/StatsGrid';
import { DashboardAside } from '@/features/home/components/DashboardAside';

export default function HomePage() {
  return (
    <div className="font-elms w-full space-y-6">
      {/* Top Welcome Header Section */}
      <WelcomeBanner />

      {/* Main Dashboard: Two-Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Overview Contents */}
        <section
          aria-label="Overview Contents"
          className="lg:col-span-8 xl:col-span-8 space-y-6"
        >
          <StatsGrid />
        </section>

        {/* Right Section: Aside Bar */}
        <aside
          aria-label="Dashboard Aside"
          className="lg:col-span-4 xl:col-span-4 space-y-6"
        >
          <DashboardAside />
        </aside>
      </div>
    </div>
  );
}
