'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { currentUser } from '@/data/userDashboard';

export function HeaderUser() {
  const t = useTranslations('header');

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-primary-medium/20 shadow-2xs shrink-0">
        <Image
          src={currentUser.avatar || '/Avatar.jpg'}
          alt={currentUser.fullName}
          width={36}
          height={36}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="hidden sm:flex flex-col text-left leading-tight">
        <span className="text-sm font-semibold text-primary-dark">
          {currentUser.fullName}
        </span>
        <span className="text-xs text-primary-medium">
          {t('opsManager')}
        </span>
      </div>
    </div>
  );
}
