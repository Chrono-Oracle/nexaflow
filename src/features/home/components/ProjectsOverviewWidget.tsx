'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LuCalendar, LuChevronRight } from 'react-icons/lu';

interface ProjectRowItem {
  id: string;
  name: string;
  subtitle: string;
  status: 'In Progress' | 'Completed' | 'At Risk' | 'In Review';
  progress: number;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
}

// Dummy project data matching the reference UI
const DUMMY_PROJECTS: ProjectRowItem[] = [
  {
    id: 'proj-demo-1',
    name: 'Website Redesign',
    subtitle: 'Brand Identity',
    status: 'In Progress',
    progress: 68,
    priority: 'High',
    deadline: 'Apr 22',
  },
  {
    id: 'proj-demo-2',
    name: 'Mobile App V2',
    subtitle: 'Sarah Lee',
    status: 'Completed',
    progress: 100,
    priority: 'Medium',
    deadline: 'Mar 30',
  },
  {
    id: 'proj-demo-3',
    name: 'CRM Platform',
    subtitle: 'John Carter',
    status: 'At Risk',
    progress: 42,
    priority: 'High',
    deadline: 'Apr 14',
  },
  {
    id: 'proj-demo-4',
    name: 'Marketing Campaign',
    subtitle: 'Elena Rostova',
    status: 'In Review',
    progress: 86,
    priority: 'Medium',
    deadline: 'Apr 10',
  },
];

export function ProjectsOverviewWidget() {
  const t = useTranslations('projectOverview');

  const getStatusBadge = (status: ProjectRowItem['status']) => {
    switch (status) {
      case 'In Progress':
        return {
          label: t('status.inProgress'),
          className: 'bg-[#eef4ff] text-[#3b82f6] border border-[#dbeafe]',
        };
      case 'Completed':
        return {
          label: t('status.completed'),
          className: 'bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5]',
        };
      case 'At Risk':
        return {
          label: t('status.atRisk'),
          className: 'bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2]',
        };
      case 'In Review':
        return {
          label: t('status.inReview'),
          className: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
    }
  };

  const getPriorityBadge = (priority: ProjectRowItem['priority']) => {
    switch (priority) {
      case 'High':
        return {
          label: t('priority.high'),
          className: 'bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2]',
        };
      case 'Medium':
        return {
          label: t('priority.medium'),
          className: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
        };
      case 'Low':
        return {
          label: t('priority.low'),
          className: 'bg-[#eff6ff] text-[#3b82f6] border border-[#dbeafe]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-medium/15 shadow-xs font-elms">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary-dark tracking-tight">
            {t('title')}
          </h2>
          <p className="text-xs text-primary-medium/70 mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        {/* "View all" CTA Button (Replacing "New project" per user request) */}
        <Link
          href="/projects"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold shadow-xs hover:bg-primary transition-all active:scale-95"
        >
          {t('viewAll')}
        </Link>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full min-w-[620px] text-left border-collapse">
          <thead>
            <tr className="border-b border-primary-medium/10 text-xs font-medium text-primary-medium/60">
              <th scope="col" className="py-3 px-3 pl-0 font-medium">
                {t('columns.projectName')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.status')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.progress')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.priority')}
              </th>
              <th scope="col" className="py-3 px-3 font-medium">
                {t('columns.deadline')}
              </th>
              <th scope="col" className="py-3 px-3 pr-0 text-right font-medium">
                {t('columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-medium/10">
            {DUMMY_PROJECTS.map((project) => {
              const statusBadge = getStatusBadge(project.status);
              const priorityBadge = getPriorityBadge(project.priority);

              return (
                <tr
                  key={project.id}
                  className="hover:bg-primary-surface/40 transition-colors group"
                >
                  {/* 1. Project Name & Subtitle */}
                  <td className="py-4 px-3 pl-0">
                    <div className="font-bold text-sm text-primary-dark tracking-tight">
                      {project.name}
                    </div>
                    <div className="text-xs text-primary-medium/65 mt-0.5 font-normal">
                      {project.subtitle}
                    </div>
                  </td>

                  {/* 2. Status Badge */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs ${statusBadge.className}`}
                    >
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* 3. Progress Bar & % */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 sm:w-28 h-2 rounded-full bg-[#edeae4] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-dark transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-primary-dark/80 shrink-0 w-8 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </td>

                  {/* 4. Priority Badge */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs ${priorityBadge.className}`}
                    >
                      {priorityBadge.label}
                    </span>
                  </td>

                  {/* 5. Deadline with Calendar Icon */}
                  <td className="py-4 px-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark/85">
                      <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70" />
                      <span>{project.deadline}</span>
                    </div>
                  </td>

                  {/* 6. Actions (View >) */}
                  <td className="py-4 px-3 pr-0 text-right">
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-medium/75 hover:text-primary-dark transition-colors"
                    >
                      <span>{t('view')}</span>
                      <LuChevronRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
