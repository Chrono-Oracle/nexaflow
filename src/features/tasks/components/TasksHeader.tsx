'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LuKanban, LuTable, LuList, LuSearch, LuPlus } from 'react-icons/lu';

export type TaskViewMode = 'board' | 'table' | 'list';

interface TasksHeaderProps {
  activeView: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTask?: () => void;
}

const VIEW_TABS = [
  {
    id: 'board' as const,
    labelKey: 'views.board' as const,
    icon: LuKanban,
    iconBg: 'bg-[#2563eb]', // Rich Blue
    desktopOnly: false,
  },
  {
    id: 'table' as const,
    labelKey: 'views.table' as const,
    icon: LuTable,
    iconBg: 'bg-[#10b981]', // Emerald Green
    desktopOnly: true,
  },
  {
    id: 'list' as const,
    labelKey: 'views.list' as const,
    icon: LuList,
    iconBg: 'bg-[#64748b]', // Slate Gray
    desktopOnly: false,
  },
];

export function TasksHeader({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onAddTask,
}: TasksHeaderProps) {
  const t = useTranslations('tasksPage');

  return (
    <div
      data-tasks-header
      className="sticky top-[112px] md:top-[72px] z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:px-6 sm:py-3.5 border border-primary-medium/15 shadow-xs font-elms transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Views Tabs (Board, Table [md+ only], List) - fixed in position without horizontal scroll */}
        <div className="flex items-center gap-1 sm:gap-2 border-b md:border-b-0 border-primary-medium/10 pb-2 md:pb-0 shrink-0">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                className={`relative ${
                  tab.desktopOnly ? 'hidden md:flex' : 'flex'
                } items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none shrink-0 ${
                  isActive
                    ? 'text-primary-dark font-bold'
                    : 'text-primary-medium/70 hover:text-primary-dark hover:bg-primary-surface/30'
                }`}
              >
                {/* View Colored Square Icon Badge matching uploaded UI */}
                <div
                  className={`w-5 h-5 rounded-md ${tab.iconBg} text-white flex items-center justify-center shadow-2xs shrink-0`}
                  aria-hidden="true"
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>

                <span>{t(tab.labelKey)}</span>

                {/* Animated Active Underline Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeTaskViewTab"
                    className="absolute -bottom-2 md:-bottom-3.5 left-2 right-2 h-0.5 bg-primary-dark rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Search Task Field + Add Task Button */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
          {/* Search Task Input */}
          <div className="relative flex items-center flex-1 md:w-64 max-w-xs">
            <LuSearch
              className="absolute left-3 w-4 h-4 text-primary-medium/60 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-9.5 pl-9 pr-3 rounded-md bg-primary-surface/30 hover:bg-primary-surface/50 focus:bg-white border border-primary-medium/20 text-xs sm:text-sm text-primary-dark placeholder:text-primary-medium/60 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
            />
          </div>

          {/* Add Task Button (Consistent Styling) */}
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary-dark text-white text-xs sm:text-sm font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
          >
            <LuPlus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>{t('addTask')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
