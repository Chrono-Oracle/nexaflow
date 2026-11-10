'use client';

import { useTranslations } from 'next-intl';
import { IoNotificationsOutline } from 'react-icons/io5';

export function HeaderActions() {
  const t = useTranslations('header');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Notifications Button (Visible on both mobile & desktop) */}
      <button
        type="button"
        aria-label={t('notifications')}
        title={t('notifications')}
        className="p-2.5 rounded-xl bg-white/70 hover:bg-white text-primary-dark border border-primary-medium/10 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <IoNotificationsOutline className="w-4 h-4" />
      </button>
    </div>
  );
}
