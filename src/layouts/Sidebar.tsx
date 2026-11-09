'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { SidebarItem } from './components/SidebarItem';
import {
  LuLayoutGrid,
  LuFolder,
  LuClipboardCheck,
  LuUsers,
  LuCalendar,
  LuChartColumn,
  LuSettings,
  LuCircleHelp,
} from 'react-icons/lu';

export function Sidebar() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const { isExpanded, expandSidebar, collapseSidebar } = useSidebar();
  const { appearance } = useTheme();
  const autoShrinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (autoShrinkTimerRef.current) {
        clearTimeout(autoShrinkTimerRef.current);
      }
    };
  }, []);

  // Expand immediately on hover
  const handleMouseEnter = () => {
    if (autoShrinkTimerRef.current) {
      clearTimeout(autoShrinkTimerRef.current);
      autoShrinkTimerRef.current = null;
    }
    expandSidebar();
  };

  // Shrink automatically after 3 seconds when mouse leaves
  const handleMouseLeave = () => {
    if (autoShrinkTimerRef.current) {
      clearTimeout(autoShrinkTimerRef.current);
    }
    autoShrinkTimerRef.current = setTimeout(() => {
      collapseSidebar();
    }, 3000);
  };

  const mainNavItems = [
    {
      href: '/',
      icon: LuLayoutGrid,
      label: t('dashboard'),
      isActive: pathname === '/',
    },
    {
      href: '/projects',
      icon: LuFolder,
      label: t('projects'),
      isActive: pathname.startsWith('/projects'),
    },
    {
      href: '/tasks',
      icon: LuClipboardCheck,
      label: t('tasks'),
      isActive: pathname.startsWith('/tasks'),
    },
    {
      href: '/team',
      icon: LuUsers,
      label: t('team'),
      isActive: pathname.startsWith('/team'),
    },
    {
      href: '/roadmap',
      icon: LuCalendar,
      label: t('roadmap'),
      isActive: pathname.startsWith('/roadmap'),
    },
    {
      href: '/analytics',
      icon: LuChartColumn,
      label: t('analytics'),
      isActive: pathname.startsWith('/analytics'),
    },
  ];

  const bottomNavItems = [
    {
      href: '/settings',
      icon: LuSettings,
      label: t('settings'),
      isActive: pathname.startsWith('/settings'),
    },
    {
      href: '/help',
      icon: LuCircleHelp,
      label: t('help'),
      isActive: pathname.startsWith('/help'),
    },
  ];

  const isDarkTheme =
    appearance.theme === 'dark' ||
    (appearance.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        width: isExpanded ? 260 : 56,
        backgroundColor: isExpanded
          ? isDarkTheme
            ? appearance.transparentSidebar
              ? 'rgba(32, 26, 21, 0.72)'
              : 'rgba(32, 26, 21, 0.98)'
            : appearance.transparentSidebar
            ? 'rgba(255, 255, 255, 0.72)'
            : 'rgba(255, 255, 255, 0.98)'
          : 'rgba(255, 255, 255, 0)',
        boxShadow: isExpanded
          ? isDarkTheme
            ? '0 12px 30px -6px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.3)'
            : '0 12px 30px -6px rgba(38, 21, 11, 0.12), 0 4px 10px -2px rgba(38, 21, 11, 0.04)'
          : 'none',
        borderColor: isExpanded
          ? isDarkTheme
            ? 'rgba(219, 221, 216, 0.15)'
            : 'rgba(115, 88, 64, 0.15)'
          : 'rgba(115, 88, 64, 0)',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 26,
        mass: 0.8,
      }}
      className={`hidden md:flex h-full flex-col justify-between shrink-0 select-none rounded-md border px-2 pt-5 pb-4 overflow-hidden z-30 ${
        appearance.transparentSidebar ? 'backdrop-blur-md' : ''
      }`}
    >
      {/* Top Main Navigation Items */}
      <nav className="flex flex-col gap-2 w-full">
        {mainNavItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Bottom Settings & Help Items permanently pinned at bottom */}
      <div className={`flex flex-col gap-2 w-full ${isExpanded ? 'pt-2.5 border-t border-primary-medium/10' : ''}`}>
        {bottomNavItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            isExpanded={isExpanded}
          />
        ))}
      </div>
    </motion.aside>
  );
}
