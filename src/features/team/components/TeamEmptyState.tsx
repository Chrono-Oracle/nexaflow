'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Lottie } from 'lottie-react';
import { LuPlus } from 'react-icons/lu';
import teamAnimation from '@/assets/animations/team.json';

interface TeamEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onCreateTeam?: () => void;
}

const emptySubscribe = () => () => {};

export function TeamEmptyState({
  title,
  description,
  actionLabel,
  onCreateTeam,
}: TeamEmptyStateProps) {
  const t = useTranslations('teamPage.emptyState');

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center font-elms select-none bg-white rounded-2xl border border-primary-medium/15 shadow-xs px-4 sm:px-6 w-full">
      {/* Lottie Animation Container (4:3 aspect ratio matching team.json 800x600) */}
      <div className="w-64 h-48 sm:w-80 sm:h-60 md:w-96 md:h-72 flex items-center justify-center">
        {isMounted ? (
          <Lottie
            src={teamAnimation}
            autoplay
            loop
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Copy */}
      <h3 className="text-base sm:text-xl font-bold text-primary-dark tracking-tight mt-3 sm:mt-4">
        {title || t('title')}
      </h3>
      <p className="text-xs sm:text-sm text-primary-medium/70 max-w-md mt-1.5 px-4 leading-relaxed">
        {description || t('description')}
      </p>

      {/* Create Team Button */}
      <button
        type="button"
        onClick={onCreateTeam}
        className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary-dark text-white text-xs sm:text-sm font-medium shadow-md hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <LuPlus className="w-4 h-4 stroke-[2.5]" />
        <span>{actionLabel || t('createTeam')}</span>
      </button>
    </div>
  );
}
