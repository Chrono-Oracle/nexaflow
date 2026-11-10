'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useTheme } from '@/context/ThemeContext';

export function HeaderLogo() {
  const t = useTranslations('header');
  const { appearance } = useTheme();

  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
        {appearance?.companyLogo ? (
          <img
            src={appearance.companyLogo}
            alt={t('brandName')}
            className="w-full h-full object-contain rounded-xl"
          />
        ) : (
          <Image
            src="/NFBW.svg"
            alt={t('brandName')}
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
          />
        )}
      </div>
      <span className="text-lg sm:text-xl font-bold tracking-tight text-primary-dark dark:text-white header-brand-text">
        {t('brandName')}
      </span>
    </Link>
  );
}
