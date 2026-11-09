'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCircleHelp, LuChevronDown } from 'react-icons/lu';
import { ProjectSummaryMetrics, ProjectFilter } from '../../types/analytics.types';

interface ProjectSummaryGaugeCardProps {
  metrics: ProjectSummaryMetrics;
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
}

export function ProjectSummaryGaugeCard({
  metrics,
  filter,
  onFilterChange,
}: ProjectSummaryGaugeCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredTickId, setHoveredTickId] = useState<number | null>(null);

  const filterLabels: Record<ProjectFilter, string> = {
    all: 'All',
    active: 'Active',
    completed: 'Done',
  };

  const getTickFill = (status: 'completed' | 'in-progress' | 'early') => {
    switch (status) {
      case 'completed':
        return '#8B5CF6'; // Purple
      case 'in-progress':
        return '#5EEAD4'; // Mint / Teal
      case 'early':
      default:
        return '#FCD34D'; // Yellow / Amber
    }
  };

  // Center coordinates and radius for the gauge
  const cx = 150;
  const cy = 135;
  const radius = 95;

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-elms relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-dark">
            <span>Project Summary</span>
            <div className="group relative cursor-pointer text-primary-medium/40 hover:text-primary-dark">
              <LuCircleHelp className="w-3.5 h-3.5" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex px-2.5 py-1 bg-primary-dark text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-30">
                Aggregated milestone health across all project spaces
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
              <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-30 font-elms">
                {(['all', 'active', 'completed'] as ProjectFilter[]).map((f) => (
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
      </div>

      {/* Radial Semi-Circle Speedometer Gauge */}
      <div className="relative flex flex-col items-center justify-center my-auto pt-2">
        <svg
          viewBox="0 0 300 155"
          className="w-full max-w-[280px] h-auto overflow-visible select-none"
        >
          {metrics.gaugeTicks.map((tick) => {
            const rad = (tick.angle * Math.PI) / 180;
            const x = cx + radius * Math.cos(rad);
            const y = cy - radius * Math.sin(rad);
            const rotation = 90 - tick.angle;
            const isHovered = hoveredTickId === tick.id;

            return (
              <motion.g
                key={tick.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isHovered ? 1.15 : 1 }}
                transition={{ duration: 0.25, delay: tick.id * 0.015 }}
                onMouseEnter={() => setHoveredTickId(tick.id)}
                onMouseLeave={() => setHoveredTickId(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x - 2.5}
                  y={y - 8}
                  width="5"
                  height="16"
                  rx="2.5"
                  fill={getTickFill(tick.status)}
                  transform={`rotate(${rotation} ${x} ${y})`}
                  className="transition-colors hover:opacity-90"
                />
              </motion.g>
            );
          })}
        </svg>

        {/* Center Text inside Arc */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-[11px] font-semibold text-primary-medium/70">
            Project Completion
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-dark tracking-tight leading-none mt-1">
            {metrics.averageCompletionRate}%
          </h2>
        </div>
      </div>

      {/* Bottom Color Legends matching uploaded image */}
      <div className="pt-3 border-t border-primary-medium/10 flex items-center justify-center gap-4 text-xs font-semibold text-primary-medium/80 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5EEAD4]" />
          <span>&gt;50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
