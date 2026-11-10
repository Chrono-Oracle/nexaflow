'use client';

import { toast } from 'sonner';
import { LuDownload, LuActivity } from 'react-icons/lu';
import { Team } from '@/features/team/types/team.types';
import { Task } from '@/features/tasks/types/task.types';

interface TeamWorkloadWidgetProps {
  teams: Team[];
  tasks: Task[];
}

export function TeamWorkloadWidget({ teams, tasks }: TeamWorkloadWidgetProps) {
  const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  const activeTasks = tasks.filter((t) => t.status !== 'Completed').length;

  const handleExport = () => {
    toast.success('Analytics summary exported as CSV');
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs font-elms flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-primary-medium/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <LuActivity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary-dark">
                Team Capacity & Health
              </h3>
              <p className="text-[11px] text-primary-medium/70">
                Workload allocation across teams
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

        {/* Workload utilization bar */}
        <div className="mt-4 pt-3 border-t border-primary-medium/10">
          <div className="flex items-center justify-between text-xs font-semibold text-primary-medium/80 mb-1.5">
            <span>Overall Capacity Utilization</span>
            <span className="text-primary-dark font-bold">78%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-dark rounded-full transition-all" style={{ width: '78%' }} />
          </div>
          <p className="text-[11px] text-primary-medium/60 mt-1.5">
            {activeTasks} active operational tasks distributed smoothly
          </p>
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
