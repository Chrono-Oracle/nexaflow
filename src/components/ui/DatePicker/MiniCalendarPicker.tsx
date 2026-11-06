'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { LuCalendar, LuChevronDown, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface MiniCalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onTriggerClick?: () => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  disabled?: boolean;
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MiniCalendarPicker({
  value,
  onChange,
  onTriggerClick,
  placeholder = 'Select date',
  minDate,
  disabled = false,
}: MiniCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [navMonthOffset, setNavMonthOffset] = useState<number | null>(null);

  // Base date derived purely from value or fallback to today
  const baseDate = useMemo(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [value]);

  // Derived viewDate without cascading effects
  const viewDate = useMemo(() => {
    if (navMonthOffset === null) {
      return baseDate;
    }
    return new Date(baseDate.getFullYear(), baseDate.getMonth() + navMonthOffset, 1);
  }, [baseDate, navMonthOffset]);

  // Close calendar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const todayKey = useMemo(() => getTodayDateString(), []);

  const handlePrevMonth = () => {
    setNavMonthOffset((prev) => (prev === null ? -1 : prev - 1));
  };

  const handleNextMonth = () => {
    setNavMonthOffset((prev) => (prev === null ? 1 : prev + 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - baseDate.getFullYear()) * 12 +
      (now.getMonth() - baseDate.getMonth());
    setNavMonthOffset(diffMonths);
  };

  // Month & Year label (e.g. "November 2026")
  const monthYearLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(viewDate);
  }, [viewDate]);

  // 42-day calendar grid matching Home Page Calendar theme
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

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateKey === todayKey;

      cells.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Leading days from next month to complete 35 or 42 cells
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
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
  }, [currentYear, currentMonth, todayKey]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      onTriggerClick?.();
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative font-elms w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full h-11 flex items-center justify-between bg-[#f7f6f2] hover:bg-[#f3f1ec] focus:bg-white border border-primary-medium/15 focus:border-primary-dark/40 focus:ring-2 focus:ring-primary-dark/15 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <LuCalendar className="w-4 h-4 text-primary-dark shrink-0" />
          <span
            className={`text-xs sm:text-sm truncate ${
              value ? 'text-primary-dark font-semibold' : 'text-primary-medium/60 font-medium'
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        <LuChevronDown
          className={`w-4 h-4 text-primary-medium/60 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-dark' : ''
          }`}
        />
      </button>

      {/* Mini Calendar Dropdown - Exactly same width as field */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-2xl p-3 border border-primary-medium/15 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header Row: Month Year + Today + Nav Arrows */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-primary-dark tracking-tight truncate">
                {monthYearLabel}
              </span>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-[10px] font-semibold text-primary-medium/80 hover:text-primary-dark px-1.5 py-0.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer shrink-0"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="w-6 h-6 rounded-md bg-primary-surface/70 border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <LuChevronLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="w-6 h-6 rounded-md bg-primary-surface/70 border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <LuChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[10px] font-semibold text-primary-medium/65">
                {d}
              </div>
            ))}
          </div>

          {/* Animated 7-col Grid */}
          <div className="grid grid-cols-7 gap-1 w-full">
            {calendarCells.map((cell) => {
              const isPastMin = minDate ? cell.dateKey < minDate : false;
              const isDisabled = !cell.isCurrentMonth || isPastMin;
              const isSelected = value === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(cell.dateKey);
                      setIsOpen(false);
                    }
                  }}
                  className={`h-7.5 sm:h-8 rounded-lg flex items-center justify-center text-center transition-all duration-150 select-none ${
                    !cell.isCurrentMonth
                      ? 'opacity-20 text-primary-medium/40 cursor-default bg-transparent'
                      : isPastMin
                      ? 'opacity-25 text-primary-medium/50 cursor-not-allowed bg-transparent'
                      : cell.isToday
                      ? isSelected
                        ? 'bg-primary-dark text-white font-bold shadow-xs ring-2 ring-primary-dark/30 scale-102 cursor-pointer'
                        : 'bg-primary-dark text-white font-bold shadow-xs cursor-pointer'
                      : isSelected
                      ? 'bg-[#ede9df] ring-1.5 ring-primary-dark text-primary-dark font-bold shadow-2xs cursor-pointer'
                      : 'bg-[#f6f5f1] text-primary-dark/85 hover:bg-[#edeae2] cursor-pointer'
                  }`}
                >
                  <span
                    className={`text-[11px] tracking-tight ${
                      cell.isToday ? 'font-bold text-white' : 'font-medium'
                    }`}
                  >
                    {String(cell.dayNumber).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
