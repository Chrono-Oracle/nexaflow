'use client';

import { useMemo } from 'react';
import { Project } from '@/features/projects/types/project.types';
import { Task } from '@/features/tasks/types/task.types';

interface OperationsOverviewCardProps {
  projects: Project[];
  tasks: Task[];
}

export function OperationsOverviewCard({
  projects,
  tasks,
}: OperationsOverviewCardProps) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const inReviewTasks = tasks.filter((t) => t.status === 'In Review').length;
    const todoTasks = tasks.filter((t) => t.status === 'To Do').length;

    const urgentTasks = tasks.filter((t) => t.priority === 'Urgent').length;
    const highTasks = tasks.filter((t) => t.priority === 'High').length;
    const mediumTasks = tasks.filter((t) => t.priority === 'Medium').length;
    const lowTasks = tasks.filter((t) => t.priority === 'Low').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      inReviewTasks,
      todoTasks,
      urgentTasks,
      highTasks,
      mediumTasks,
      lowTasks,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'In Progress').length,
    };
  }, [projects, tasks]);

  const pipeline = [
    { label: 'To Do', count: stats.todoTasks, color: 'bg-amber-400', textColor: 'text-amber-700' },
    { label: 'In Progress', count: stats.inProgressTasks, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'In Review', count: stats.inReviewTasks, color: 'bg-purple-500', textColor: 'text-purple-700' },
    { label: 'Completed', count: stats.completedTasks, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-5 sm:p-6 shadow-xs font-elms">
      <div className="flex items-center justify-between pb-4 border-b border-primary-medium/10">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary-dark tracking-tight">
            Operational Throughput
          </h3>
          <p className="text-xs text-primary-medium/70 mt-0.5">
            Real-time pipeline lifecycle and priority distribution
          </p>
        </div>
        <span className="text-xs font-bold text-primary-dark px-2.5 py-1 rounded-lg bg-primary-surface border border-primary-medium/15">
          {stats.totalTasks} total tasks
        </span>
      </div>

      {/* Pipeline Status Progress */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-primary-medium/80">
          <span>Task Pipeline Distribution</span>
          <span>{stats.completedTasks} / {stats.totalTasks} Done</span>
        </div>

        {/* Stacked multi-color progress bar */}
        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden flex">
          {stats.totalTasks > 0 ? (
            pipeline.map((item) => {
              const pct = (item.count / stats.totalTasks) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={item.label}
                  style={{ width: `${pct}%` }}
                  className={`${item.color} h-full transition-all`}
                  title={`${item.label}: ${item.count} tasks`}
                />
              );
            })
          ) : (
            <div className="w-full bg-neutral-200 h-full" />
          )}
        </div>

        {/* Pipeline Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {pipeline.map((item) => (
            <div
              key={item.label}
              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs font-medium text-primary-medium/80">
                  {item.label}
                </span>
              </div>
              <span className={`text-xs font-bold ${item.textColor}`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="pt-5 mt-5 border-t border-primary-medium/10">
        <h4 className="text-xs font-bold text-primary-dark mb-2.5">
          Priority Matrix
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-red-50/70 border border-red-200/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Urgent</span>
            <span className="text-xs font-extrabold text-red-800">{stats.urgentTasks}</span>
          </div>
          <div className="p-2 rounded-lg bg-orange-50/70 border border-orange-200/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700">High</span>
            <span className="text-xs font-extrabold text-orange-800">{stats.highTasks}</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Medium</span>
            <span className="text-xs font-extrabold text-blue-800">{stats.mediumTasks}</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-100/70 border border-neutral-200/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700">Low</span>
            <span className="text-xs font-extrabold text-neutral-800">{stats.lowTasks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
