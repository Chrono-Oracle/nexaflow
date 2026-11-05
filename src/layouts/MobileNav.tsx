'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import {
  LuLayoutGrid,
  LuFolder,
  LuClipboardCheck,
  LuGlobe,
  LuUsers,
  LuCalendar,
  LuChartColumn,
  LuSettings,
  LuCircleHelp,
} from 'react-icons/lu';
import { TbGridDots } from 'react-icons/tb';

export function MobileNav() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Toggle between English and French
  const handleToggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  // Determine current active page key among main tabs or more menu
  const getActiveKey = () => {
    if (pathname.startsWith('/projects')) return '/projects';
    if (pathname.startsWith('/tasks')) return '/tasks';
    if (
      pathname.startsWith('/team') ||
      pathname.startsWith('/roadmap') ||
      pathname.startsWith('/analytics') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/help')
    ) {
      return 'more';
    }
    return '/'; // Dashboard default
  };

  const currentActiveKey = getActiveKey();

  // Point 4: When menu is opened, active indicator stays ONLY on the menu ('more').
  // When it closes, it smoothly reverts back to currentActiveKey.
  const activeTabId = isMenuOpen ? 'more' : currentActiveKey;

  // Point 3: Close when clicking outside without any dark backdrop
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const mainTabs = [
    {
      id: '/',
      href: '/',
      label: t('dashboard'),
      icon: LuLayoutGrid,
      badge: '3',
    },
    {
      id: '/projects',
      href: '/projects',
      label: t('projects'),
      icon: LuFolder,
      badge: null,
    },
    {
      id: '/tasks',
      href: '/tasks',
      label: t('tasks'),
      icon: LuClipboardCheck,
      badge: null,
    },
  ];

  const extraPages = [
    {
      href: '/team',
      label: t('team'),
      icon: LuUsers,
      color: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80',
      isActive: pathname.startsWith('/team'),
    },
    {
      href: '/roadmap',
      label: t('roadmap'),
      icon: LuCalendar,
      color: 'bg-rose-50/90 text-rose-700 border-rose-200/80',
      isActive: pathname.startsWith('/roadmap'),
    },
    {
      href: '/analytics',
      label: t('analytics'),
      icon: LuChartColumn,
      color: 'bg-purple-50/90 text-purple-700 border-purple-200/80',
      isActive: pathname.startsWith('/analytics'),
    },
    {
      href: '/settings',
      label: t('settings'),
      icon: LuSettings,
      color: 'bg-amber-50/90 text-amber-700 border-amber-200/80',
      isActive: pathname.startsWith('/settings'),
    },
    {
      href: '/help',
      label: t('help'),
      icon: LuCircleHelp,
      color: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80',
      isActive: pathname.startsWith('/help'),
    },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Floating Bottom Island */}
      <nav
        ref={navContainerRef}
        aria-label="Mobile Navigation"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-2.5 w-[94%] max-w-lg select-none"
      >
        {/* Main Joined Card Container (Navbar + Extension as one piece) */}
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.8,
          }}
          className={`relative flex-1 flex flex-col bg-white/95 text-primary-dark backdrop-blur-2xl border border-primary-medium/15 shadow-2xl overflow-hidden ${
            isMenuOpen ? 'rounded-3xl p-4' : 'rounded-full px-2 py-1.5'
          }`}
        >
          {/* Extension: Expands upward directly from the navbar, joined together without dividing line */}
          <AnimatePresence initial={false}>
            {isMenuOpen && (
              <motion.div
                key="menu-extension"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 30,
                  mass: 0.8,
                }}
                className="overflow-hidden"
              >
                {/* 3-column grid for the remaining pages */}
                <div className="grid grid-cols-3 gap-y-3.5 gap-x-2 pt-1.5 pb-4">
                  {extraPages.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all hover:bg-primary-surface/70 active:scale-95 group focus:outline-none"
                      >
                        <div
                          className={`w-13 h-13 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${
                            item.color
                          } ${
                            item.isActive
                              ? 'ring-2 ring-primary-dark/50 shadow-xs'
                              : ''
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-primary-dark text-center mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Dock Row (Always present, joined seamlessly below the extension) */}
          <div className="flex items-center justify-between w-full px-1 py-0.5">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = activeTabId === tab.id;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsMenuOpen(false)}
                  title={tab.label}
                  aria-label={tab.label}
                  className={`relative flex items-center justify-center rounded-full transition-all focus:outline-none ${
                    isTabActive
                      ? 'px-3.5 py-2 gap-2 text-primary-dark'
                      : 'p-2.5 text-primary-medium/75 hover:text-primary-dark'
                  }`}
                >
                  {/* Animated active pill indicator wrapping icon and label */}
                  {isTabActive && (
                    <motion.div
                      layoutId="mobileNavActivePill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 28,
                      }}
                      className="absolute inset-0 bg-primary/10 rounded-full border border-primary-medium/20 shadow-xs pointer-events-none"
                    />
                  )}

                  {/* Icon with notification badge */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={`relative z-10 w-5 h-5 transition-colors ${
                        isTabActive
                          ? 'text-primary-dark stroke-[2.2]'
                          : 'text-primary-medium/75 hover:text-primary-dark'
                      }`}
                    />
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2 z-20 min-w-4 h-4 px-1 rounded-full bg-[#e11d48] text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-1 ring-white">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  {/* Active Page Name shown at the side of the icon */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isTabActive && (
                      <motion.span
                        key={`label-${tab.id}`}
                        initial={{ opacity: 0, width: 0, x: -6 }}
                        animate={{ opacity: 1, width: 'auto', x: 0 }}
                        exit={{ opacity: 0, width: 0, x: -6 }}
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 30,
                        }}
                        className="relative z-10 text-xs sm:text-sm font-semibold text-primary-dark whitespace-nowrap overflow-hidden"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}

            {/* 4th More Menu Trigger Button (Icon only, no side label) */}
            {(() => {
              const isMoreActive = activeTabId === 'more';
              return (
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="More navigation pages"
                  className="relative z-20 p-2.5 rounded-full transition-colors flex items-center justify-center text-primary-dark focus:outline-none cursor-pointer"
                >
                  {/* Active indicator stays only on More when menu is open */}
                  {isMoreActive && (
                    <motion.div
                      layoutId="mobileNavActivePill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 28,
                      }}
                      className="absolute inset-0 bg-primary/10 rounded-full border border-primary-medium/20 shadow-xs pointer-events-none"
                    />
                  )}

                  <TbGridDots
                    className={`relative z-10 w-5 h-5 transition-transform duration-200 pointer-events-none ${
                      isMenuOpen
                        ? 'text-primary-dark rotate-90 scale-110'
                        : isMoreActive
                        ? 'text-primary-dark stroke-[2.2]'
                        : 'text-primary-medium/75 hover:text-primary-dark'
                    }`}
                  />
                </button>
              );
            })()}
          </div>
        </motion.div>

        {/* Separate Floating Circular Globe Action Button (using Link for 100% reliable touch navigation) */}
        <Link
          href={pathname}
          locale={locale === 'en' ? 'fr' : 'en'}
          aria-label="Toggle language"
          title={`Switch to ${locale === 'en' ? 'French' : 'English'}`}
          className="relative z-20 w-12 h-12 shrink-0 rounded-full bg-white/95 text-primary-dark backdrop-blur-2xl border border-primary-medium/15 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <LuGlobe className="w-5 h-5 text-primary-dark" />
          <span className="absolute -top-1 -right-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-primary/10 text-primary-dark border border-primary-medium/25 backdrop-blur-xs">
            {locale}
          </span>
        </Link>
      </nav>
    </div>
  );
}
