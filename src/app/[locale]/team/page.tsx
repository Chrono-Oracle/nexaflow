'use client';

import { useTranslations } from 'next-intl';
import { TeamEmptyState } from '@/features/team/components/TeamEmptyState';

export default function TeamPage() {
  const t = useTranslations('teamPage');

  const handleCreateTeam = () => {
    // Will be wired to Create Team modal in upcoming steps
    console.log('Create team clicked');
  };

  return (
    <div className="font-elms w-full space-y-6 pb-12">
      {/* Top Header Card */}
      <div
        data-team-header
        className="sticky top-[112px] md:top-[72px] z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:px-6 sm:py-3.5 border border-primary-medium/15 shadow-xs font-elms transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-primary-dark">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-primary-medium/70 mt-0.5">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Team Empty State with team.json animation and Create Team button */}
      <TeamEmptyState onCreateTeam={handleCreateTeam} />
    </div>
  );
}
