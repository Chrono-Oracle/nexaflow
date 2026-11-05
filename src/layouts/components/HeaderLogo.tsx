'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function HeaderLogo() {
  const t = useTranslations('header');

  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
        <Image
          src="/NFBW.svg"
          alt={t('brandName')}
          width={80}
          height={80}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="text-lg sm:text-xl font-bold tracking-tight text-primary-dark">
        {t('brandName')}
      </span>
    </Link>
  );
}
