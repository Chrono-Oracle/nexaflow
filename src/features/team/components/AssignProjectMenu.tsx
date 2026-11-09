'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuFolder, LuX, LuSearch, LuCheck, LuClock } from 'react-icons/lu';
import { Project } from '@/features/projects/types/project.types';

interface AssignProjectMenuProps {
  currentProjectId?: string;
  projects: Project[];
  isOpen: boolean;
  placement: 'left' | 'right';
  onClose: () => void;
  onSelectProject: (projectId: string | null) => void;
  isActive: boolean;
}

export function AssignProjectMenu({
  currentProjectId,
  projects,
  isOpen,
  placement,
  onClose,
  onSelectProject,
  isActive,
}: AssignProjectMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter projects by query
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{
            opacity: 0,
            x: placement === 'right' ? -14 : 14,
            scale: 0.95,
          }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{
            opacity: 0,
            x: placement === 'right' ? -14 : 14,
            scale: 0.95,
          }}
          transition={{
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-primary-medium/20 p-3.5 select-none ${
            placement === 'right'
              ? 'left-full top-0 ml-3'
              : 'right-full top-0 mr-3'
          } max-sm:left-auto max-sm:right-0 max-sm:top-full max-sm:mt-2`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between pb-2 border-b border-primary-medium/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-dark">
              <LuFolder className="w-3.5 h-3.5 text-primary" />
              <span>Assign to Project</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-primary-medium/50 hover:text-primary-dark p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Bar at Top of Menu */}
          <div className="relative flex items-center my-2.5">
            <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-primary-medium/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              autoFocus
              className="w-full h-8 pl-8 pr-7 rounded-md bg-primary-surface/40 hover:bg-primary-surface/60 focus:bg-white border border-primary-medium/20 text-xs text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
              >
                <LuX className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filtered Projects List */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
            {filteredProjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-primary-medium/60">
                {searchQuery
                  ? 'No matching projects found'
                  : 'No projects created yet'}
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isSelected = currentProjectId === proj.id;

                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-surface/80 border border-primary/25 shadow-2xs'
                        : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: proj.color || '#2563EB',
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary-dark truncate">
                          {proj.name}
                        </p>
                        <p className="text-[10px] text-primary-medium/60 truncate">
                          {proj.status} • {proj.taskCount || 0} tasks
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <LuCheck className="w-4 h-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Move to Standby / Unassign Action */}
          {isActive && (
            <div className="pt-2 mt-2 border-t border-primary-medium/10">
              <button
                type="button"
                onClick={() => onSelectProject(null)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-md font-medium transition-colors cursor-pointer"
              >
                <LuClock className="w-3.5 h-3.5 text-amber-600" />
                <span>Move to standby (unassign)</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
