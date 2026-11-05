'use client';

import { useTranslations } from 'next-intl';
import { IoSearchOutline } from 'react-icons/io5';

export function HeaderSearch() {
  const t = useTranslations('header');

  return (
    <div className="w-full max-w-xl lg:max-w-2xl">
      <div className="relative flex items-center h-11 bg-white/75 hover:bg-white focus-within:bg-white border border-primary-medium/15 rounded-xl px-4.5 shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary-light/40">
        <IoSearchOutline
          className="w-5 h-5 text-primary-medium/70 shrink-0"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="w-full bg-transparent pl-3 text-sm text-primary-dark placeholder:text-primary-medium/60 focus:outline-none"
        />
      </div>
    </div>
  );
}
