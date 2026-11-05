'use client';

import { useTranslations } from 'next-intl';
import {
  LuFolderClock,
  LuLayers,
  LuClipboardCheck,
  LuCircleAlert,
} from 'react-icons/lu';
import { useDashboardStatsQuery } from '@/hooks/useDashboardData';
import { StatCard } from './StatCard';

export function StatsGrid() {
  const t = useTranslations('stats');
  const { data: stats } = useDashboardStatsQuery();

  const statItems = [
    {
      id: 'active-projects',
      icon: LuFolderClock,
      title: t('activeProjects'),
      value: stats?.activeProjects ?? 0,
      href: '/projects',
    },
    {
      id: 'tasks-in-progress',
      icon: LuLayers,
      title: t('tasksInProgress'),
      value: stats?.tasksInProgress ?? 0,
      href: '/tasks',
    },
    {
      id: 'completed-tasks',
      icon: LuClipboardCheck,
      title: t('completedTasks'),
      value: stats?.completedTasks ?? 0,
      href: '/tasks',
    },
    {
      id: 'overdue-tasks',
      icon: LuCircleAlert,
      title: t('overdueTasks'),
      value: stats?.overdueTasks ?? 0,
      href: '/tasks',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <StatCard
          key={item.id}
          icon={item.icon}
          title={item.title}
          value={item.value}
          href={item.href}
          viewDetailsText={t('viewDetails')}
        />
      ))}
    </div>
  );
}
