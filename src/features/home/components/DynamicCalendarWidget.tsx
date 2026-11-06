'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
  LuPlus,
  LuChevronLeft,
  LuChevronRight,
  LuCalendarDays,
  LuClock,
} from 'react-icons/lu';
import { useProjectsQuery, useTasksQuery } from '@/hooks/useDashboardData';

interface DynamicCalendarWidgetProps {
  onAddEvent?: () => void;
}

// Spring animation variants for swipe with mild bounce effect on x-axis
const swipeVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function DynamicCalendarWidget({ onAddEvent }: DynamicCalendarWidgetProps) {
  const t = useTranslations('calendar');
  const locale = useLocale();

  const { data: projects = [] } = useProjectsQuery();
  const { data: tasks = [] } = useTasksQuery();

  // Current real-time date
  const [realtimeNow, setRealtimeNow] = useState(() => new Date());

  // Navigation state (month & year) and transition direction (-1 for prev, 1 for next)
  const [viewDate, setViewDate] = useState(() => new Date());
  const [direction, setDirection] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Update real-time date every minute to guarantee real-time accuracy across midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Navigation handlers with swipe direction
  const handlePrevMonth = () => {
    setDirection(-1);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setDirection(now > viewDate ? 1 : -1);
    setViewDate(now);
    setSelectedDateKey(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  // Localized Month & Year header string (e.g. "February 2026" / "février 2026")
  const monthYearLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
    const formatted = formatter.format(viewDate);
    // Capitalize first letter (e.g. for French "février" -> "Février")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [viewDate, locale]);

  // Days of week list
  const dayNames = [
    t('days.sun'),
    t('days.mon'),
    t('days.tue'),
    t('days.wed'),
    t('days.thu'),
    t('days.fri'),
    t('days.sat'),
  ];

  // Map deadlines by YYYY-MM-DD
  const deadlinesMap = useMemo(() => {
    const map = new Map<string, { projects: string[]; tasks: string[] }>();

    projects.forEach((p) => {
      if (p.deadline) {
        const existing = map.get(p.deadline) || { projects: [], tasks: [] };
        existing.projects.push(p.name);
        map.set(p.deadline, existing);
      }
    });

    tasks.forEach((t) => {
      if (t.deadline) {
        const existing = map.get(t.deadline) || { projects: [], tasks: [] };
        existing.tasks.push(t.title);
        map.set(t.deadline, existing);
      }
    });

    return map;
  }, [projects, tasks]);

  // Generate calendar grid cells (42 cells: previous month tail, current month days, next month head)
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Trailing days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
      const key = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateKey: key,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday =
        day === realtimeNow.getDate() &&
        currentMonth === realtimeNow.getMonth() &&
        currentYear === realtimeNow.getFullYear();

      cells.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Leading days from next month to complete 35 or 42 grid cells
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, day);
      const key = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateKey: key,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [currentYear, currentMonth, realtimeNow]);

  // Selected date's events if any
  const selectedEvents = selectedDateKey ? deadlinesMap.get(selectedDateKey) : null;

  return (
    <div className="w-full font-elms select-none">
      {/* Top Header Row above the calendar card */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary-dark tracking-tight">
            {t('title')}
          </h2>
          <p className="text-xs text-primary-medium/70 mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddEvent}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <LuPlus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{t('addEvent')}</span>
        </button>
      </div>

      {/* Main Calendar Card Container (Pure White background matching Stats Cards) */}
      <div className="rounded-2xl p-5 bg-white border border-primary-medium/15 shadow-xs transition-all">
        {/* Month Navigation & Controls */}
        <div className="flex items-center justify-between mb-4 px-0.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.h3
                key={`month-title-${currentYear}-${currentMonth}`}
                custom={direction}
                initial={{ opacity: 0, y: direction > 0 ? 8 : -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -8 : 8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="text-base sm:text-lg font-bold text-primary-dark tracking-tight"
              >
                {monthYearLabel}
              </motion.h3>
            </AnimatePresence>

            <button
              type="button"
              onClick={handleGoToday}
              className="text-[11px] font-semibold text-primary-medium/80 hover:text-primary-dark px-2 py-0.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer"
            >
              {t('today')}
            </button>
          </div>

          {/* Previous / Next Month Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded-md bg-primary-surface/70 border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <LuChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded-md bg-primary-surface/70 border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <LuChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-2.5">
          {dayNames.map((name, idx) => (
            <div
              key={`day-${idx}`}
              className="text-[11px] font-semibold text-primary-medium/65 lowercase first-letter:uppercase"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Animated Dates Grid with Swipe on x-axis and mild bounce effect */}
        <div className="overflow-hidden relative">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={`grid-${currentYear}-${currentMonth}`}
              custom={direction}
              variants={swipeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 20, // Gentle mild bounce on arrival
                  mass: 0.8,
                },
                opacity: { duration: 0.2 },
              }}
              className="grid grid-cols-7 gap-1.5 w-full"
            >
              {calendarCells.map((cell) => {
                const hasDeadlines = deadlinesMap.has(cell.dateKey);
                const isSelected = selectedDateKey === cell.dateKey;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDateKey(cell.dateKey);
                      }
                    }}
                    disabled={!cell.isCurrentMonth}
                    className={`h-11 sm:h-12 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all duration-150 focus:outline-none cursor-pointer ${!cell.isCurrentMonth
                        ? 'opacity-20 text-primary-medium cursor-default bg-transparent'
                        : cell.isToday
                          ? 'bg-primary-dark text-white font-bold shadow-md ring-2 ring-primary-dark/20 scale-[1.03]'
                          : isSelected
                            ? 'bg-[#ede9df] ring-2 ring-primary-dark text-primary-dark font-bold shadow-xs'
                            : 'bg-[#f6f5f1] text-primary-dark/85 hover:bg-[#edeae2]'
                      }`}
                  >
                    {/* Formatted Day Number with leading zero (e.g. 01, 02, 05, 26) */}
                    <span
                      className={`text-[11px] tracking-tight ${cell.isToday
                          ? 'font-bold text-white'
                          : 'font-medium'
                        }`}
                    >
                      {String(cell.dayNumber).padStart(2, '0')}
                    </span>

                    {/* Deadline Dot Indicator */}
                    <div className="flex items-center justify-end h-2 w-full">
                      {hasDeadlines && cell.isCurrentMonth && (
                        <span
                          title="Deadlines on this day"
                          className={`w-1.5 h-1.5 rounded-full shadow-2xs ${cell.isToday ? 'bg-white' : 'bg-primary-dark'
                            }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected Day Deadlines Preview Drawer */}
        {selectedDateKey && (
          <div className="mt-4 pt-3.5 border-t border-primary-medium/15 text-xs text-primary-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[11px] text-primary-medium/75 flex items-center gap-1">
                <LuCalendarDays className="w-3.5 h-3.5" />
                {selectedDateKey}
              </span>
              <span className="text-[11px] text-primary-medium/60">
                {selectedEvents
                  ? `${(selectedEvents.projects.length + selectedEvents.tasks.length)} ${t('deadlineDue', { count: selectedEvents.projects.length + selectedEvents.tasks.length })}`
                  : t('noDeadlines')}
              </span>
            </div>

            {selectedEvents && (
              <div className="space-y-1.5">
                {selectedEvents.projects.map((pName, idx) => (
                  <div
                    key={`p-${idx}`}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f6f5f1] border border-primary-medium/10 text-xs font-medium text-primary-dark"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary-dark shrink-0" />
                    <span className="truncate">{pName}</span>
                  </div>
                ))}
                {selectedEvents.tasks.map((tTitle, idx) => (
                  <div
                    key={`t-${idx}`}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f6f5f1] border border-primary-medium/10 text-xs font-medium text-primary-medium/90"
                  >
                    <LuClock className="w-3.5 h-3.5 text-primary-medium/70 shrink-0" />
                    <span className="truncate">{tTitle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
