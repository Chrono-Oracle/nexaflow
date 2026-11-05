import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { locale as routeLocale } from 'next/root-params';

export default getRequestConfig(async () => {
  const currentLocale = await routeLocale();
  let locale = currentLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as 'en' | 'fr')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
