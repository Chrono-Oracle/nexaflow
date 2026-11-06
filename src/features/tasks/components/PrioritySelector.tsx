'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { LuFlag, LuChevronDown, LuCheck } from 'react-icons/lu';
import { TaskPriority } from '@/features/tasks/types/task.types';

export interface PriorityOption {
  id: TaskPriority;
  labelKey: string;
  flagClass: string;
  badgeClass: string;
  selectedBgClass: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'Low',
    labelKey: 'priority.low',
    flagClass: 'text-[#2563eb] fill-[#2563eb]',
    badgeClass: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
    selectedBgClass: 'bg-[#eff6ff]/80 text-[#2563eb]',
  },
  {
    id: 'Medium',
    labelKey: 'priority.medium',
    flagClass: 'text-[#d97706] fill-[#d97706]',
    badgeClass: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
    selectedBgClass: 'bg-[#fffbeb]/80 text-[#d97706]',
  },
  {
    id: 'High',
    labelKey: 'priority.high',
    flagClass: 'text-[#ea580c] fill-[#ea580c]',
    badgeClass: 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]',
    selectedBgClass: 'bg-[#fff7ed]/80 text-[#ea580c]',
  },
  {
    id: 'Urgent',
    labelKey: 'priority.urgent',
    flagClass: 'text-[#dc2626] fill-[#dc2626]',
    badgeClass: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
    selectedBgClass: 'bg-[#fef2f2]/80 text-[#dc2626]',
  },
];

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  disabled?: boolean;
}

const emptySubscribe = () => () => {};

export function PrioritySelector({
  value,
  onChange,
  disabled = false,
}: PrioritySelectorProps) {
  const t = useTranslations('tasksPage');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ display: 'none' });
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const currentOption =
    PRIORITY_OPTIONS.find((p) => p.id === value) || PRIORITY_OPTIONS[1]; // default Medium

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const dropdownHeight = 186;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    let top: number;
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = Math.max(16, rect.top - dropdownHeight - 6);
    } else {
      top = rect.bottom + 6;
    }

    let left = rect.left;
    const width = rect.width;

    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - width - 16;
    }
    if (left < 16) {
      left = 16;
    }

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 9999,
    });
  }, []);

  // Dismiss on click outside & update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, updatePosition]);

  return (
    <div className="relative font-elms w-full" ref={containerRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
        className="w-full h-11 flex items-center justify-between bg-[#f7f6f2] hover:bg-[#f3f1ec] focus:bg-white border border-primary-medium/15 focus:border-primary-dark/40 focus:ring-2 focus:ring-primary-dark/15 rounded-xl px-3.5 py-2 transition-all cursor-pointer select-none text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center shrink-0">
            <LuFlag className={`w-4 h-4 ${currentOption.flagClass}`} />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-primary-dark truncate">
            {t(currentOption.labelKey)}
          </span>
        </div>

        <LuChevronDown
          className={`w-4 h-4 text-primary-medium/60 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-dark' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu Options via Portal (Out of the modal) */}
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            style={dropdownStyle}
            className="bg-white rounded-2xl shadow-2xl border border-primary-medium/15 p-1.5 font-elms animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = value === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? `${opt.selectedBgClass} font-semibold`
                      : 'hover:bg-primary-surface/40 text-primary-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                      <LuFlag className={`w-4 h-4 ${opt.flagClass}`} />
                    </div>
                    <span className="text-xs font-bold text-primary-dark">
                      {t(opt.labelKey)}
                    </span>
                  </div>

                  {isSelected && (
                    <LuCheck className="w-4 h-4 text-primary-dark shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
