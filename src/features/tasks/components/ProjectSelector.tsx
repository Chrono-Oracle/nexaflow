'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { LuFolderKanban, LuChevronDown, LuCheck, LuSearch, LuX } from 'react-icons/lu';
import { Project } from '@/features/projects/types/project.types';

interface ProjectSelectorProps {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
  disabled?: boolean;
}

const emptySubscribe = () => () => {};

export function ProjectSelector({
  projects,
  value,
  onChange,
  disabled = false,
}: ProjectSelectorProps) {
  const t = useTranslations('tasksPage.modal');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ display: 'none' });
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const selectedProject = projects.find((p) => p.id === value);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    let top: number;
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = Math.max(16, rect.top - dropdownHeight - 6);
    } else {
      top = rect.bottom + 6;
    }

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 240)}px`,
      zIndex: 9999,
      display: 'block',
    });
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, handleClose, updatePosition]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all text-left cursor-pointer ${
          isOpen
            ? 'bg-white border-primary-dark/40 ring-2 ring-primary-dark/15'
            : 'bg-[#f7f6f2] hover:bg-[#f4f2ec] border-primary-medium/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-primary-surface/40 text-primary-dark">
            <LuFolderKanban className="w-3.5 h-3.5" />
          </div>
          <span
            className={`text-xs sm:text-sm font-medium truncate ${
              selectedProject ? 'text-primary-dark font-semibold' : 'text-primary-medium/60'
            }`}
          >
            {selectedProject ? selectedProject.name : t('selectProject')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-primary-medium/60">
          {selectedProject && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-full hover:bg-primary-surface/60 hover:text-primary-dark transition-colors"
              title="Clear project"
            >
              <LuX className="w-3.5 h-3.5" />
            </span>
          )}
          <LuChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary-dark' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Portal */}
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white rounded-2xl shadow-xl border border-primary-medium/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col font-elms max-h-[260px]"
          >
            {/* Search filter if more than 3 projects */}
            {projects.length > 3 && (
              <div className="p-2 border-b border-primary-medium/10">
                <div className="relative flex items-center">
                  <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-primary-medium/50 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-primary-surface/20 rounded-lg text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
                  />
                </div>
              </div>
            )}

            {/* Project List */}
            <div className="overflow-y-auto custom-scrollbar p-1.5 space-y-0.5 flex-1">
              {/* Optional "No Project / General" Option */}
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  handleClose();
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  !value
                    ? 'bg-primary-surface/50 text-primary-dark font-bold'
                    : 'text-primary-medium/70 hover:bg-primary-surface/30 hover:text-primary-dark'
                }`}
              >
                <span className="italic">{t('noProject')}</span>
                {!value && <LuCheck className="w-3.5 h-3.5 text-primary-dark shrink-0" />}
              </button>

              {filteredProjects.length === 0 ? (
                <div className="py-4 text-center text-xs text-primary-medium/50 italic">
                  No projects found
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = p.id === value;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onChange(p.id);
                        handleClose();
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary-surface/60 text-primary-dark font-bold'
                          : 'text-primary-dark hover:bg-primary-surface/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color || '#26150b' }}
                        />
                        <span className="truncate text-left">{p.name}</span>
                      </div>
                      {isSelected && (
                        <LuCheck className="w-3.5 h-3.5 text-primary-dark shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
