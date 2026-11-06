'use client';

import { useState, useRef, useEffect } from 'react';
import { LuFlag, LuChevronDown, LuCheck } from 'react-icons/lu';
import { TaskPriority } from '@/features/tasks/types/task.types';

export interface PriorityOption {
  id: TaskPriority;
  label: string;
  flagClass: string;
  badgeClass: string;
  selectedBgClass: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'Low',
    label: 'Low',
    flagClass: 'text-[#2563eb] fill-[#2563eb]',
    badgeClass: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
    selectedBgClass: 'bg-[#eff6ff]/80 text-[#2563eb]',
  },
  {
    id: 'Medium',
    label: 'Medium',
    flagClass: 'text-[#d97706] fill-[#d97706]',
    badgeClass: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
    selectedBgClass: 'bg-[#fffbeb]/80 text-[#d97706]',
  },
  {
    id: 'High',
    label: 'High',
    flagClass: 'text-[#ea580c] fill-[#ea580c]',
    badgeClass: 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]',
    selectedBgClass: 'bg-[#fff7ed]/80 text-[#ea580c]',
  },
  {
    id: 'Urgent',
    label: 'Urgent',
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

export function PrioritySelector({
  value,
  onChange,
  disabled = false,
}: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    PRIORITY_OPTIONS.find((p) => p.id === value) || PRIORITY_OPTIONS[1]; // default Medium

  // Dismiss on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
            {currentOption.label}
          </span>
        </div>

        <LuChevronDown
          className={`w-4 h-4 text-primary-medium/60 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-dark' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Options */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-primary-medium/15 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 select-none"
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
                    {opt.label}
                  </span>
                </div>

                {isSelected && (
                  <LuCheck className="w-4 h-4 text-primary-dark shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
