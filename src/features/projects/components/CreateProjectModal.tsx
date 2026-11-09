'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  LuX,
  LuPlus,
  LuSearch,
  LuChevronDown,
  LuCheck,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu';
import {
  useAddProjectMutation,
  useTeamsQuery,
  useProjectsQuery,
} from '@/hooks/useDashboardData';
import { getAuthUsers, AuthUser } from '@/data/users';
import { currentUser } from '@/data/userDashboard';
import { RichTextEditor } from '@/components/ui/RichTextEditor/RichTextEditor';
import { FileUploadModal, FileIconBadge } from '@/components/ui/FileUpload';
import { TaskAttachment } from '@/components/ui/FileUpload/fileUpload.types';
import {
  MiniCalendarPicker,
  getTodayDateString,
} from '@/components/ui/DatePicker/MiniCalendarPicker';
import {
  ProjectMemberRole,
  ProjectAssignedMember,
} from '../types/project.types';
import { cleanTrailingEmptyHtml } from '../utils/htmlSanitizer';
import { Team } from '@/features/team/types/team.types';
import { isTeamActiveOnProject } from '@/features/team/utils/teamStatus';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NON_OWNER_ROLES: ProjectMemberRole[] = ['Manager', 'Member'];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const t = useTranslations('projectsPage.createProjectModal');
  const addProjectMutation = useAddProjectMutation();
  const { data: teams = [] } = useTeamsQuery();
  const { data: projects = [] } = useProjectsQuery();

  const allUsers = useMemo(() => getAuthUsers(), []);
  const todayKey = useMemo(() => getTodayDateString(), []);

  // Form State
  const [name, setName] = useState('');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [description, setDescription] = useState('');

  // Dates
  const [startDate, setStartDate] = useState(todayKey);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Assigned Members State (profile pics row in main modal)
  const defaultOwner: ProjectAssignedMember = useMemo(
    () => ({
      id: currentUser.id || 'usr_01',
      name: currentUser.fullName,
      email: currentUser.email,
      avatar: currentUser.avatar || '/Avatar.jpg',
      role: 'Owner',
    }),
    []
  );

  const [assignedMembers, setAssignedMembers] = useState<ProjectAssignedMember[]>([]);
  // Track members added or edited individually so they aren't removed if a team is unassigned
  const [individuallyAddedUserIds, setIndividuallyAddedUserIds] = useState<Set<string>>(
    new Set()
  );

  // Team Assignment State
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  // Extended Member Assignment Panel State (UI 2 & UI 3)
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [stagingMembers, setStagingMembers] = useState<Map<string, ProjectMemberRole>>(
    new Map()
  );
  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<string | null>(null);

  // Attachments State using the unified FileUploadModal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  // Notifications & Reminders (UI 1)
  const [notifications, setNotifications] = useState<{ email: boolean; slack: boolean }>({
    email: true,
    slack: false,
  });
  const [reminder, setReminder] = useState('1 hour before');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived assigned teams
  const assignedTeams = useMemo(() => {
    return teams.filter((t) => selectedTeamIds.has(t.id));
  }, [teams, selectedTeamIds]);

  // Filtered teams for the team drawer search
  const filteredTeams = useMemo(() => {
    if (!teamSearchQuery.trim()) return teams;
    const q = teamSearchQuery.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.members?.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        )
    );
  }, [teams, teamSearchQuery]);

  // Open the individual member assignment panel
  const handleOpenMembersDrawer = () => {
    const map = new Map<string, ProjectMemberRole>();
    assignedMembers.forEach((m) => map.set(m.id, m.role));
    setStagingMembers(map);
    setMemberSearchQuery('');
    setOpenRoleDropdownId(null);
    setIsTeamDrawerOpen(false);
    setIsMembersDrawerOpen(true);
  };

  // Toggle team assignment
  const handleToggleTeam = (team: Team) => {
    const isCurrentlySelected = selectedTeamIds.has(team.id);

    if (!isCurrentlySelected) {
      // Add team
      setSelectedTeamIds((prev) => new Set(prev).add(team.id));

      // Merge team members into assignedMembers
      setAssignedMembers((currentMembers) => {
        const existingIds = new Set(currentMembers.map((m) => m.id));
        const membersToAdd: ProjectAssignedMember[] = [];

        (team.members || []).forEach((m) => {
          if (!existingIds.has(m.id)) {
            const isCurrentUser =
              m.id === currentUser.id ||
              m.email === currentUser.email ||
              m.id === 'usr_01';

            membersToAdd.push({
              id: m.id,
              name: m.name,
              email: m.email,
              avatar: m.avatar,
              role: isCurrentUser ? 'Owner' : 'Member',
            });
            existingIds.add(m.id);
          }
        });

        return [...currentMembers, ...membersToAdd];
      });
    } else {
      // Remove team
      const nextSelected = new Set(selectedTeamIds);
      nextSelected.delete(team.id);
      setSelectedTeamIds(nextSelected);

      // Other remaining teams
      const remainingTeams = teams.filter(
        (t) => nextSelected.has(t.id) && t.id !== team.id
      );
      const remainingTeamMemberIds = new Set<string>();
      remainingTeams.forEach((t) => {
        (t.members || []).forEach((m) => remainingTeamMemberIds.add(m.id));
      });

      const teamMemberIds = new Set((team.members || []).map((m) => m.id));

      setAssignedMembers((currentMembers) =>
        currentMembers.filter((m) => {
          // If member is not in this unassigned team, keep
          if (!teamMemberIds.has(m.id)) return true;
          // If member is in another remaining selected team, keep
          if (remainingTeamMemberIds.has(m.id)) return true;
          // If member was explicitly added individually, keep
          if (individuallyAddedUserIds.has(m.id)) return true;
          // Otherwise remove
          return false;
        })
      );
    }
  };

  // Clear all assigned teams
  const handleClearAllTeams = () => {
    setSelectedTeamIds(new Set());
    setAssignedMembers((prev) =>
      prev.filter((m) => individuallyAddedUserIds.has(m.id))
    );
  };

  // Toggle member selection in staging
  const handleToggleMember = (user: AuthUser) => {
    const isCurrentUser =
      user.id === currentUser.id ||
      user.email === currentUser.email ||
      user.id === 'usr_01';

    setStagingMembers((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) {
        next.delete(user.id);
      } else {
        next.set(user.id, isCurrentUser ? 'Owner' : 'Member');
      }
      return next;
    });
  };

  // Change member role in staging
  const handleChangeRole = (userId: string, newRole: ProjectMemberRole) => {
    setStagingMembers((prev) => {
      const next = new Map(prev);
      next.set(userId, newRole);
      return next;
    });
    setOpenRoleDropdownId(null);
  };

  // Reset to default members (UI 3)
  const handleResetMembersToDefault = () => {
    setStagingMembers(new Map());
    setOpenRoleDropdownId(null);
  };

  // Confirm and assign members (UI 3)
  const handleConfirmAssignMembers = () => {
    const committed: ProjectAssignedMember[] = [];
    const individualIds = new Set<string>();

    stagingMembers.forEach((role, userId) => {
      const user = allUsers.find((u) => u.id === userId);
      if (user) {
        committed.push({
          id: user.id,
          name: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role,
        });
        individualIds.add(user.id);
      }
    });

    // Ensure members from assigned teams remain in assignedMembers even if not touched in individual drawer
    const committedIds = new Set(committed.map((m) => m.id));
    const activeTeams = teams.filter((t) => selectedTeamIds.has(t.id));

    activeTeams.forEach((t) => {
      (t.members || []).forEach((tm) => {
        if (!committedIds.has(tm.id)) {
          committed.push({
            id: tm.id,
            name: tm.name,
            email: tm.email,
            avatar: tm.avatar,
            role: 'Member',
          });
          committedIds.add(tm.id);
        }
      });
    });

    setIndividuallyAddedUserIds(individualIds);
    setAssignedMembers(committed);
    setIsMembersDrawerOpen(false);
  };

  // Quick remove member from the profile pics row
  const handleRemoveAssignedMember = (memberId: string) => {
    setAssignedMembers((prev) => prev.filter((m) => m.id !== memberId));
    setIndividuallyAddedUserIds((prev) => {
      const next = new Set(prev);
      next.delete(memberId);
      return next;
    });
  };

  const resetEntireForm = () => {
    setName('');
    setDescription('');
    setIsDescriptionOpen(false);
    setStartDate(todayKey);
    setAssignedMembers([]);
    setIsMembersDrawerOpen(false);
    setIsTeamDrawerOpen(false);
    setSelectedTeamIds(new Set());
    setIndividuallyAddedUserIds(new Set());
    setTeamSearchQuery('');
    setAttachments([]);
    setNotifications({ email: true, slack: false });
    setReminder('1 hour before');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryOwner =
        assignedMembers.find((m) => m.role === 'Owner') || defaultOwner;

      const initialActivity = {
        id: `act_${Date.now()}`,
        actorName: primaryOwner.name,
        actorAvatar: primaryOwner.avatar,
        action: 'created project',
        target: name.trim(),
        timestamp: new Date().toISOString(),
        badge: {
          type: 'create' as const,
        },
      };

      const assignedTeamsList = teams
        .filter((t) => selectedTeamIds.has(t.id))
        .map((t) => ({ id: t.id, name: t.name, color: t.color }));

      await addProjectMutation.mutateAsync({
        name: name.trim(),
        description: cleanTrailingEmptyHtml(description),
        startDate,
        deadline: dueDate,
        status: 'In Progress',
        priority: 'Medium',
        progress: 0,
        color: '#26150b',
        taskCount: 0,
        tags: ['General'],
        teamIds: Array.from(selectedTeamIds),
        teams: assignedTeamsList,
        members: assignedMembers,
        attachments: attachments.map((a) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          formattedSize: a.formattedSize,
          type: a.type,
          url: a.url,
          uploadedAt: a.uploadedAt,
        })),
        manager: {
          id: primaryOwner.id,
          name: primaryOwner.name,
          email: primaryOwner.email,
          avatar: primaryOwner.avatar,
          role: primaryOwner.role,
          department: 'Operations',
        },
        subtasks: [],
        comments: [],
        activities: [initialActivity],
        reminderActive: true,
        viewsCount: 1,
      });

      toast.success(t('success'));
      resetEntireForm();
      onClose();
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered members for the search input in the extended UI (UI 2)
  const filteredUsers = useMemo(() => {
    if (!memberSearchQuery.trim()) return allUsers;
    const q = memberSearchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [allUsers, memberSearchQuery]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="create-project-modal-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden font-elms"
          >
            {/* Subtle Backdrop */}
            <div
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              key="create-project-modal-container"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-primary-medium/20 z-10 font-elms flex flex-col max-h-[92vh] overflow-hidden"
            >
            {/* Header: Title ("Create Project") + Close Button */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-primary-medium/10 bg-white shrink-0 select-none">
              <h2 className="text-xl font-bold text-primary-dark tracking-tight">
                {t('title')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-primary-medium/60 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
                title={t('cancel')}
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
              {/* 1. Project Name Field with "Add description" button */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-primary-dark mb-1.5">
                  {t('name')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="flex-1 text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl px-3.5 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
                      isDescriptionOpen || description
                        ? 'bg-[#f0ece4] border-primary-dark/30 text-primary-dark'
                        : 'bg-white border-primary-medium/25 text-primary-dark hover:bg-primary-surface/40'
                    }`}
                  >
                    <span>{isDescriptionOpen ? t('hideDescription') : t('addDescription')}</span>
                  </button>
                </div>

                {/* Animated Dropdown: RichText Editor */}
                <AnimatePresence>
                  {isDescriptionOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                        transitionEnd: { overflow: 'visible' },
                      }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-3 space-y-2.5 relative z-20"
                    >
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder={t('descriptionPlaceholder')}
                        minHeight="min-h-[110px]"
                        onOpenUploadModal={() => setIsUploadModalOpen(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachments Section directly below Description (matching Create Task modal) */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 animate-in fade-in duration-200 mt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-primary-dark block">
                        {t('attachments', { count: attachments.length })}
                      </label>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setAttachments([])}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                          <span>{t('clearAll')}</span>
                        </button>
                        <span className="text-primary-medium/30">•</span>
                        <button
                          type="button"
                          onClick={() => setIsUploadModalOpen(true)}
                          className="text-xs font-semibold text-primary-dark hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <LuPlus className="w-3.5 h-3.5" />
                          <span>{t('addMore')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Display attachment cards: 2 columns, scrollable if > 4 */}
                    <div className="max-h-[124px] overflow-y-auto custom-scrollbar pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between gap-2.5 bg-[#f7f6f2] hover:bg-[#f3f1ec] border border-primary-medium/15 rounded-xl px-2.5 py-2 shadow-2xs text-xs font-medium text-primary-dark transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileIconBadge name={att.name} type={att.type} size="sm" />
                              <div className="min-w-0 flex-1">
                                <span
                                  className="font-bold text-primary-dark block truncate"
                                  title={att.name}
                                >
                                  {att.name}
                                </span>
                                <span className="text-[10px] text-primary-medium/70 block">
                                  {att.formattedSize}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                              }
                              className="p-1 rounded-lg text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title={`Remove ${att.name}`}
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Start Date and Due Date (Same function and design as Create Task modal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                    {t('startDate')}
                  </label>
                  <MiniCalendarPicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder={t('startDate')}
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                    {t('dueDate')}
                  </label>
                  <MiniCalendarPicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder={t('dueDate')}
                    minDate={startDate || todayKey}
                  />
                </div>
              </div>

              {/* 3. Project Members Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs sm:text-sm font-semibold text-primary-dark">
                      {t('projectMembers')}
                    </label>
                    {selectedTeamIds.size > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-surface text-primary-dark border border-primary-medium/20">
                        {selectedTeamIds.size} {selectedTeamIds.size === 1 ? 'team' : 'teams'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenMembersDrawer}
                    className="text-xs font-semibold text-primary-medium/80 hover:text-primary-dark transition-colors cursor-pointer select-none"
                    title={t('assignMembers')}
                  >
                    {t('membersCount', { count: assignedMembers.length })}
                  </button>
                </div>

                {/* Main Profile Pics Row (UI 4 / UI 1) */}
                <div className="flex items-center gap-2.5 flex-wrap p-3 rounded-xl bg-[#faf9f5] border border-primary-medium/20">
                  {/* Assigned Team Badge Pills */}
                  {assignedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold bg-white border border-primary-medium/25 text-primary-dark shadow-2xs shrink-0"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: team.color || '#3B82F6' }}
                      />
                      <span className="truncate max-w-[120px]">{team.name}</span>
                      <span className="text-[10px] text-primary-medium/60 font-medium">
                        ({team.members?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleTeam(team)}
                        className="p-0.5 rounded-full text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title={`Remove ${team.name}`}
                      >
                        <LuX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Assigned Individual/Team Member Avatars */}
                  {assignedMembers.slice(0, 6).map((member) => (
                    <div
                      key={member.id}
                      className="relative group shrink-0"
                      title={`${member.name} (${member.role})`}
                    >
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={38}
                          height={38}
                          unoptimized
                          className="w-9.5 h-9.5 rounded-full object-cover border-2 border-white shadow-2xs group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="w-9.5 h-9.5 rounded-full bg-primary-dark text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}

                      {/* Small '✕' Remove Badge on Profile Pic */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAssignedMember(member.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-primary-dark/70 hover:text-red-600 hover:bg-red-50 border border-primary-medium/30 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                        title="Remove member"
                        aria-label={`Remove ${member.name}`}
                      >
                        <LuX className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}

                  {/* If more than 6 members, indicate with +Remaining badge */}
                  {assignedMembers.length > 6 && (
                    <div
                      onClick={handleOpenMembersDrawer}
                      className="w-9.5 h-9.5 rounded-full bg-primary-surface/70 text-primary-dark text-xs font-bold flex items-center justify-center border-2 border-white shadow-2xs cursor-pointer hover:bg-primary-surface transition-colors shrink-0"
                      title="View all members"
                    >
                      +{assignedMembers.length - 6}
                    </div>
                  )}

                  {/* Quick Add Button beside avatars */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsTeamDrawerOpen(false);
                      handleOpenMembersDrawer();
                    }}
                    className={`w-9.5 h-9.5 rounded-full border border-dashed flex items-center justify-center bg-white transition-all cursor-pointer shadow-2xs shrink-0 ${
                      isMembersDrawerOpen
                        ? 'border-primary-dark ring-2 ring-primary-dark/20 text-primary-dark bg-primary-surface/30'
                        : 'border-primary-medium/35 hover:border-primary-dark text-primary-medium/70 hover:text-primary-dark'
                    }`}
                    title={t('addMembers')}
                  >
                    <LuPlus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Assign Team Button (beside + sign with LuUsers icon) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMembersDrawerOpen(false);
                      setIsTeamDrawerOpen((prev) => !prev);
                    }}
                    className={`w-9.5 h-9.5 rounded-full border border-dashed flex items-center justify-center bg-white transition-all cursor-pointer shadow-2xs shrink-0 ${
                      isTeamDrawerOpen || selectedTeamIds.size > 0
                        ? 'border-primary ring-2 ring-primary/20 text-primary bg-primary/5'
                        : 'border-primary-medium/35 hover:border-primary-dark text-primary-medium/70 hover:text-primary-dark'
                    }`}
                    title={t('assignTeam')}
                    aria-label={t('assignTeam')}
                  >
                    <LuUsers className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>

                {/* Extended Team Assignment Drawer */}
                <AnimatePresence>
                  {isTeamDrawerOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden bg-white border border-primary-medium/20 rounded-2xl shadow-md p-4 sm:p-5 space-y-4"
                    >
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary-surface/60 flex items-center justify-center text-primary-dark">
                            <LuUsers className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-primary-dark">
                              {t('assignTeamsTitle')}
                            </h3>
                            <p className="text-[11px] text-primary-medium/70">
                              {t('assignTeamsSubtitle')}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-primary-medium/80 font-semibold px-2.5 py-1 rounded-lg bg-primary-surface/60">
                          {selectedTeamIds.size} selected
                        </span>
                      </div>

                      {/* Team Search Input */}
                      <div className="relative flex items-center">
                        <LuSearch
                          className="absolute left-3 w-4 h-4 text-primary-medium/60 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          placeholder={t('searchTeamsPlaceholder')}
                          className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl pl-9 pr-8 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                        />
                        {teamSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setTeamSearchQuery('')}
                            className="absolute right-2.5 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
                          >
                            <LuX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Teams List */}
                      <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {filteredTeams.length === 0 ? (
                          <div className="py-8 text-center text-xs text-primary-medium/70">
                            {teams.length === 0
                              ? t('noTeamsCreated')
                              : t('noTeamsMatching', { query: teamSearchQuery })}
                          </div>
                        ) : (
                          filteredTeams.map((team) => {
                            const isSelected = selectedTeamIds.has(team.id);
                            const { isActive, projectName: activeProjName } = isTeamActiveOnProject(
                              team,
                              projects
                            );

                            return (
                              <div
                                key={team.id}
                                className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-[#faf9f6] border-primary-dark/30 shadow-2xs'
                                    : 'bg-white border-primary-medium/15 hover:border-primary-medium/30'
                                }`}
                              >
                                {/* Left: Color dot + Team name + Member count & avatars */}
                                <div
                                  onClick={() => handleToggleTeam(team)}
                                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                                    style={{ backgroundColor: team.color || '#3B82F6' }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs sm:text-sm font-bold text-primary-dark truncate">
                                        {team.name}
                                      </span>
                                      <span className="text-[11px] text-primary-medium/70 font-medium">
                                        · {team.members?.length || 0} members
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                      {team.members && team.members.length > 0 ? (
                                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                                          {team.members.slice(0, 4).map((m) => (
                                            <Image
                                              key={m.id}
                                              src={m.avatar || '/Avatar.jpg'}
                                              alt={m.name}
                                              width={20}
                                              height={20}
                                              unoptimized
                                              className="inline-block w-5 h-5 rounded-full ring-1 ring-white object-cover"
                                            />
                                          ))}
                                          {team.members.length > 4 && (
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-primary-dark text-[9px] font-bold ring-1 ring-white">
                                              +{team.members.length - 4}
                                            </span>
                                          )}
                                        </div>
                                      ) : null}

                                      {isActive && activeProjName && (
                                        <span className="text-[10px] text-primary-medium/60 truncate max-w-[140px]">
                                          ({activeProjName})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Status badge & Toggle Button */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Status Badge */}
                                  {isActive ? (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/50">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      On Standby
                                    </span>
                                  )}

                                  {/* Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTeam(team)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isSelected
                                        ? 'bg-primary-dark text-white shadow-2xs'
                                        : 'border border-primary-medium/25 text-primary-dark hover:bg-primary-surface/40'
                                    }`}
                                  >
                                    {isSelected ? (
                                      <>
                                        <LuCheck className="w-3.5 h-3.5" />
                                        <span>{t('assigned')}</span>
                                      </>
                                    ) : (
                                      <span>{t('assign')}</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Drawer Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-primary-medium/10">
                        <button
                          type="button"
                          onClick={handleClearAllTeams}
                          disabled={selectedTeamIds.size === 0}
                          className="text-xs font-medium text-primary-medium/80 hover:text-primary-dark underline cursor-pointer disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                        >
                          {t('clearTeams')}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsTeamDrawerOpen(false)}
                          className="px-4 py-1.5 rounded-md bg-primary-dark hover:bg-primary text-white text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          {t('done')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Extended Member Assignment UI (UI 2 & UI 3) */}
                <AnimatePresence>
                  {isMembersDrawerOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden bg-white border border-primary-medium/20 rounded-2xl shadow-md p-4 sm:p-5 space-y-4"
                    >
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-primary-dark">
                          {t('projectMembers')}
                        </h3>
                        <span className="text-xs text-primary-medium/70 font-medium">
                          {stagingMembers.size} selected
                        </span>
                      </div>

                      {/* Search Input (UI 2) */}
                      <div className="relative flex items-center">
                        <LuSearch
                          className="absolute left-3 w-4 h-4 text-primary-medium/60 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          placeholder={t('searchMembersPlaceholder')}
                          className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl pl-9 pr-3.5 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                        />
                      </div>

                      {/* Members List with Role Dropdowns (UI 2) */}
                      <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {filteredUsers.map((user) => {
                          const isSelected = stagingMembers.has(user.id);
                          const currentRole = stagingMembers.get(user.id) || 'Member';
                          const isCurrentUser =
                            user.id === currentUser.id ||
                            user.email === currentUser.email ||
                            user.id === 'usr_01';

                          return (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-[#faf9f6] border-primary-dark/25'
                                  : 'bg-white border-primary-medium/15 hover:border-primary-medium/30'
                              }`}
                            >
                              {/* Left: Avatar + Name + Email */}
                              <div
                                onClick={() => handleToggleMember(user)}
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                              >
                                {user.avatar ? (
                                  <Image
                                    src={user.avatar}
                                    alt={user.fullName}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-primary-medium/15"
                                  />
                                ) : (
                                  <span className="w-9 h-9 rounded-full bg-primary-dark text-white text-xs font-bold flex items-center justify-center shrink-0">
                                    {user.fullName.slice(0, 2).toUpperCase()}
                                  </span>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-bold text-primary-dark truncate">
                                      {user.fullName}
                                    </span>
                                    {isCurrentUser && (
                                      <span className="text-[10px] font-semibold bg-primary-surface px-1.5 py-0.2 rounded text-primary-dark/80">
                                        {t('you')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-primary-medium/70 truncate">
                                    {user.email}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Role & Actions */}
                              {isSelected ? (
                                isCurrentUser ? (
                                  /* Owner badge: no option box, fixed role */
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-dark text-white shadow-2xs select-none">
                                      {t('roles.owner') || 'Owner'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMember(user)}
                                      className="p-1 rounded-md text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Remove from project"
                                      aria-label="Remove from project"
                                    >
                                      <LuX className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  /* Other members: dropdown with Manager or Member */
                                  <div className="relative shrink-0 flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenRoleDropdownId(
                                          openRoleDropdownId === user.id ? null : user.id
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary-medium/25 bg-white text-xs font-semibold text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <span>
                                        {currentRole === 'Manager' ? 'Manager' : 'Member'}
                                      </span>
                                      <LuChevronDown className="w-3.5 h-3.5 text-primary-medium/70" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleMember(user)}
                                      className="p-1 rounded-md text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Remove member"
                                      aria-label="Remove member"
                                    >
                                      <LuX className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Role Dropdown Menu: Manager or Member */}
                                    {openRoleDropdownId === user.id && (
                                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-primary-medium/20 py-1 z-30 font-elms">
                                        {NON_OWNER_ROLES.map((role) => {
                                          const isRoleActive =
                                            currentRole === role ||
                                            (role === 'Member' && currentRole === 'Members');
                                          return (
                                            <button
                                              key={role}
                                              type="button"
                                              onClick={() => handleChangeRole(user.id, role)}
                                              className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
                                                isRoleActive
                                                  ? 'bg-primary-surface/50 text-primary-dark font-bold'
                                                  : 'text-primary-dark/80 hover:bg-primary-surface/30'
                                              }`}
                                            >
                                              <span>{role}</span>
                                              {isRoleActive && (
                                                <LuCheck className="w-3.5 h-3.5 text-primary-dark" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleMember(user)}
                                  className="px-3 py-1.5 rounded-lg border border-primary-medium/25 text-xs font-semibold text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer shrink-0"
                                >
                                  + Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Extended Footer Options (UI 3) */}
                      <div className="flex items-center justify-between pt-3 border-t border-primary-medium/10">
                        {/* Left: Reset to default */}
                        <button
                          type="button"
                          onClick={handleResetMembersToDefault}
                          className="text-xs font-medium text-primary-medium/80 hover:text-primary-dark underline cursor-pointer"
                        >
                          {t('resetToDefault')}
                        </button>

                        {/* Right: Cancel & Assign members */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsMembersDrawerOpen(false)}
                            className="px-3.5 py-1.5 rounded-md border border-primary-medium/25 text-xs font-medium text-primary-dark hover:bg-primary-surface/40 transition-all cursor-pointer"
                          >
                            {t('cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmAssignMembers}
                            className="px-4 py-1.5 rounded-md bg-primary-dark hover:bg-primary text-white text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            {t('assignMembers')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Notification & Set Reminder (UI 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Notification: Email | Slack */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                    {t('notification')}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, email: !prev.email }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        notifications.email
                          ? 'bg-primary-dark text-white shadow-2xs'
                          : 'bg-[#faf9f5] border border-primary-medium/25 text-primary-dark/80 hover:bg-primary-surface/40'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, slack: !prev.slack }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        notifications.slack
                          ? 'bg-primary-dark text-white shadow-2xs'
                          : 'bg-[#faf9f5] border border-primary-medium/25 text-primary-dark/80 hover:bg-primary-surface/40'
                      }`}
                    >
                      Slack
                    </button>
                  </div>
                </div>

                {/* Set Reminder */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                    {t('setReminder')}
                  </label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-xl px-3 py-2 text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 cursor-pointer"
                  >
                    <option value="30 minutes before">30 minutes before</option>
                    <option value="1 hour before">1 hour before</option>
                    <option value="1 day before">1 day before</option>
                    <option value="2 days before">2 days before</option>
                  </select>
                </div>
              </div>
            </form>

            {/* Modal Bottom Actions (Cancel + Create Project with theme colors & rounded-md) */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-medium/10 bg-white shrink-0 select-none">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-primary-medium/25 text-xs sm:text-sm font-medium text-primary-dark hover:bg-primary-surface/40 transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2 rounded-md bg-primary-dark hover:bg-primary text-white text-xs sm:text-sm font-medium shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* File Upload Modal matching the Create Task modal */}
    <FileUploadModal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onAttachFiles={(newAttachments) => {
        setAttachments(newAttachments);
      }}
      initialAttachments={attachments}
    />
  </>
);
}
