'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  LuUsers,
  LuTrash2,
  LuCalendar,
  LuFolder,
  LuCheck,
  LuSearch,
  LuX,
  LuFolderPlus,
  LuClock,
  LuChevronDown,
  LuPlus,
} from 'react-icons/lu';
import {
  useDeleteTeamMutation,
  useUpdateTeamMutation,
  useProjectsQuery,
} from '@/hooks/useDashboardData';
import { Team, TeamMember } from '../types/team.types';
import { isTeamActiveOnProject } from '../utils/teamStatus';
import { getAuthUsers, AuthUser } from '@/data/users';

interface TeamsGridProps {
  teams: Team[];
  onCreateTeam: () => void;
  activeFilter?: 'all' | 'active' | 'standby';
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function TeamsGrid({
  teams,
  onCreateTeam,
  activeFilter = 'all',
  searchQuery = '',
  onClearSearch,
}: TeamsGridProps) {
  const t = useTranslations('teamPage.membersDropdown');
  const allUsers = useMemo(() => getAuthUsers(), []);

  const deleteTeamMutation = useDeleteTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const { data: projects = [] } = useProjectsQuery();

  const [openProjectMenuTeamId, setOpenProjectMenuTeamId] = useState<string | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [menuPlacement, setMenuPlacement] = useState<'right' | 'left'>('right');

  // Members Dropdown State
  const [openMembersTeamId, setOpenMembersTeamId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [membersPlacement, setMembersPlacement] = useState<'bottom' | 'top'>('bottom');

  // Add Member in Dropdown State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');

  // Member Role Editing State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Team Deletion Confirmation State
  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const membersDropdownRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenProjectMenuTeamId(null);
        setProjectSearchQuery('');
      }

      if (
        membersDropdownRef.current &&
        !membersDropdownRef.current.contains(target)
      ) {
        // Only close if click is not inside a team card (which has its own toggle handler)
        const isInsideCard = (event.target as HTMLElement).closest(
          '[data-team-card]'
        );
        if (!isInsideCard) {
          setOpenMembersTeamId(null);
          setMemberSearchQuery('');
          setIsAddMemberOpen(false);
          setAddMemberSearch('');
          setEditingMemberId(null);
          setConfirmDeleteTeamId(null);
        }
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenProjectMenuTeamId(null);
        setOpenMembersTeamId(null);
        setMemberSearchQuery('');
        setProjectSearchQuery('');
        setIsAddMemberOpen(false);
        setAddMemberSearch('');
        setEditingMemberId(null);
        setConfirmDeleteTeamId(null);
      }
    }

    if (openProjectMenuTeamId || openMembersTeamId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [openProjectMenuTeamId, openMembersTeamId]);

  const handleToggleTeamMembers = (teamId: string, e: React.MouseEvent) => {
    if (openMembersTeamId === teamId) {
      setOpenMembersTeamId(null);
      setMemberSearchQuery('');
      setIsAddMemberOpen(false);
      setAddMemberSearch('');
      setEditingMemberId(null);
      setConfirmDeleteTeamId(null);
      return;
    }

    // Determine whether to place dropdown above or below based on viewport
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = typeof window !== 'undefined' ? window.innerHeight - rect.bottom : 300;
    if (spaceBelow < 260 && rect.top > spaceBelow) {
      setMembersPlacement('top');
    } else {
      setMembersPlacement('bottom');
    }

    setOpenProjectMenuTeamId(null);
    setOpenMembersTeamId(teamId);
    setMemberSearchQuery('');
    setIsAddMemberOpen(false);
    setAddMemberSearch('');
    setEditingMemberId(null);
    setConfirmDeleteTeamId(null);
  };

  // Add an existing workspace user to the team
  const handleAddMemberToTeam = async (team: Team, user: AuthUser) => {
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

    const updatedMembers = [...(team.members || []), newMember];
    const updatedMemberIds = Array.from(
      new Set([...(team.memberIds || []), user.id])
    );

    try {
      await updateTeamMutation.mutateAsync({
        id: team.id,
        updates: {
          members: updatedMembers,
          memberIds: updatedMemberIds,
        },
      });
      toast.success(`Added ${user.fullName} to ${team.name}`);
    } catch (error) {
      console.error('Failed to add member to team:', error);
      toast.error('Failed to add member to team.');
    }
  };

  // Remove a member from the team
  const handleRemoveMemberFromTeam = async (
    team: Team,
    memberId: string,
    memberName: string
  ) => {
    const updatedMembers = (team.members || []).filter((m) => m.id !== memberId);
    const updatedMemberIds = (team.memberIds || []).filter((id) => id !== memberId);

    try {
      await updateTeamMutation.mutateAsync({
        id: team.id,
        updates: {
          members: updatedMembers,
          memberIds: updatedMemberIds,
        },
      });
      toast.success(`Removed ${memberName} from ${team.name}`);
    } catch (error) {
      console.error('Failed to remove member from team:', error);
      toast.error('Failed to remove member from team.');
    }
  };

  // Update a member's role in the team
  const handleUpdateMemberRole = async (
    team: Team,
    memberId: string,
    newRole: string
  ) => {
    const updatedMembers = (team.members || []).map((m) =>
      m.id === memberId ? { ...m, role: newRole } : m
    );

    try {
      await updateTeamMutation.mutateAsync({
        id: team.id,
        updates: {
          members: updatedMembers,
        },
      });
      setEditingMemberId(null);
      toast.success(`Updated role to ${newRole}`);
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role.');
    }
  };

  // Toggle a member's status (Active / On Leave)
  const handleToggleMemberStatus = async (team: Team, memberId: string) => {
    const updatedMembers = (team.members || []).map((m) => {
      if (m.id === memberId) {
        const nextStatus: 'Active' | 'On Leave' =
          m.status === 'Active' ? 'On Leave' : 'Active';
        return { ...m, status: nextStatus };
      }
      return m;
    });

    try {
      await updateTeamMutation.mutateAsync({
        id: team.id,
        updates: {
          members: updatedMembers,
        },
      });
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update member status:', error);
      toast.error('Failed to update member status.');
    }
  };

  // Delete team with confirmation
  const handleConfirmDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      if (openMembersTeamId === teamId) setOpenMembersTeamId(null);
      if (openProjectMenuTeamId === teamId) setOpenProjectMenuTeamId(null);
      setConfirmDeleteTeamId(null);
      await deleteTeamMutation.mutateAsync(teamId);
      toast.success(`Team "${teamName}" deleted.`);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team.');
    }
  };

  const handleOpenProjectMenu = (
    teamId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    // Close members dropdown if open
    setOpenMembersTeamId(null);
    setMemberSearchQuery('');

    if (openProjectMenuTeamId === teamId) {
      setOpenProjectMenuTeamId(null);
      setProjectSearchQuery('');
      return;
    }

    // Determine whether to extend to the right or left based on screen space
    const rect = e.currentTarget.getBoundingClientRect();
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    if (rect.right + 340 > screenWidth) {
      setMenuPlacement('left');
    } else {
      setMenuPlacement('right');
    }

    setOpenProjectMenuTeamId(teamId);
    setProjectSearchQuery('');
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the team "${name}"?`)) {
      try {
        if (openMembersTeamId === id) setOpenMembersTeamId(null);
        if (openProjectMenuTeamId === id) setOpenProjectMenuTeamId(null);
        await deleteTeamMutation.mutateAsync(id);
        toast.success(`Team "${name}" deleted.`);
      } catch (error) {
        console.error('Failed to delete team:', error);
        toast.error('Failed to delete team.');
      }
    }
  };

  const handleAssignProject = async (teamId: string, projectId: string | null) => {
    try {
      if (!projectId) {
        // Set to standby
        await updateTeamMutation.mutateAsync({
          id: teamId,
          updates: {
            projectId: undefined,
            projectName: undefined,
            status: 'On Standby',
          },
        });
        toast.success('Team moved to standby');
      } else {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          await updateTeamMutation.mutateAsync({
            id: teamId,
            updates: {
              projectId: project.id,
              projectName: project.name,
              status: 'Active',
            },
          });
          toast.success(`Team assigned to ${project.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to update project assignment:', error);
      toast.error('Failed to update team assignment.');
    } finally {
      setOpenProjectMenuTeamId(null);
      setProjectSearchQuery('');
    }
  };

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-primary-medium/15 p-12 text-center font-elms shadow-xs">
        <LuUsers className="w-10 h-10 text-primary-medium/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-primary-dark">
          {searchQuery
            ? `No teams matching "${searchQuery}"`
            : activeFilter === 'active'
            ? 'No active teams currently'
            : activeFilter === 'standby'
            ? 'No teams on standby'
            : 'No teams found'}
        </h3>
        <p className="text-xs sm:text-sm text-primary-medium/70 max-w-sm mx-auto mt-1">
          {searchQuery
            ? 'Try searching with a different keyword, project, or member name.'
            : activeFilter === 'active'
            ? 'Teams currently assigned to a project will appear here.'
            : activeFilter === 'standby'
            ? 'Teams yet to be assigned to a project will appear here.'
            : 'Start by creating your first team space.'}
        </p>
        {searchQuery && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 px-4 py-1.5 rounded-md border border-primary-medium/20 text-xs font-medium text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  // Filter projects by the in-menu search bar
  const filteredProjects = projects.filter((p) => {
    if (!projectSearchQuery.trim()) return true;
    const q = projectSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-elms select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const statusInfo = isTeamActiveOnProject(team, projects);
          const isActive = statusInfo.isActive;
          const assignedProjectName = statusInfo.projectName;
          const isMembersOpen = openMembersTeamId === team.id;

          // Filter members by the dropdown search bar if typed
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

          // Workspace users not yet in this team
          const existingMemberIds = new Set([
            ...(team.memberIds || []),
            ...team.members.map((m) => m.id),
          ]);
          const existingMemberEmails = new Set(
            team.members.map((m) => m.email?.toLowerCase()).filter(Boolean)
          );

          const availableUsersToAdd = allUsers.filter((u) => {
            if (existingMemberIds.has(u.id)) return false;
            if (existingMemberEmails.has(u.email?.toLowerCase())) return false;
            if (addMemberSearch.trim()) {
              const q = addMemberSearch.toLowerCase();
              return (
                u.fullName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.title?.toLowerCase().includes(q) ||
                u.department?.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const formattedDate = new Date(team.createdAt).toLocaleDateString(
            undefined,
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }
          );

          return (
            <div
              key={team.id}
              data-team-card={team.id}
              onClick={(e) => handleToggleTeamMembers(team.id, e)}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-visible cursor-pointer ${
                isMembersOpen
                  ? 'border-primary-dark/35 ring-2 ring-primary-dark/10 shadow-md'
                  : 'border-primary-medium/15 hover:border-primary-medium/35'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: team.color || '#7C3AED' }}
              />

              <div>
                {/* Header: Color Indicator, Name & Actions */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: team.color || '#7C3AED' }}
                    />
                    <h3 className="font-bold text-base sm:text-lg text-primary-dark tracking-tight truncate">
                      {team.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team.id, team.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-medium/40 hover:text-red-500 rounded-md hover:bg-red-50 transition-all cursor-pointer shrink-0"
                      title="Delete team"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                    <div
                      className={`p-1.5 rounded-md text-primary-medium/60 transition-transform duration-200 ${
                        isMembersOpen
                          ? 'rotate-180 text-primary-dark bg-primary-surface/60'
                          : 'group-hover:text-primary-dark'
                      }`}
                      title={isMembersOpen ? 'Hide members' : 'View members'}
                    >
                      <LuChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Team Info (Member Count & Creation Date) */}
                <div className="flex items-center gap-3 text-xs text-primary-medium/70 mt-2">
                  <span className="flex items-center gap-1.5">
                    <LuUsers className="w-3.5 h-3.5" />
                    <span>
                      {team.members.length} member
                      {team.members.length === 1 ? '' : 's'}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <LuCalendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                {/* Project Assignment Section */}
                <div className="mt-3.5 pt-3 border-t border-primary-medium/10">
                  <div className="flex items-center justify-between gap-2 relative">
                    <div className="min-w-0 flex-1">
                      {isActive && assignedProjectName ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary-dark font-medium truncate">
                          <LuFolder className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{assignedProjectName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-primary-medium/55 italic">
                          Not assigned to a project
                        </span>
                      )}
                    </div>

                    {/* Assign / Change Button with Animated Extended Menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleOpenProjectMenu(team.id, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-2xs transition-all active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-primary-surface hover:bg-primary-surface/80 text-primary-dark border border-primary-medium/20'
                            : 'bg-primary-dark hover:bg-primary text-white shadow-md'
                        }`}
                        title={isActive ? 'Change assigned project' : 'Assign to a project'}
                      >
                        <LuFolderPlus className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{isActive ? 'Change' : 'Assign'}</span>
                      </button>

                      {/* Animated Extended Menu extending to the right */}
                      <AnimatePresence>
                        {openProjectMenuTeamId === team.id && (
                          <motion.div
                            ref={menuRef}
                            initial={{
                              opacity: 0,
                              x: menuPlacement === 'right' ? -14 : 14,
                              scale: 0.95,
                            }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{
                              opacity: 0,
                              x: menuPlacement === 'right' ? -14 : 14,
                              scale: 0.95,
                            }}
                            transition={{
                              duration: 0.22,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className={`absolute z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-primary-medium/20 p-3.5 select-none ${
                              menuPlacement === 'right'
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
                                onClick={() => setOpenProjectMenuTeamId(null)}
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
                                value={projectSearchQuery}
                                onChange={(e) =>
                                  setProjectSearchQuery(e.target.value)
                                }
                                placeholder="Search projects..."
                                autoFocus
                                className="w-full h-8 pl-8 pr-7 rounded-md bg-primary-surface/40 hover:bg-primary-surface/60 focus:bg-white border border-primary-medium/20 text-xs text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                              />
                              {projectSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setProjectSearchQuery('')}
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
                                  {projectSearchQuery
                                    ? 'No matching projects found'
                                    : 'No projects created yet'}
                                </div>
                              ) : (
                                filteredProjects.map((proj) => {
                                  const isSelected = team.projectId === proj.id;

                                  return (
                                    <button
                                      key={proj.id}
                                      type="button"
                                      onClick={() =>
                                        handleAssignProject(team.id, proj.id)
                                      }
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
                                            backgroundColor:
                                              proj.color || '#2563EB',
                                          }}
                                        />
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-primary-dark truncate">
                                            {proj.name}
                                          </p>
                                          <p className="text-[10px] text-primary-medium/60 truncate">
                                            {proj.status} • {proj.taskCount || 0}{' '}
                                            tasks
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
                                  onClick={() =>
                                    handleAssignProject(team.id, null)
                                  }
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
                    </div>
                  </div>
                </div>

                {/* Member Avatars Stack & Status Badge */}
                <div className="mt-3.5 pt-3 border-t border-primary-medium/10 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {team.members.length > 0 ? (
                      team.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="relative inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white overflow-hidden bg-neutral-100 shrink-0"
                          title={member.name}
                        >
                          <Image
                            src={member.avatar || '/Avatar.jpg'}
                            alt={member.name}
                            width={32}
                            height={32}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-primary-medium/50 italic">
                        0 members
                      </span>
                    )}
                    {team.members.length > 5 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 text-primary-dark text-[11px] font-bold ring-2 ring-white">
                        +{team.members.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      On Standby
                    </span>
                  )}
                </div>
              </div>

              {/* Animated Members Dropdown List with Member Editing, Adding & Team Deletion */}
              <AnimatePresence>
                {isMembersOpen && (
                  <motion.div
                    ref={membersDropdownRef}
                    initial={{
                      opacity: 0,
                      y: membersPlacement === 'top' ? 12 : -12,
                      scale: 0.96,
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: membersPlacement === 'top' ? 12 : -12,
                      scale: 0.96,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute z-40 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-primary-medium/20 p-3.5 sm:p-4 font-elms select-none cursor-default max-h-[480px] flex flex-col ${
                      membersPlacement === 'top'
                        ? 'bottom-full mb-3'
                        : 'top-full mt-3'
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
                          onClick={() => {
                            setIsAddMemberOpen((prev) => !prev);
                            setAddMemberSearch('');
                          }}
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
                          onClick={() => {
                            setOpenMembersTeamId(null);
                            setMemberSearchQuery('');
                            setIsAddMemberOpen(false);
                            setConfirmDeleteTeamId(null);
                          }}
                          className="text-primary-medium/50 hover:text-primary-dark p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Close list"
                        >
                          <LuX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Add Members Sub-Panel */}
                    <AnimatePresence>
                      {isAddMemberOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-b border-primary-medium/10 py-2.5 space-y-2 bg-[#fcfbf8] -mx-3.5 px-3.5 sm:-mx-4 sm:px-4 shrink-0"
                        >
                          <div className="relative flex items-center">
                            <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-primary-medium/60 pointer-events-none" />
                            <input
                              type="text"
                              value={addMemberSearch}
                              onChange={(e) => setAddMemberSearch(e.target.value)}
                              placeholder={t('searchAddPlaceholder')}
                              autoFocus
                              className="w-full h-8 pl-8 pr-7 rounded-md bg-white border border-primary-medium/25 text-xs text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            />
                            {addMemberSearch && (
                              <button
                                type="button"
                                onClick={() => setAddMemberSearch('')}
                                className="absolute right-2 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
                              >
                                <LuX className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* List of Available Users not in this team */}
                          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                            {availableUsersToAdd.length === 0 ? (
                              <div className="py-3 text-center text-xs text-primary-medium/60 italic">
                                {addMemberSearch
                                  ? t('noMatchingUsers', { query: addMemberSearch })
                                  : t('allUsersInTeam')}
                              </div>
                            ) : (
                              availableUsersToAdd.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-primary-medium/15 transition-all"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {user.avatar ? (
                                      <Image
                                        src={user.avatar}
                                        alt={user.fullName}
                                        width={26}
                                        height={26}
                                        unoptimized
                                        className="w-6.5 h-6.5 rounded-full object-cover shrink-0 ring-1 ring-white"
                                      />
                                    ) : (
                                      <span className="w-6.5 h-6.5 rounded-full bg-primary-dark text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {user.fullName.slice(0, 2).toUpperCase()}
                                      </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-primary-dark truncate">
                                        {user.fullName}
                                      </div>
                                      <div className="text-[10px] text-primary-medium/70 truncate">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleAddMemberToTeam(team, user)}
                                    className="px-2.5 py-1 rounded-md bg-primary-dark hover:bg-primary text-white text-[11px] font-medium shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                                  >
                                    <LuPlus className="w-3 h-3" />
                                    <span>{t('addMemberBtn')}</span>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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

                    {/* Member Cards List (Scrollable) with Role Edit & Remove */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 py-2 pr-0.5 min-h-[100px] max-h-56">
                      {filteredTeamMembers.length === 0 ? (
                        <div className="py-6 text-center text-xs text-primary-medium/60">
                          {team.members.length === 0
                            ? t('noMembers')
                            : t('noMatching', { query: memberSearchQuery })}
                        </div>
                      ) : (
                        filteredTeamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="group/item flex items-center justify-between gap-2.5 p-2 rounded-md bg-[#faf9f6] hover:bg-primary-surface/40 border border-primary-medium/10 transition-colors relative"
                          >
                            {/* Avatar + Name + Role/Dept */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Image
                                src={member.avatar || '/Avatar.jpg'}
                                alt={member.name}
                                width={32}
                                height={32}
                                unoptimized
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-primary-dark truncate">
                                  {member.name}
                                </div>
                                <div className="text-[10px] text-primary-medium/70 truncate flex items-center gap-1.5">
                                  {/* Role selector dropdown */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingMemberId(
                                          editingMemberId === member.id ? null : member.id
                                        )
                                      }
                                      className="inline-flex items-center gap-0.5 hover:underline text-primary-dark/85 font-medium cursor-pointer"
                                      title={t('editRole')}
                                    >
                                      <span>{member.role || 'Member'}</span>
                                      <LuChevronDown className="w-2.5 h-2.5 text-primary-medium/60" />
                                    </button>

                                    {editingMemberId === member.id && (
                                      <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-50 font-elms">
                                        {[
                                          'Lead',
                                          'Senior',
                                          'Member',
                                          'Designer',
                                          'Engineer',
                                          'Product Manager',
                                        ].map((r) => (
                                          <button
                                            key={r}
                                            type="button"
                                            onClick={() =>
                                              handleUpdateMemberRole(team, member.id, r)
                                            }
                                            className={`w-full flex items-center justify-between px-2.5 py-1 text-[11px] text-left transition-colors cursor-pointer ${
                                              member.role === r
                                                ? 'bg-primary/10 text-primary-dark font-bold'
                                                : 'hover:bg-primary-surface/40 text-primary-dark'
                                            }`}
                                          >
                                            <span>{r}</span>
                                            {member.role === r && (
                                              <LuCheck className="w-3 h-3 text-primary-dark" />
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {member.department && (
                                    <>
                                      <span>•</span>
                                      <span>{member.department}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="shrink-0 flex items-center gap-2">
                              {/* Clickable Status toggle */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleMemberStatus(team, member.id)
                                }
                                className="cursor-pointer"
                                title="Click to toggle status"
                              >
                                {member.status === 'Active' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {t('active')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                    {t('onLeave')}
                                  </span>
                                )}
                              </button>

                              {/* Remove member button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveMemberFromTeam(
                                    team,
                                    member.id,
                                    member.name
                                  )
                                }
                                className="p-1 rounded-md text-primary-medium/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title={t('removeMember')}
                                aria-label={`Remove ${member.name} from team`}
                              >
                                <LuTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Dropdown Footer: Delete Team Action with Confirmation & Add Members Shortcut */}
                    <div className="pt-2.5 mt-2 border-t border-primary-medium/10 flex items-center justify-between shrink-0">
                      {confirmDeleteTeamId === team.id ? (
                        <div className="flex items-center justify-between w-full animate-in fade-in duration-150">
                          <span className="text-xs font-semibold text-red-600">
                            {t('confirmDelete')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleConfirmDeleteTeam(team.id, team.name)
                              }
                              className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                            >
                              {t('yesDelete')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTeamId(null)}
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
                            onClick={() => setConfirmDeleteTeamId(team.id)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                            <span>{t('deleteTeam')}</span>
                          </button>

                          {!isAddMemberOpen && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddMemberOpen(true);
                                setAddMemberSearch('');
                              }}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
