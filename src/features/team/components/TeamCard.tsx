'use client';

import { useState, useMemo } from 'react';
import {
  LuUsers,
  LuTrash2,
  LuCalendar,
  LuFolder,
  LuChevronDown,
  LuFolderPlus,
} from 'react-icons/lu';
import { Team } from '../types/team.types';
import { Project } from '@/features/projects/types/project.types';
import { AuthUser } from '@/data/users';
import { isTeamActiveOnProject } from '../utils/teamStatus';
import { TeamMemberAvatars } from './TeamMemberAvatars';
import { TeamStatusBadge } from './TeamStatusBadge';
import { AssignProjectMenu } from './AssignProjectMenu';
import { TeamMembersDropdown } from './members/TeamMembersDropdown';

interface TeamCardProps {
  team: Team;
  projects: Project[];
  allUsers: AuthUser[];
  isMembersOpen: boolean;
  membersPlacement: 'top' | 'bottom';
  onToggleMembers: (teamId: string, e: React.MouseEvent) => void;
  onCloseMembers: () => void;
  onAddMember: (team: Team, user: AuthUser) => void;
  onRemoveMember: (team: Team, memberId: string, memberName: string) => void;
  onUpdateRole: (team: Team, memberId: string, newRole: string) => void;
  onToggleStatus: (team: Team, memberId: string) => void;
  onAssignProject: (teamId: string, projectId: string | null) => void;
  onDeleteTeam: (teamId: string, teamName: string) => void;
}

export function TeamCard({
  team,
  projects,
  allUsers,
  isMembersOpen,
  membersPlacement,
  onToggleMembers,
  onCloseMembers,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  onToggleStatus,
  onAssignProject,
  onDeleteTeam,
}: TeamCardProps) {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [projectMenuPlacement, setProjectMenuPlacement] = useState<'right' | 'left'>('right');

  const statusInfo = useMemo(
    () => isTeamActiveOnProject(team, projects),
    [team, projects]
  );
  const isActive = statusInfo.isActive;
  const assignedProjectName = statusInfo.projectName;

  const formattedDate = useMemo(() => {
    return new Date(team.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [team.createdAt]);

  // Compute workspace users not yet in this team
  const availableUsersToAdd = useMemo(() => {
    const existingMemberIds = new Set([
      ...(team.memberIds || []),
      ...team.members.map((m) => m.id),
    ]);
    const existingMemberEmails = new Set(
      team.members.map((m) => m.email?.toLowerCase()).filter(Boolean)
    );

    return allUsers.filter((u) => {
      if (existingMemberIds.has(u.id)) return false;
      if (existingMemberEmails.has(u.email?.toLowerCase())) return false;
      return true;
    });
  }, [allUsers, team.memberIds, team.members]);

  const handleOpenProjectMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Close members dropdown if open
    onCloseMembers();

    if (isProjectMenuOpen) {
      setIsProjectMenuOpen(false);
      return;
    }

    // Determine placement based on window bounds
    const rect = e.currentTarget.getBoundingClientRect();
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    if (rect.right + 340 > screenWidth) {
      setProjectMenuPlacement('left');
    } else {
      setProjectMenuPlacement('right');
    }

    setIsProjectMenuOpen(true);
  };

  const handleCardDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      onDeleteTeam(team.id, team.name);
    }
  };

  return (
    <div
      data-team-card={team.id}
      onClick={(e) => onToggleMembers(team.id, e)}
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
              onClick={handleCardDelete}
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

            {/* Assign / Change Button with Popover Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={handleOpenProjectMenu}
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

              <AssignProjectMenu
                currentProjectId={team.projectId}
                projects={projects}
                isOpen={isProjectMenuOpen}
                placement={projectMenuPlacement}
                onClose={() => setIsProjectMenuOpen(false)}
                onSelectProject={(projId) => {
                  onAssignProject(team.id, projId);
                  setIsProjectMenuOpen(false);
                }}
                isActive={isActive}
              />
            </div>
          </div>
        </div>

        {/* Member Avatars Stack & Status Badge */}
        <div className="mt-3.5 pt-3 border-t border-primary-medium/10 flex items-center justify-between">
          <TeamMemberAvatars members={team.members} />
          <TeamStatusBadge isActive={isActive} />
        </div>
      </div>

      {/* Members Dropdown Drawer */}
      <TeamMembersDropdown
        team={team}
        isOpen={isMembersOpen}
        placement={membersPlacement}
        availableUsers={availableUsersToAdd}
        onClose={onCloseMembers}
        onAddMember={(user) => onAddMember(team, user)}
        onRemoveMember={(mId, mName) => onRemoveMember(team, mId, mName)}
        onUpdateRole={(mId, newRole) => onUpdateRole(team, mId, newRole)}
        onToggleStatus={(mId) => onToggleStatus(team, mId)}
        onConfirmDeleteTeam={() => onDeleteTeam(team.id, team.name)}
      />
    </div>
  );
}
