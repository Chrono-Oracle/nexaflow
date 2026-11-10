'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCircleHelp, LuChevronDown } from 'react-icons/lu';
import { WorkCompletedMetrics, TimeframeFilter } from '../../types/analytics.types';

interface WorkCompletedChartCardProps {
  metrics: WorkCompletedMetrics;
  timeframe: TimeframeFilter;
  onTimeframeChange: (timeframe: TimeframeFilter) => void;
}

export function WorkCompletedChartCard({
  metrics,
  timeframe,
  onTimeframeChange,
}: WorkCompletedChartCardProps) {
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBarColorClass = (color: 'purple' | 'amber' | 'neutral') => {
    switch (color) {
      case 'purple':
        return 'bg-[#7C3AED] hover:bg-[#6D28D9]';
      case 'amber':
        return 'bg-[#F59E0B] hover:bg-[#D97706]';
      case 'neutral':
      default:
        return 'bg-neutral-200 hover:bg-neutral-300';
    }
  };

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-elms relative">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-dark">
            <span>Work Completed</span>
            <div className="group relative cursor-pointer text-primary-medium/40 hover:text-primary-dark">
              <LuCircleHelp className="w-3.5 h-3.5" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex px-2.5 py-1 bg-primary-dark text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-30">
                Calculates completion rate of active tasks and project deliverables
              </div>
            </div>
          </div>

          {/* Timeframe Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span>{timeframeLabels[timeframe]}</span>
              <LuChevronDown className="w-3.5 h-3.5 text-primary-medium/60" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-30 font-elms">
                {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onTimeframeChange(t);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      timeframe === t
                        ? 'bg-primary/10 text-primary-dark font-bold'
                        : 'text-primary-dark/80 hover:bg-neutral-50'
                    }`}
                  >
                    {timeframeLabels[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Big Percentage Metric */}
        <div className="mt-4 flex items-baseline gap-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-dark tracking-tight">
            {metrics.rate}%
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-primary-medium/70 mt-1">
          {metrics.comparisonText}
        </p>
      </div>

      {/* Histogram Bar Graphic */}
      <div className="mt-8 pt-4">
        {metrics.histogramBars.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-xs text-primary-medium/60 font-medium">
            No work logged for this period
          </div>
        ) : (
          <div className="relative h-24 flex items-end gap-1.5 sm:gap-2 px-1">
            {metrics.histogramBars.map((bar) => {
              const isHovered = hoveredBarId === bar.id;
              const maxBarWidth =
                metrics.histogramBars.length <= 8
                  ? 'max-w-[20px]'
                  : metrics.histogramBars.length <= 14
                  ? 'max-w-[14px]'
                  : 'max-w-[9px]';

              return (
                <div
                  key={bar.id}
                  onMouseEnter={() => setHoveredBarId(bar.id)}
                  onMouseLeave={() => setHoveredBarId(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-primary-dark text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                      {bar.tooltip}
                    </div>
                  )}

                  {/* Animated Bar with pill radius */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.value}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`w-full min-w-[5px] ${maxBarWidth} rounded-full transition-all ${getBarColorClass(
                      bar.color
                    )} ${isHovered ? 'scale-y-105 shadow-xs' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
