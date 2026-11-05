import type { Metadata } from 'next';
import { Geist, Geist_Mono, Elms_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { AppProviders } from '@/providers/AppProviders';
import { Header } from '@/layouts/Header';
import { Sidebar } from '@/layouts/Sidebar';
import { MobileNav } from '@/layouts/MobileNav';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const elmsSans = Elms_Sans({
  variable: '--font-elms-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NexaFlow',
  description: 'Next generation Workflow & Project Management System',
};

export { generateStaticParams } from '@/i18n/routing';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate supported locales
  if (!routing.locales.includes(locale as 'en' | 'fr')) {
    notFound();
  }

  // Load translation messages statically for the current locale
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${elmsSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <Header />
            <div className="flex-1 flex px-4 md:px-6 pt-2 md:pt-2.5 pb-24 md:pb-6 gap-5 md:gap-6">
              <Sidebar />
              <main className="flex-1 min-w-0 transition-all">{children}</main>
            </div>
            <MobileNav />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
