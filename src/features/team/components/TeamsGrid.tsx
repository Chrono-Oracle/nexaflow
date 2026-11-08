'use client';

import Image from 'next/image';
import { toast } from 'sonner';
import { LuUsers, LuTrash2, LuCalendar, LuPlus } from 'react-icons/lu';
import { useDeleteTeamMutation } from '@/hooks/useDashboardData';
import { Team } from '../types/team.types';

interface TeamsGridProps {
  teams: Team[];
  onCreateTeam: () => void;
}

export function TeamsGrid({ teams, onCreateTeam }: TeamsGridProps) {
  const deleteTeamMutation = useDeleteTeamMutation();

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

  return (
    <div className="space-y-6 font-elms select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
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
              className="bg-white rounded-2xl border border-primary-medium/15 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color || '#7C3AED' }}
              />

              <div>
                {/* Header: Color Indicator & Delete Button */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
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
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-medium/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    title="Delete team"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Team Info */}
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

                {/* Member Avatars Stack */}
                <div className="mt-4 pt-3.5 border-t border-primary-medium/10 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {team.members.slice(0, 5).map((member) => (
                      <Image
                        key={member.id}
                        src={member.avatar || '/Avatar.jpg'}
                        alt={member.name}
                        width={30}
                        height={30}
                        className="inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white object-cover"
                        title={member.name}
                      />
                    ))}
                    {team.members.length > 5 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 text-primary-dark text-[11px] font-bold ring-2 ring-white">
                        +{team.members.length - 5}
                      </span>
                    )}
                  </div>

                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${team.color || '#7C3AED'}15`,
                      color: team.color || '#7C3AED',
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
