'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  LuUsers,
  LuTrash2,
  LuCalendar,
  LuFolder,
  LuCheck,
  LuChevronDown,
} from 'react-icons/lu';
import {
  useDeleteTeamMutation,
  useUpdateTeamMutation,
  useProjectsQuery,
} from '@/hooks/useDashboardData';
import { Team } from '../types/team.types';
import { isTeamActiveOnProject } from '../utils/teamStatus';

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
  const deleteTeamMutation = useDeleteTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const { data: projects = [] } = useProjectsQuery();

  const [openProjectMenuTeamId, setOpenProjectMenuTeamId] = useState<string | null>(null);

  const handleDeleteTeam = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the team "${name}"?`)) {
      try {
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
            className="mt-4 px-4 py-1.5 rounded-xl border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-elms select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const statusInfo = isTeamActiveOnProject(team, projects);
          const isActive = statusInfo.isActive;
          const assignedProjectName = statusInfo.projectName;

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
              className="bg-white rounded-2xl border border-primary-medium/15 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-visible"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: team.color || '#7C3AED' }}
              />

              <div>
                {/* Header: Color Indicator, Name & Delete Button */}
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

                  <button
                    type="button"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-medium/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer shrink-0"
                    title="Delete team"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
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

                    {/* Quick Project Assignment Dropdown Button */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenProjectMenuTeamId((prev) =>
                            prev === team.id ? null : team.id
                          )
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-primary-medium hover:text-primary-dark hover:bg-neutral-100 border border-primary-medium/15 transition-colors cursor-pointer"
                        title="Assign or change project"
                      >
                        <span>Assign</span>
                        <LuChevronDown className="w-3 h-3" />
                      </button>

                      {openProjectMenuTeamId === team.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-primary-medium/20 py-1 z-30 divide-y divide-neutral-100">
                          <div className="px-3 py-1.5 text-[11px] font-semibold text-primary-medium/60">
                            Assign to project:
                          </div>

                          <div className="max-h-40 overflow-y-auto">
                            {projects.map((proj) => {
                              const isSelected = team.projectId === proj.id;
                              return (
                                <button
                                  key={proj.id}
                                  type="button"
                                  onClick={() =>
                                    handleAssignProject(team.id, proj.id)
                                  }
                                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-primary-surface/40 text-left text-xs text-primary-dark transition-colors cursor-pointer"
                                >
                                  <span className="truncate">{proj.name}</span>
                                  {isSelected && (
                                    <LuCheck className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-1">
                            <button
                              type="button"
                              onClick={() => handleAssignProject(team.id, null)}
                              className="w-full px-2 py-1 text-left text-[11px] text-amber-700 hover:bg-amber-50 rounded-md font-medium transition-colors cursor-pointer"
                            >
                              Move to standby (unassign)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Avatars Stack & Status Badge */}
                <div className="mt-3.5 pt-3 border-t border-primary-medium/10 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {team.members.length > 0 ? (
                      team.members.slice(0, 5).map((member) => (
                        <Image
                          key={member.id}
                          src={member.avatar || '/Avatar.jpg'}
                          alt={member.name}
                          width={30}
                          height={30}
                          className="inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white object-cover"
                          title={member.name}
                        />
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
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      On Standby
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
