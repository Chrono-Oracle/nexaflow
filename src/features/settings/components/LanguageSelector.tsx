'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { LuCheck } from 'react-icons/lu';

interface LanguageSelectorProps {
  variant?: 'cards' | 'compact';
}

export function LanguageSelector({ variant = 'cards' }: LanguageSelectorProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (nextLocale: 'en' | 'fr') => {
    if (nextLocale === locale) return;

    const queryString = searchParams?.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(targetUrl, { locale: nextLocale });
    toast.success(
      nextLocale === 'fr'
        ? 'Langue définie sur Français'
        : 'Language changed to English'
    );
  };

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English (US)',
      badge: 'EN',
      flag: '🇺🇸',
    },
    {
      code: 'fr' as const,
      name: 'Français',
      nativeName: 'Français (FR)',
      badge: 'FR',
      flag: '🇫🇷',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-primary-medium/20 shadow-2xs">
        {languages.map((lang) => {
          const isSelected = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-base transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-primary-dark shadow-xs border border-primary-medium/15'
                  : 'text-primary-dark/70 hover:text-primary-dark'
              }`}
            >
              <span>{lang.flag}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg">
      {languages.map((lang) => {
        const isSelected = locale === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code)}
            className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
              isSelected
                ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                : 'border-primary-medium/20 bg-white hover:border-primary-medium/40 hover:bg-neutral-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-xl border border-primary-medium/20 shadow-2xs shrink-0">
                <span>{lang.flag}</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-primary-dark">
                  {lang.name}
                </p>
                <p className="text-[11px] text-primary-dark/70 font-medium">
                  {lang.nativeName}
                </p>
              </div>
            </div>

            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-xs shrink-0">
                <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
