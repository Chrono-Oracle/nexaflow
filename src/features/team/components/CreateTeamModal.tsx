'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  LuX,
  LuSearch,
  LuUsers,
  LuPlus,
  LuCheck,
  LuMail,
  LuTrash2,
} from 'react-icons/lu';
import { useCreateTeamMutation } from '@/hooks/useDashboardData';
import { getAuthUsers, AuthUser } from '@/data/users';
import { currentUser } from '@/data/userDashboard';
import { TeamMember } from '../types/team.types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset color options matching the reference design
const PRESET_COLORS = [
  { label: 'Dark Navy', hex: '#111827' },
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Violet', hex: '#7C3AED' }, // Default selected in reference
  { label: 'Blue', hex: '#2563EB' },
  { label: 'Sky', hex: '#0EA5E9' },
  { label: 'Teal', hex: '#06B6D4' },
  { label: 'Green', hex: '#10B981' },
  { label: 'Neutral', hex: '#F3F4F6' },
];

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const t = useTranslations('teamPage.createTeamModal');
  const createTeamMutation = useCreateTeamMutation();

  const allUsers = useMemo(() => getAuthUsers(), []);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7C3AED');
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available users for search dropdown
  const filteredUsers = useMemo(() => {
    const selectedIds = new Set(selectedMembers.map((m) => m.id));
    const query = searchQuery.trim().toLowerCase();

    return allUsers.filter((user) => {
      if (selectedIds.has(user.id)) return false;
      if (!query) return true;
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [allUsers, selectedMembers, searchQuery]);

  // Check if typed query is an email that can be invited
  const canInviteEmail = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query || !query.includes('@')) return false;
    const exists = selectedMembers.some(
      (m) => m.email.toLowerCase() === query
    );
    return !exists;
  }, [searchQuery, selectedMembers]);

  // Add an existing auth user
  const handleSelectUser = (user: AuthUser) => {
    const newMember: TeamMember = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.title || 'Member',
      department: user.department || 'General',
      avatar: user.avatar || '/Avatar.jpg',
      capacity: 80,
      activeTaskCount: 0,
      status: 'Active',
    };

    setSelectedMembers((prev) => [...prev, newMember]);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Invite by custom email
  const handleInviteEmail = () => {
    const email = searchQuery.trim();
    if (!email) return;

    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const capitalizedName = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const newMember: TeamMember = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: capitalizedName,
      email,
      role: 'Member',
      department: 'General',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        email
      )}`,
      capacity: 0,
      activeTaskCount: 0,
      status: 'Active',
      isPending: true,
    };

    setSelectedMembers((prev) => [...prev, newMember]);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Remove a member from the team
  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // Reset to default values
  const handleResetToDefault = () => {
    setTeamName('');
    setSelectedColor('#7C3AED');
    setSelectedMembers([]);
    setSearchQuery('');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await createTeamMutation.mutateAsync({
        name: teamName.trim(),
        color: selectedColor,
        memberIds: selectedMembers.map((m) => m.id),
        members: selectedMembers,
        status: 'On Standby',
      });

      toast.success(t('teamCreatedSuccess'));
      handleResetToDefault();
      onClose();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="create-team-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-elms"
        >
          {/* Backdrop - solid dark overlay without compositor buffer flash or css transition clash */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-primary-medium/15 z-10 my-8 overflow-hidden select-none"
          >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-4 pb-5">
            <div className="flex items-center gap-3.5">
              {/* Stylized Badge Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                style={{
                  backgroundColor: `${selectedColor}18`,
                  color: selectedColor,
                }}
              >
                <LuUsers className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-primary-dark tracking-tight">
                  {t('title')}
                </h2>
                <p className="text-xs sm:text-sm text-primary-medium/70 mt-0.5 leading-snug">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-primary-medium/60 hover:text-primary-dark p-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Team Name */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                {t('teamName')}
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={t('teamNamePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-medium/20 text-primary-dark placeholder:text-primary-medium/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm transition-all"
              />
            </div>

            {/* Field 2: Appearance */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-2.5 block">
                {t('appearance')}
              </label>

              <div className="flex items-center justify-between flex-wrap gap-2.5">
                {/* Color Swatches */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  {PRESET_COLORS.map((color) => {
                    const isSelected =
                      selectedColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setSelectedColor(color.hex)}
                        title={color.label}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                          isSelected
                            ? 'scale-110 ring-2 ring-offset-2'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          borderColor:
                            color.hex === '#F3F4F6'
                              ? 'rgba(0,0,0,0.1)'
                              : 'transparent',
                          borderWidth: color.hex === '#F3F4F6' ? 1 : 0,
                          // Ring color matches the selected swatch
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ['--tw-ring-color' as any]: color.hex,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Custom Color Selector Box */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-primary-medium/80">
                    {t('customColor')}
                  </span>
                  <label
                    htmlFor="team-color-picker"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-primary-medium/20 bg-white hover:bg-neutral-50 text-xs font-mono font-medium text-primary-dark cursor-pointer shadow-2xs transition-all"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span>{selectedColor.toUpperCase()}</span>
                  </label>
                  <input
                    id="team-color-picker"
                    ref={colorInputRef}
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            {/* Field 3: Members */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                {t('members')}
              </label>

              {/* Search / Add Input */}
              <div ref={searchContainerRef} className="relative">
                <div className="relative flex items-center">
                  <LuSearch className="w-4 h-4 text-primary-medium/50 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-primary-medium/20 text-primary-dark placeholder:text-primary-medium/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm transition-all"
                  />
                </div>

                {/* Search Dropdown Results */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 max-h-52 overflow-y-auto bg-white rounded-xl border border-primary-medium/20 shadow-lg z-30 p-1 divide-y divide-neutral-100">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <Image
                          src={user.avatar || '/Avatar.jpg'}
                          alt={user.fullName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary-medium/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-primary-dark truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-primary-medium/70 truncate">
                            {user.email}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-primary-medium/60 px-2 py-0.5 bg-neutral-100 rounded-md shrink-0">
                          {user.department || user.title || 'Member'}
                        </span>
                      </button>
                    ))}

                    {/* Invite custom email if not in list */}
                    {canInviteEmail && (
                      <button
                        type="button"
                        onClick={handleInviteEmail}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-surface/30 rounded-lg text-left transition-colors cursor-pointer text-primary"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0 text-primary">
                          <LuMail className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            Invite &ldquo;{searchQuery.trim()}&rdquo;
                          </p>
                          <p className="text-[11px] text-primary-medium/70 truncate">
                            Send invitation to join team
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-primary px-2 py-0.5 bg-primary-surface rounded-md shrink-0">
                          Invite
                        </span>
                      </button>
                    )}

                    {filteredUsers.length === 0 && !canInviteEmail && (
                      <div className="px-4 py-3 text-center text-xs text-primary-medium/60">
                        No matching members found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Members List with Fixed Height & Scroll */}
              <div className="mt-3.5 h-44 sm:h-48 overflow-y-auto pr-1 custom-scrollbar">
                {selectedMembers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-primary-medium/20 rounded-2xl bg-neutral-50/50 select-none">
                    <LuUsers className="w-5 h-5 text-primary-medium/40 mb-1.5" />
                    <p className="text-xs font-semibold text-primary-dark">
                      {t('noMembersYet')}
                    </p>
                    <p className="text-[11px] text-primary-medium/60 mt-0.5">
                      {t('searchToAddMembers')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMembers.map((member) => {
                      const isCurrentUser = member.email === currentUser.email;
                      const isPending = member.isPending;

                      return (
                        <div
                          key={member.id}
                          className="group flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50/80 transition-colors"
                        >
                          {/* Avatar & Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <Image
                              src={member.avatar || '/Avatar.jpg'}
                              alt={member.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-primary-medium/10"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-semibold text-primary-dark truncate">
                                  {member.name}
                                </span>
                                {/* Badges */}
                                {isCurrentUser && (
                                  <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md">
                                    {t('youBadge')}
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md">
                                    {t('invitePending')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-primary-medium/70 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Remove button for all members */}
                          <div className="shrink-0 flex items-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-medium/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                              title="Remove member"
                            >
                              <LuX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-primary-medium/10 flex items-center justify-between gap-3">
              {/* Reset to default link/button */}
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs sm:text-sm font-medium text-primary-medium/80 hover:text-primary-dark transition-colors cursor-pointer"
              >
                {t('resetToDefault')}
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-primary-medium/20 text-xs sm:text-sm font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>

                <button
                  type="submit"
                  disabled={!teamName.trim() || isSubmitting}
                  className="px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 hover:brightness-105"
                  style={{ backgroundColor: selectedColor }}
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('createTeam')}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
}
