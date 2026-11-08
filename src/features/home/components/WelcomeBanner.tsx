'use client';

import { useTranslations } from 'next-intl';
import { LuPlus } from 'react-icons/lu';
import { currentUser } from '@/data/userDashboard';

interface WelcomeBannerProps {
  onCreateProject?: () => void;
}

export function WelcomeBanner({ onCreateProject }: WelcomeBannerProps) {
  const t = useTranslations('pages');

  // Display user's first name or nickname
  const displayName = currentUser.fullName.split(' ')[1] || currentUser.fullName.split(' ')[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 font-elms">
      {/* Left: Greeting Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-dark flex items-center gap-2">
          <span>{t('welcomeBack', { name: displayName })}</span>
          <span className="inline-block hover:rotate-12 transition-transform cursor-default select-none" aria-hidden="true">
            👋
          </span>
        </h1>
        <p className="text-sm sm:text-base text-primary-medium/80 mt-1 font-normal">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Right: + Create Project CTA Button */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={onCreateProject}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-md bg-primary-dark text-white text-xs sm:text-sm font-medium shadow-md hover:bg-primary transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <LuPlus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t('createProject')}</span>
        </button>
      </div>
    </div>
  );
}
