'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LuSearch, LuX, LuPlus } from 'react-icons/lu';
import { AuthUser } from '@/data/users';

interface AddTeamMemberSectionProps {
  isOpen: boolean;
  availableUsers: AuthUser[];
  onAddUser: (user: AuthUser) => void;
}

export function AddTeamMemberSection({
  isOpen,
  availableUsers,
  onAddUser,
}: AddTeamMemberSectionProps) {
  const t = useTranslations('teamPage.membersDropdown');
  const [search, setSearch] = useState('');

  const filteredUsers = availableUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.title?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-b border-primary-medium/10 py-2.5 space-y-2 bg-[#fcfbf8] -mx-3.5 px-3.5 sm:-mx-4 sm:px-4 shrink-0"
        >
          {/* Search bar */}
          <div className="relative flex items-center">
            <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-primary-medium/60 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchAddPlaceholder')}
              autoFocus
              className="w-full h-8 pl-8 pr-7 rounded-md bg-white border border-primary-medium/25 text-xs text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 text-primary-medium/50 hover:text-primary-dark p-0.5 rounded-full cursor-pointer"
              >
                <LuX className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* List of Available Users */}
          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
            {filteredUsers.length === 0 ? (
              <div className="py-3 text-center text-xs text-primary-medium/60 italic">
                {search
                  ? t('noMatchingUsers', { query: search })
                  : t('allUsersInTeam')}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-primary-medium/15 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.fullName}
                        width={26}
                        height={26}
                        unoptimized
                        className="w-6.5 h-6.5 rounded-full object-cover shrink-0 ring-1 ring-white"
                      />
                    ) : (
                      <span className="w-6.5 h-6.5 rounded-full bg-primary-dark text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-primary-dark truncate">
                        {user.fullName}
                      </div>
                      <div className="text-[10px] text-primary-medium/70 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddUser(user)}
                    className="px-2.5 py-1 rounded-md bg-primary-dark hover:bg-primary text-white text-[11px] font-medium shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <LuPlus className="w-3 h-3" />
                    <span>{t('addMemberBtn')}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
