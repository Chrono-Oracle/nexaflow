'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LuPlus } from 'react-icons/lu';
import { useTeamsQuery } from '@/hooks/useDashboardData';
import { TeamEmptyState } from '@/features/team/components/TeamEmptyState';
import { CreateTeamModal } from '@/features/team/components/CreateTeamModal';
import { TeamsGrid } from '@/features/team/components/TeamsGrid';

export default function TeamPage() {
  const t = useTranslations('teamPage');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const { data: teams = [] } = useTeamsQuery();

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

          {/* Create Team button in header appears once teams have been created */}
          {teams.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCreateTeamOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <LuPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('createTeam')}</span>
            </button>
          )}
        </div>
      </div>

      {/* When no teams exist, show TeamEmptyState; otherwise show TeamsGrid */}
      {teams.length === 0 ? (
        <TeamEmptyState onCreateTeam={() => setIsCreateTeamOpen(true)} />
      ) : (
        <TeamsGrid
          teams={teams}
          onCreateTeam={() => setIsCreateTeamOpen(true)}
        />
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />
    </div>
  );
}
