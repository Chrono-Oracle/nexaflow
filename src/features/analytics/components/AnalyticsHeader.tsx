'use client';

import { LuRefreshCw } from 'react-icons/lu';

interface AnalyticsHeaderProps {
  onRefresh?: () => void;
}

export function AnalyticsHeader({ onRefresh }: AnalyticsHeaderProps) {
  return (
    <div
      data-analytics-header
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:px-6 sm:py-3.5 border border-primary-medium/15 shadow-xs font-elms transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-2 select-none">
          <h1 className="text-base sm:text-lg font-bold text-primary-dark tracking-tight">
            Analytics & Operations
          </h1>
        </div>

        {/* Right: Live Sync Badge & Refresh Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/50 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md bg-primary-dark text-white text-xs sm:text-sm font-medium shadow-md hover:bg-primary transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shrink-0"
              title="Refresh telemetry"
            >
              <LuRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
