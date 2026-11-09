'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { useTeamsQuery, useProjectsQuery } from '@/hooks/useDashboardData';
import { TeamEmptyState } from '@/features/team/components/TeamEmptyState';
import { CreateTeamModal } from '@/features/team/components/CreateTeamModal';
import { TeamsGrid } from '@/features/team/components/TeamsGrid';
import { isTeamActiveOnProject } from '@/features/team/utils/teamStatus';

type TeamFilterTab = 'all' | 'active' | 'standby';

export default function TeamPage() {
  const t = useTranslations('teamPage');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TeamFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: teams = [] } = useTeamsQuery();
  const { data: projects = [] } = useProjectsQuery();

  // Active teams vs Standby teams calculation
  const activeTeams = useMemo(() => {
    return teams.filter((team) => isTeamActiveOnProject(team, projects).isActive);
  }, [teams, projects]);

  const standbyTeams = useMemo(() => {
    return teams.filter((team) => !isTeamActiveOnProject(team, projects).isActive);
  }, [teams, projects]);

  const displayedTeams = useMemo(() => {
    const base =
      activeFilter === 'active'
        ? activeTeams
        : activeFilter === 'standby'
        ? standbyTeams
        : teams;

    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();

    return base.filter((team) => {
      const statusInfo = isTeamActiveOnProject(team, projects);
      const matchesName = team.name.toLowerCase().includes(q);
      const matchesProject = statusInfo.projectName?.toLowerCase().includes(q);
      const matchesMembers = team.members.some(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );

      return matchesName || matchesProject || matchesMembers;
    });
  }, [activeFilter, activeTeams, standbyTeams, teams, searchQuery, projects]);

  return (
    <div className="font-elms w-full space-y-6 pb-12">
      {/* Top Header Card */}
      <div
        data-team-header
        className="sticky top-[112px] md:top-[72px] z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:px-6 sm:py-3.5 border border-primary-medium/15 shadow-xs font-elms transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* In Empty State: Show Title & Subtitle. Once teams exist: Show the 3 Filter Links */}
          {teams.length === 0 ? (
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-primary-dark">
                {t('title')}
              </h1>
              <p className="text-xs sm:text-sm text-primary-medium/70 mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {/* Tab 1: All */}
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-primary-surface text-primary-dark font-bold shadow-2xs'
                    : 'text-primary-medium/70 hover:text-primary-dark hover:bg-neutral-50'
                }`}
              >
                <span>{t('filterTabs.all')}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-white text-primary-dark shadow-2xs'
                      : 'bg-neutral-100 text-primary-medium/80'
                  }`}
                >
                  {teams.length}
                </span>
              </button>

              {/* Tab 2: Active teams */}
              <button
                type="button"
                onClick={() => setActiveFilter('active')}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === 'active'
                    ? 'bg-primary-surface text-primary-dark font-bold shadow-2xs'
                    : 'text-primary-medium/70 hover:text-primary-dark hover:bg-neutral-50'
                }`}
              >
                <span>{t('filterTabs.active')}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                    activeFilter === 'active'
                      ? 'bg-white text-primary-dark shadow-2xs'
                      : 'bg-neutral-100 text-primary-medium/80'
                  }`}
                >
                  {activeTeams.length}
                </span>
              </button>

              {/* Tab 3: On standby */}
              <button
                type="button"
                onClick={() => setActiveFilter('standby')}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === 'standby'
                    ? 'bg-primary-surface text-primary-dark font-bold shadow-2xs'
                    : 'text-primary-medium/70 hover:text-primary-dark hover:bg-neutral-50'
                }`}
              >
                <span>{t('filterTabs.standby')}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                    activeFilter === 'standby'
                      ? 'bg-white text-primary-dark shadow-2xs'
                      : 'bg-neutral-100 text-primary-medium/80'
                  }`}
                >
                  {standbyTeams.length}
                </span>
              </button>
            </div>
          )}

          {/* Right Header Controls: Search Bar + Create Team button */}
          {teams.length > 0 && (
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Search Bar */}
              <div className="relative flex items-center flex-1 sm:w-56 md:w-64 max-w-xs">
                <LuSearch
                  className="absolute left-3 w-4 h-4 text-primary-medium/60 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full h-9 sm:h-9.5 pl-9 pr-8 rounded-xl bg-primary-surface/30 hover:bg-primary-surface/50 focus:bg-white border border-primary-medium/20 text-xs sm:text-sm text-primary-dark placeholder:text-primary-medium/60 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
                    aria-label="Clear search"
                  >
                    <LuX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Create Team button */}
              <button
                type="button"
                onClick={() => setIsCreateTeamOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              >
                <LuPlus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('createTeam')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* When no teams exist, show TeamEmptyState; otherwise show TeamsGrid */}
      {teams.length === 0 ? (
        <TeamEmptyState onCreateTeam={() => setIsCreateTeamOpen(true)} />
      ) : (
        <TeamsGrid
          teams={displayedTeams}
          onCreateTeam={() => setIsCreateTeamOpen(true)}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
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
