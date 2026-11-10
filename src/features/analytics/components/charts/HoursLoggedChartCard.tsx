'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCircleHelp, LuChevronDown } from 'react-icons/lu';
import { HoursLoggedMetrics, DurationFilter } from '../../types/analytics.types';

interface HoursLoggedChartCardProps {
  metrics: HoursLoggedMetrics;
  filter: DurationFilter;
  onFilterChange: (filter: DurationFilter) => void;
}

export function HoursLoggedChartCard({
  metrics,
  filter,
  onFilterChange,
}: HoursLoggedChartCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const filterLabels: Record<DurationFilter, string> = {
    projects: 'Latest Project',
    tasks: 'Latest Task',
    all: 'All Active',
  };

  // SVG dimensions for wave chart
  const width = 340;
  const height = 90;

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-elms relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-dark">
            <span>Active Duration</span>
            <div className="group relative cursor-pointer text-primary-medium/40 hover:text-primary-dark">
              <LuCircleHelp className="w-3.5 h-3.5" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex px-2.5 py-1 bg-primary-dark text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-30">
                Elapsed running time of your latest project or active tasks
              </div>
            </div>
          </div>

          {/* Filter Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span>{filterLabels[filter]}</span>
              <LuChevronDown className="w-3.5 h-3.5 text-primary-medium/60" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-30 font-elms">
                {(['projects', 'tasks', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      onFilterChange(f);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      filter === f
                        ? 'bg-primary/10 text-primary-dark font-bold'
                        : 'text-primary-dark/80 hover:bg-neutral-50'
                    }`}
                  >
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Big Metric + Live Status Badge (No dollars) */}
        <div className="mt-4 flex items-center gap-2.5 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-dark tracking-tight" suppressHydrationWarning>
            {metrics.days > 0 ? `${metrics.days}d ` : ''}
            {metrics.hours}h {metrics.minutes}m
          </h2>
          {metrics.statusBadge.variant === 'active' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {metrics.statusBadge.label}
            </span>
          ) : metrics.statusBadge.variant === 'completed' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50">
              {metrics.statusBadge.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200/50">
              {metrics.statusBadge.label}
            </span>
          )}
        </div>

        {/* Clean Contextual Subtitle */}
        <p className="text-xs text-primary-medium/70 mt-1 truncate" title={metrics.comparisonText}>
          {metrics.comparisonText}
        </p>
      </div>

      {/* Smooth Wave Area Chart */}
      <div className="mt-6 pt-2 relative">
        <div className="w-full h-24 relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            suppressHydrationWarning
          >
            <defs>
              <linearGradient id="hoursWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Filled Gradient Area */}
            <motion.path
              d={metrics.svgArea}
              fill="url(#hoursWaveGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Smooth Stroke Curve */}
            <motion.path
              d={metrics.svgPath}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Highlighted Endpoint Marker (matching the ring on uploaded image) */}
            <circle
              cx={metrics.endpointMarker?.x ?? width}
              cy={metrics.endpointMarker?.y ?? 76}
              r="4.5"
              fill="#FFFFFF"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
          </svg>

          {/* Interactive points overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            {metrics.wavePoints.map((pt, idx) => (
              <div
                key={`${pt.label}-${idx}`}
                className="pointer-events-auto h-full flex flex-col justify-end items-center relative group cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {hoveredPointIndex === idx && (
                  <div className="absolute bottom-full mb-1 bg-primary-dark text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap z-30 pointer-events-none">
                    {pt.tooltip}
                  </div>
                )}
                <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 bg-[#8B5CF6] transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
