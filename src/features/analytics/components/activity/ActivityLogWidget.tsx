'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LuMessageSquare,
  LuRefreshCw,
  LuFileUp,
  LuEllipsis,
  LuChevronDown,
} from 'react-icons/lu';
import {
  DetailedActivityItem,
  ActivityTabFilter,
} from '../../types/analytics.types';
import { ActivityItemRow } from './ActivityItemRow';

interface ActivityLogWidgetProps {
  activities: DetailedActivityItem[];
  onApproveAccess: (id: string, channelName: string) => void;
  onDenyAccess: (id: string, channelName: string) => void;
}

export function ActivityLogWidget({
  activities,
  onApproveAccess,
  onDenyAccess,
}: ActivityLogWidgetProps) {
  const [activeTab, setActiveTab] = useState<ActivityTabFilter>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week'>('today');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Measure tab button positions for strictly horizontal indicator translation
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [isReady, setIsReady] = useState(false);

  const tabs: {
    id: ActivityTabFilter;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'All' },
    { id: 'chats', label: 'Chats', icon: LuMessageSquare },
    { id: 'status', label: 'Status updates', icon: LuRefreshCw },
    { id: 'uploads', label: 'Uploads', icon: LuFileUp },
    { id: 'more', label: 'More', icon: LuEllipsis },
  ];

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
      setIsReady(true);
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    const rafId = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(rafId);
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const filteredActivities = activities.filter((act) => {
    if (activeTab === 'all') return true;
    return act.category === activeTab;
  });

  const timeLabels = {
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'This Week',
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-7 shadow-xs font-elms">
      {/* Header matching uploaded UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-medium/10">
        {/* Title + 2m ago pill */}
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg sm:text-xl font-bold text-primary-dark tracking-tight">
            Activity log
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800 text-[11px] font-bold">
            2m ago
          </span>
        </div>

        {/* Right Time Filter */}
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <span>{timeLabels[timeFilter]}</span>
            <LuChevronDown className="w-3.5 h-3.5 text-primary-medium/60" />
          </button>

          {isTimeDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-40 font-elms">
              {(['today', 'yesterday', 'week'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setTimeFilter(tf);
                    setIsTimeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    timeFilter === tf
                      ? 'bg-primary/10 text-primary-dark font-bold'
                      : 'text-primary-dark/80 hover:bg-neutral-50'
                  }`}
                >
                  {timeLabels[tf]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Filter Navigation Tabs Bar */}
      <div className="sticky top-0 z-30 -mx-5 sm:-mx-7 px-5 sm:px-7 bg-white rounded-t-2xl border-b border-primary-medium/10 shadow-xs">
        <div className="relative flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar pt-3 pb-2.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-9 px-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                  isActive
                    ? 'text-primary-dark font-bold'
                    : 'text-primary-medium/70 hover:text-primary-dark'
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
                {/* Fallback underline for initial SSR load before client measurement */}
                {!isReady && isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark rounded-full" />
                )}
              </button>
            );
          })}

          {/* Single animated underline indicator: strictly X-axis translation, zero Y displacement */}
          {isReady && (
            <motion.div
              initial={false}
              animate={{
                x: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 35,
                mass: 0.6,
              }}
              className="absolute bottom-0 left-0 h-0.5 bg-primary-dark rounded-full pointer-events-none"
            />
          )}
        </div>
      </div>

      {/* Activity Timeline List (Isolated stacking context to ensure all contents scroll strictly behind the sticky nav bar) */}
      <div className="pt-4 relative z-0 isolate">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs sm:text-sm text-primary-medium/60">
            No activities recorded in this category.
          </div>
        ) : (
          <div className="space-y-0">
            {filteredActivities.map((act, index) => (
              <ActivityItemRow
                key={act.id}
                activity={act}
                isLast={index === filteredActivities.length - 1}
                onApproveAccess={onApproveAccess}
                onDenyAccess={onDenyAccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
