'use client';

import { useState, useRef, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { LuUser, LuUserPlus, LuCheck, LuX, LuPlus } from 'react-icons/lu';
import { AuthUser, getAuthUsers } from '@/data/users';

interface AssigneeSelectorProps {
  selectedUsers?: AuthUser[];
  onSelectUsers?: (users: AuthUser[]) => void;
  selectedUserId?: string;
  onSelectUser?: (user?: AuthUser) => void;
  disabled?: boolean;
}

const emptySubscribe = () => () => {};
const NAME_CHAR_LIMIT = 8;

function truncateAssigneeName(name: string, limit = NAME_CHAR_LIMIT): string {
  if (!name) return '';
  if (name.length <= limit) return name;
  return `${name.slice(0, limit)}…`;
}

export function AssigneeSelector({
  selectedUsers,
  onSelectUsers,
  selectedUserId,
  onSelectUser,
  disabled = false,
}: AssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ display: 'none' });

  const allUsers = useMemo(() => getAuthUsers(), []);

  // Resolve active selected users array
  const activeUsers: AuthUser[] = useMemo(() => {
    if (selectedUsers) return selectedUsers;
    if (selectedUserId) return allUsers.filter((u) => u.id === selectedUserId);
    return [];
  }, [selectedUsers, selectedUserId, allUsers]);

  const handleUsersChange = (newUsers: AuthUser[]) => {
    if (onSelectUsers) {
      onSelectUsers(newUsers);
    }
    if (onSelectUser) {
      onSelectUser(newUsers[0]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    const updated = activeUsers.filter((u) => u.id !== userId);
    handleUsersChange(updated);
  };

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const isMobile = window.innerWidth < 640;
    const dropdownWidth = isMobile
      ? Math.min(320, window.innerWidth - 32)
      : Math.max(rect.width, 280);

    let left = isMobile ? rect.left : rect.left;

    if (left + dropdownWidth > window.innerWidth - 16) {
      left = window.innerWidth - dropdownWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    const dropdownMaxHeight = 290;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    let top = rect.bottom + 6;
    let actualMaxHeight = Math.min(dropdownMaxHeight, Math.max(160, spaceBelow));

    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      top = Math.max(16, rect.top - dropdownMaxHeight - 6);
      actualMaxHeight = Math.min(dropdownMaxHeight, spaceAbove);
    }

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${actualMaxHeight}px`,
      zIndex: 9999,
    });
  }, []);

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
  }, [isOpen, updatePosition, activeUsers.length]);

  // Filter users in real-time as user types
  const filteredUsers = allUsers.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      user.fullName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.nickname && user.nickname.toLowerCase().includes(q)) ||
      (user.title && user.title.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 2. When space (or Enter) is pressed, commit the filtered match and allow typing next name
    if (e.key === ' ' || e.key === 'Enter') {
      const trimmed = searchQuery.trim().toLowerCase();
      if (trimmed.length > 0) {
        // Find candidate among unselected users
        const available = filteredUsers.filter(
          (u) => !activeUsers.some((sel) => sel.id === u.id)
        );

        const exactOrBest =
          available.find(
            (u) =>
              u.fullName.toLowerCase() === trimmed ||
              u.nickname.toLowerCase() === trimmed ||
              u.fullName.toLowerCase().split(' ')[0] === trimmed
          ) || available[0];

        if (exactOrBest) {
          e.preventDefault();
          handleUsersChange([...activeUsers, exactOrBest]);
          setSearchQuery('');
          setIsOpen(true);
          return;
        }
      } else if (e.key === ' ') {
        e.preventDefault();
      }
    } else if (e.key === 'Backspace' && searchQuery === '' && activeUsers.length > 0) {
      e.preventDefault();
      handleUsersChange(activeUsers.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleContainerClick = () => {
    if (disabled) return;
    inputRef.current?.focus();
    if (!isOpen) {
      setIsOpen(true);
      updatePosition();
    }
  };

  return (
    <div className="relative font-elms">
      {/* Assignee Input Container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`w-full min-h-[44px] bg-[#f7f6f2] hover:bg-[#f3f1ec] focus-within:bg-white border border-primary-medium/15 focus-within:border-primary-dark/40 focus-within:ring-2 focus-within:ring-primary-dark/15 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 transition-all cursor-text ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {/* Selected Users Chips */}
          {activeUsers.map((user) => {
            const displayName = truncateAssigneeName(user.fullName);

            return (
              <span
                key={user.id}
                title={user.fullName}
                className="inline-flex items-center gap-1.5 bg-white border border-primary-medium/20 rounded-lg pl-1 pr-1.5 py-0.5 shadow-2xs shrink-0 select-none"
              >
                <Image
                  src={user.avatar || '/Avatar.jpg'}
                  alt={user.fullName}
                  width={20}
                  height={20}
                  unoptimized
                  className="w-5 h-5 rounded-full object-cover shrink-0 border border-primary-medium/15"
                />
                <span className="text-[11px] font-semibold text-primary-dark max-w-[75px] truncate">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUser(user.id);
                  }}
                  aria-label={`Remove ${user.fullName}`}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-primary-medium/60 hover:text-primary-dark hover:bg-primary-medium/15 transition-colors cursor-pointer"
                >
                  <LuX className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}

          {/* User Icon prefix if no users are selected yet */}
          {activeUsers.length === 0 && !searchQuery && (
            <div className="w-5.5 h-5.5 rounded-full bg-primary-medium/15 text-primary-medium/70 flex items-center justify-center shrink-0">
              <LuUser className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Filter / Typing Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true);
              updatePosition();
            }}
            placeholder={
              activeUsers.length === 0
                ? 'Not Assigned'
                : 'Add more...'
            }
            className="flex-1 min-w-[75px] bg-transparent text-xs font-medium text-primary-dark placeholder:text-primary-medium/75 focus:outline-none py-1"
          />
        </div>

        {/* Add User Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          aria-label="Toggle team member dropdown"
          className="p-1 rounded-lg text-primary-dark hover:bg-primary-medium/10 transition-colors cursor-pointer shrink-0"
        >
          <LuUserPlus className="w-4 h-4 text-primary-dark" />
        </button>
      </div>

      {/* Floating Team Members Dropdown via Portal */}
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="overflow-y-auto custom-scrollbar bg-white rounded-2xl shadow-2xl border border-primary-medium/15 p-2 font-elms animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header / Clear action */}
            {activeUsers.length > 0 ? (
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-primary-medium/10 px-2 pt-0.5">
                <span className="text-[11px] font-semibold text-primary-medium/80">
                  {activeUsers.length} assigned
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleUsersChange([]);
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            ) : (
              <div className="px-2 pb-1.5 mb-1.5 border-b border-primary-medium/10 text-[11px] font-semibold text-primary-medium/75">
                Assign team members
              </div>
            )}

            {/* List of Users with Filter & Grayed Out State */}
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="py-5 text-center text-xs text-primary-medium/70">
                  No team members matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = activeUsers.some((u) => u.id === user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        if (!isSelected) {
                          handleUsersChange([...activeUsers, user]);
                          setSearchQuery('');
                          inputRef.current?.focus();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors select-none ${
                        isSelected
                          ? 'opacity-40 bg-[#f7f6f2] cursor-not-allowed pointer-events-none'
                          : 'hover:bg-primary-surface/40 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Image
                          src={user.avatar || '/Avatar.jpg'}
                          alt={user.fullName}
                          width={32}
                          height={32}
                          unoptimized
                          className={`w-8 h-8 rounded-full object-cover shrink-0 border border-primary-medium/15 shadow-2xs ${
                            isSelected ? 'grayscale-[40%]' : ''
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-primary-dark truncate flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                            {isSelected && (
                              <span className="text-[10px] font-semibold text-primary-medium/80 bg-primary-medium/15 px-1.5 py-0.2 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-primary-medium/70 truncate">
                            {user.title || user.email}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <LuCheck className="w-4 h-4 text-primary-dark shrink-0 ml-2" />
                      ) : (
                        <LuPlus className="w-4 h-4 text-primary-medium/50 group-hover:text-primary-dark shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
