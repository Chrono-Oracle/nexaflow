'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LuPlus, LuX, LuSearch, LuTrash2 } from 'react-icons/lu';
import { Team } from '../../types/team.types';
import { AuthUser } from '@/data/users';
import { TeamMemberItem } from './TeamMemberItem';
import { AddTeamMemberSection } from './AddTeamMemberSection';

interface TeamMembersDropdownProps {
  team: Team;
  isOpen: boolean;
  placement: 'top' | 'bottom';
  availableUsers: AuthUser[];
  onClose: () => void;
  onAddMember: (user: AuthUser) => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
  onUpdateRole: (memberId: string, newRole: string) => void;
  onToggleStatus: (memberId: string) => void;
  onConfirmDeleteTeam: () => void;
}

export function TeamMembersDropdown({
  team,
  isOpen,
  placement,
  availableUsers,
  onClose,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  onToggleStatus,
  onConfirmDeleteTeam,
}: TeamMembersDropdownProps) {
  const t = useTranslations('teamPage.membersDropdown');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside (unless click is inside the parent team card)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        const isInsideCard = (event.target as HTMLElement).closest(
          `[data-team-card="${team.id}"]`
        );
        if (!isInsideCard) {
          onClose();
        }
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
  }, [isOpen, team.id, onClose]);

  // Reset internal states when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setIsAddMemberOpen(false);
      setMemberSearchQuery('');
      setEditingMemberId(null);
      setIsConfirmingDelete(false);
    }
  }, [isOpen]);

  // Filter members by search query
  const filteredTeamMembers = team.members.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{
            opacity: 0,
            y: placement === 'top' ? 12 : -12,
            scale: 0.96,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: placement === 'top' ? 12 : -12,
            scale: 0.96,
          }}
          transition={{
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-40 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-primary-medium/20 p-3.5 sm:p-4 font-elms select-none cursor-default max-h-[480px] flex flex-col ${
            placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
          }`}
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-primary-medium/10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: team.color || '#7C3AED' }}
              />
              <h4 className="text-xs font-bold text-primary-dark tracking-tight truncate">
                {team.name}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-surface text-primary-dark border border-primary-medium/20 shrink-0">
                {team.members.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Toggle Add Member sub-panel */}
              <button
                type="button"
                onClick={() => setIsAddMemberOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                  isAddMemberOpen
                    ? 'bg-primary-dark text-white'
                    : 'bg-primary-surface/60 hover:bg-primary-surface text-primary-dark border border-primary-medium/20'
                }`}
                title={isAddMemberOpen ? t('cancel') : t('addMembers')}
              >
                <LuPlus
                  className={`w-3.5 h-3.5 transition-transform ${
                    isAddMemberOpen ? 'rotate-45' : ''
                  }`}
                />
                <span>{isAddMemberOpen ? t('cancel') : t('addMembers')}</span>
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="text-primary-medium/50 hover:text-primary-dark p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Close list"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expandable Add Members Sub-Panel */}
          <AddTeamMemberSection
            isOpen={isAddMemberOpen}
            availableUsers={availableUsers}
            onAddUser={onAddMember}
          />

          {/* Search Input when > 3 members and add panel is closed */}
          {!isAddMemberOpen && team.members.length > 3 && (
            <div className="relative flex items-center my-2 shrink-0">
              <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-primary-medium/60 pointer-events-none" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-8 pl-8 pr-7 rounded-md bg-primary-surface/40 hover:bg-primary-surface/60 focus:bg-white border border-primary-medium/20 text-xs text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {memberSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-2 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
                >
                  <LuX className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Member Cards List (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 py-2 pr-0.5 min-h-[100px] max-h-56">
            {filteredTeamMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-primary-medium/60">
                {team.members.length === 0
                  ? t('noMembers')
                  : t('noMatching', { query: memberSearchQuery })}
              </div>
            ) : (
              filteredTeamMembers.map((member) => (
                <TeamMemberItem
                  key={member.id}
                  member={member}
                  isEditingRole={editingMemberId === member.id}
                  onToggleRoleEdit={() =>
                    setEditingMemberId(
                      editingMemberId === member.id ? null : member.id
                    )
                  }
                  onUpdateRole={(newRole) => {
                    onUpdateRole(member.id, newRole);
                    setEditingMemberId(null);
                  }}
                  onToggleStatus={() => onToggleStatus(member.id)}
                  onRemove={() => onRemoveMember(member.id, member.name)}
                />
              ))
            )}
          </div>

          {/* Dropdown Footer: Delete Team Action & Add Members Shortcut */}
          <div className="pt-2.5 mt-2 border-t border-primary-medium/10 flex items-center justify-between shrink-0">
            {isConfirmingDelete ? (
              <div className="flex items-center justify-between w-full animate-in fade-in duration-150">
                <span className="text-xs font-semibold text-red-600">
                  {t('confirmDelete')}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onConfirmDeleteTeam}
                    className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    {t('yesDelete')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-md text-xs font-medium text-primary-medium hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <LuTrash2 className="w-3.5 h-3.5" />
                  <span>{t('deleteTeam')}</span>
                </button>

                {!isAddMemberOpen && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-dark hover:bg-primary text-white text-xs font-medium shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>{t('addMembers')}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
