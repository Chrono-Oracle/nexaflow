'use client';

import { toast } from 'sonner';
import {
  useDeleteTeamMutation,
  useUpdateTeamMutation,
} from '@/hooks/useDashboardData';
import { Team, TeamMember } from '../types/team.types';
import { AuthUser } from '@/data/users';
import { Project } from '@/features/projects/types/project.types';

export function useTeamActions() {
  const deleteTeamMutation = useDeleteTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();

  // Add an existing workspace user to the team
  const addMemberToTeam = async (team: Team, user: AuthUser) => {
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
      throw error;
    }
  };

  // Remove a member from the team
  const removeMemberFromTeam = async (
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
      throw error;
    }
  };

  // Update a member's role in the team
  const updateMemberRole = async (
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
      toast.success(`Updated role to ${newRole}`);
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role.');
      throw error;
    }
  };

  // Toggle a member's status (Active / On Leave)
  const toggleMemberStatus = async (team: Team, memberId: string) => {
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
      throw error;
    }
  };

  // Assign or unassign project
  const assignProject = async (
    teamId: string,
    projectId: string | null,
    projects: Project[]
  ) => {
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
      throw error;
    }
  };

  // Delete team
  const deleteTeam = async (teamId: string, teamName: string) => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      toast.success(`Team "${teamName}" deleted.`);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team.');
      throw error;
    }
  };

  return {
    addMemberToTeam,
    removeMemberFromTeam,
    updateMemberRole,
    toggleMemberStatus,
    assignProject,
    deleteTeam,
    isDeleting: deleteTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
  };
}
