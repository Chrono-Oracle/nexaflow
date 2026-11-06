'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { LuFilter, LuCalendar, LuArrowRight } from 'react-icons/lu';
import { getAuthUsers } from '@/data/users';
import {
  getProjectStatusStyle,
  getProjectPriorityStyle,
} from '@/features/projects/utils/badgeStyles';

export function AsideProjectCard() {
  const t = useTranslations('asideProjects');
  const tBadges = useTranslations('projectOverview');

  // Fetch 3 representative users from users.ts to populate avatars
  const assignedUsers = useMemo(() => {
    const all = getAuthUsers();
    // Return Sarah Jenkins, Roger Miller, and Marcus Vance
    return [all[1], all[2], all[4]];
  }, []);

  const statusStyle = getProjectStatusStyle('In Review');
  const priorityStyle = getProjectPriorityStyle('Medium');

  return (
    <div className="w-full font-elms select-none">
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

        {/* Filter Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <LuFilter className="w-3.5 h-3.5 text-white" />
          <span>{t('filter')}</span>
        </button>
      </div>

      {/* Main Project Card Container */}
      <div className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs space-y-4">
        {/* Top: Project Title, Subtitle & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-primary-dark tracking-tight">
              {t('demoTitle')}
            </h3>
            <p className="text-xs text-primary-medium/70 mt-0.5">
              {t('demoSubtitle')}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs shrink-0 ${statusStyle.className}`}
          >
            {tBadges(statusStyle.labelKey)}
          </span>
        </div>

        {/* Progress Bar & Percentage */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-primary-medium/75">{t('progress')}</span>
            <span className="text-primary-dark font-bold">86%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#edeae4] overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-dark transition-all duration-300"
              style={{ width: '86%' }}
            />
          </div>
        </div>

        {/* 3-Column Metrics Row (Total, Completed, Blocked) */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-primary-medium/10 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="text-base sm:text-lg font-bold text-primary-dark">
              28
            </div>
            <div className="text-xs text-primary-medium/65 mt-0.5">
              {t('total')}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-base sm:text-lg font-bold text-primary-dark">
              24
            </div>
            <div className="text-xs text-primary-medium/65 mt-0.5">
              {t('completed')}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-base sm:text-lg font-bold text-primary-dark">
              03
            </div>
            <div className="text-xs text-primary-medium/65 mt-0.5">
              {t('blocked')}
            </div>
          </div>
        </div>

        {/* Metadata Bottom Row: Deadline + Priority on left, User Avatars on right */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark/85">
              <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70" />
              <span>Mar 30</span>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium shadow-2xs ${priorityStyle.className}`}
            >
              {tBadges(priorityStyle.labelKey)}
            </span>
          </div>

          {/* Overlapping User Avatars from users.ts */}
          <div className="flex items-center -space-x-2">
            {assignedUsers.map((user) => (
              <Image
                key={user.id}
                src={user.avatar}
                alt={user.fullName}
                title={`${user.fullName} • ${user.title}`}
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs"
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <Link
          href="/projects"
          className="w-full py-2.5 rounded-md bg-primary-surface/60 hover:bg-primary-surface text-primary-dark text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-primary-medium/10 mt-1 cursor-pointer group"
        >
          <span>{t('viewDetails')}</span>
          <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
