'use client';

import { useTranslations } from 'next-intl';

export default function ProjectsPage() {
  const t = useTranslations('pages');

  return (
    <div className="bg-white/75 backdrop-blur-md border border-primary-medium/10 rounded-2xl p-8 shadow-xs max-w-4xl">
      <h1 className="text-2xl font-bold text-primary-dark">
        {t('projectsTitle')}
      </h1>
      <p className="text-primary-medium mt-1 text-sm">
        {t('projectsDesc')}
      </p>
    </div>
  );
}
