import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RoadmapPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });

  return (
    <div className="bg-white/75 backdrop-blur-md border border-primary-medium/10 rounded-2xl p-8 shadow-xs max-w-4xl">
      <h1 className="text-2xl font-bold text-primary-dark">
        {t('roadmapTitle')}
      </h1>
      <p className="text-primary-medium mt-1 text-sm">
        {t('roadmapDesc')}
      </p>
    </div>
  );
}
