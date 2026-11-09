'use client';

import { LuUsers } from 'react-icons/lu';

interface TeamFilteredEmptyStateProps {
  searchQuery?: string;
  activeFilter?: 'all' | 'active' | 'standby';
  onClearSearch?: () => void;
}

export function TeamFilteredEmptyState({
  searchQuery = '',
  activeFilter = 'all',
  onClearSearch,
}: TeamFilteredEmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-primary-medium/15 p-12 text-center font-elms shadow-xs">
      <LuUsers className="w-10 h-10 text-primary-medium/40 mx-auto mb-3" />
      <h3 className="text-base font-bold text-primary-dark">
        {searchQuery
          ? `No teams matching "${searchQuery}"`
          : activeFilter === 'active'
          ? 'No active teams currently'
          : activeFilter === 'standby'
          ? 'No teams on standby'
          : 'No teams found'}
      </h3>
      <p className="text-xs sm:text-sm text-primary-medium/70 max-w-sm mx-auto mt-1">
        {searchQuery
          ? 'Try searching with a different keyword, project, or member name.'
          : activeFilter === 'active'
          ? 'Teams currently assigned to a project will appear here.'
          : activeFilter === 'standby'
          ? 'Teams yet to be assigned to a project will appear here.'
          : 'Start by creating your first team space.'}
      </p>
      {searchQuery && onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-4 px-4 py-1.5 rounded-md border border-primary-medium/20 text-xs font-medium text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
