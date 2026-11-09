'use client';

import { LuArrowLeft, LuRefreshCw } from 'react-icons/lu';
import { Link } from '@/i18n/routing';

interface AnalyticsHeaderProps {
  onRefresh?: () => void;
}

export function AnalyticsHeader({ onRefresh }: AnalyticsHeaderProps) {
  return (
    <div className="space-y-2.5 font-elms">
      {/* Back to dashboard navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-dark/80 hover:text-primary-dark transition-colors cursor-pointer group"
        >
          <LuArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary-dark" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight">
            Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-primary-medium/70 mt-1">
            Real-time performance telemetry, operational throughput, and cross-dashboard activity feed
          </p>
        </div>

        {/* Live status badge & refresh button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/50 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg border border-primary-medium/20 text-primary-medium/70 hover:text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <LuRefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
