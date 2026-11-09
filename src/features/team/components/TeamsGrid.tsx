'use client';

import { useState, useMemo } from 'react';
import { useProjectsQuery } from '@/hooks/useDashboardData';
import { getAuthUsers } from '@/data/users';
import { Team } from '../types/team.types';
import { useTeamActions } from '../hooks/useTeamActions';
import { TeamCard } from './TeamCard';
import { TeamFilteredEmptyState } from './TeamFilteredEmptyState';

export interface TeamsGridProps {
  teams: Team[];
  onCreateTeam: () => void;
  activeFilter?: 'all' | 'active' | 'standby';
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function TeamsGrid({
  teams,
  activeFilter = 'all',
  searchQuery = '',
  onClearSearch,
}: TeamsGridProps) {
  const allUsers = useMemo(() => getAuthUsers(), []);
  const { data: projects = [] } = useProjectsQuery();

  const {
    addMemberToTeam,
    removeMemberFromTeam,
    updateMemberRole,
    toggleMemberStatus,
    assignProject,
    deleteTeam,
  } = useTeamActions();

  // Track which team card has its members drawer open and its placement
  const [openMembersTeamId, setOpenMembersTeamId] = useState<string | null>(null);
  const [membersPlacement, setMembersPlacement] = useState<'bottom' | 'top'>('bottom');

  const handleToggleTeamMembers = (teamId: string, e: React.MouseEvent) => {
    if (openMembersTeamId === teamId) {
      setOpenMembersTeamId(null);
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

    setOpenMembersTeamId(teamId);
  };

  const handleCloseMembers = () => {
    setOpenMembersTeamId(null);
  };

  if (teams.length === 0) {
    return (
      <TeamFilteredEmptyState
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
    <div className="space-y-6 font-elms select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            projects={projects}
            allUsers={allUsers}
            isMembersOpen={openMembersTeamId === team.id}
            membersPlacement={membersPlacement}
            onToggleMembers={handleToggleTeamMembers}
            onCloseMembers={handleCloseMembers}
            onAddMember={addMemberToTeam}
            onRemoveMember={removeMemberFromTeam}
            onUpdateRole={updateMemberRole}
            onToggleStatus={toggleMemberStatus}
            onAssignProject={(tId, pId) => assignProject(tId, pId, projects)}
            onDeleteTeam={deleteTeam}
          />
        ))}
      </div>
    </div>
  );
}
