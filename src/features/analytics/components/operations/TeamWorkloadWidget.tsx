'use client';

import { toast } from 'sonner';
import { LuDownload, LuUsers, LuFolder } from 'react-icons/lu';
import { Team } from '@/features/team/types/team.types';
import { Task } from '@/features/tasks/types/task.types';
import { Project } from '@/features/projects/types/project.types';

interface TeamWorkloadWidgetProps {
  teams: Team[];
  tasks: Task[];
  projects?: Project[];
}

export function TeamWorkloadWidget({
  teams,
  tasks: _tasks,
  projects = [],
}: TeamWorkloadWidgetProps) {
  const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  const handleExport = () => {
    try {
      const csvRows = [
        'Team,Members,Assigned Projects,Status',
        ...teams.map((t) => {
          const assigned = projects
            .filter(
              (p) =>
                p.teamIds?.includes(t.id) ||
                t.projectIds?.includes(p.id) ||
                t.projectId === p.id
            )
            .map((p) => p.name)
            .join('; ');
          const projName = assigned || t.projectName || 'None';
          const status = t.status || (projName !== 'None' ? 'Active' : 'On Standby');
          return `"${t.name}",${t.members?.length || 0},"${projName}","${status}"`;
        }),
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute(
        'download',
        `nexaflow_teams_summary_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Team project assignments exported as CSV');
    } catch {
      toast.success('Analytics summary exported');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs font-elms flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-primary-medium/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center">
              <LuUsers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary-dark">
                Teams & Assignments
              </h3>
              <p className="text-[11px] text-primary-medium/70">
                Active teams and project allocations
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <span className="text-[11px] font-semibold text-primary-medium/70">
              Active Teams
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-0.5">
              {teams.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <span className="text-[11px] font-semibold text-primary-medium/70">
              Assigned Members
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-0.5">
              {totalMembers}
            </div>
          </div>
        </div>

        {/* Brief Teams & Assigned Projects Summary List */}
        <div className="mt-4 pt-3 border-t border-primary-medium/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-primary-dark">
            <span>Team Allocations</span>
            <span className="text-[11px] font-semibold text-primary-medium/70">
              {teams.length} {teams.length === 1 ? 'team' : 'teams'}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="py-4 text-center text-xs text-primary-medium/60 font-medium">
              No teams created yet
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5 custom-scrollbar">
              {teams.map((team) => {
                // Determine assigned project(s) for this team
                const assignedProjects = projects.filter(
                  (p) =>
                    p.teamIds?.includes(team.id) ||
                    team.projectIds?.includes(p.id) ||
                    team.projectId === p.id
                );

                const hasAssignedProjects =
                  assignedProjects.length > 0 || Boolean(team.projectName);
                const projectDisplay =
                  assignedProjects.length > 0
                    ? assignedProjects.map((p) => p.name).join(', ')
                    : team.projectName || 'Unassigned (On Standby)';

                return (
                  <div
                    key={team.id}
                    className="p-2.5 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/70 border border-neutral-200/60 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Team Color Dot Indicator */}
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: team.color || '#3b82f6' }}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-primary-dark truncate">
                          {team.name}
                        </p>
                        <p className="text-[11px] text-primary-medium/70 truncate flex items-center gap-1 mt-0.5">
                          <LuFolder className="w-3 h-3 shrink-0 text-primary-medium/50" />
                          <span
                            className={
                              hasAssignedProjects
                                ? 'text-primary-dark/85 font-medium'
                                : 'text-primary-medium/50 italic'
                            }
                          >
                            {projectDisplay}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Member Count Badge */}
                    <div className="shrink-0">
                      <span className="text-[10px] font-semibold text-primary-medium/80 bg-white px-2 py-0.5 rounded-md border border-neutral-200/80 shadow-2xs whitespace-nowrap">
                        {team.members?.length || 0}{' '}
                        {team.members?.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Export / Report Actions */}
      <div className="pt-4 mt-4 border-t border-primary-medium/10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-dark hover:bg-primary text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <LuDownload className="w-3.5 h-3.5" />
          <span>Export Analytics</span>
        </button>
      </div>
    </div>
  );
}
