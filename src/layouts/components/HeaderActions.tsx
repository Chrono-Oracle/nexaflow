'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { IoNotificationsOutline } from 'react-icons/io5';

export function HeaderActions() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Language Switcher Pill (Desktop only; mobile has floating globe button) */}
      <button
        onClick={toggleLanguage}
        title={t('switchLanguage')}
        aria-label={t('switchLanguage')}
        className="hidden md:inline-flex px-2.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-xs font-semibold text-primary uppercase border border-primary-medium/10 shadow-2xs transition-all hover:scale-105 active:scale-95"
      >
        {locale === 'en' ? 'FR' : 'EN'}
      </button>

      {/* Notifications Button (Visible on both mobile & desktop) */}
      <button
        type="button"
        aria-label={t('notifications')}
        title={t('notifications')}
        className="p-2.5 rounded-xl bg-white/70 hover:bg-white text-primary-dark border border-primary-medium/10 shadow-2xs transition-all hover:scale-105 active:scale-95"
      >
        <IoNotificationsOutline className="w-4 h-4" />
      </button>
    </div>
  );
}
