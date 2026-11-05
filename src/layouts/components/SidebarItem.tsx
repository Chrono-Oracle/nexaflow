'use client';

import { ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';

interface SidebarItemProps {
  href: string;
  icon: ElementType;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center h-11 rounded-md select-none overflow-hidden transition-colors ${
        isExpanded ? 'w-full' : 'w-11'
      } ${
        isActive
          ? isExpanded
            ? 'bg-primary/10 text-primary-dark font-semibold'
            : 'bg-white shadow-xs border border-primary-medium/10 text-primary-dark rounded-md'
          : isExpanded
          ? 'hover:bg-primary-surface/60 text-primary-dark/80 hover:text-primary-dark'
          : 'hover:bg-white/70 text-primary-medium/80 hover:text-primary-dark hover:shadow-2xs rounded-md'
      }`}
    >
      {/* Icon: Strictly anchored in a 44px x 44px fixed slot — NEVER shifts during transitions */}
      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
        <Icon
          className={`w-5 h-5 shrink-0 transition-colors ${
            isActive
              ? 'text-primary-dark stroke-[2.2]'
              : 'text-primary-medium/80 group-hover:text-primary-dark'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Label: Only visible when expanded, instantaneous exit so it never pushes the icon */}
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 26,
            }}
            className={`text-sm whitespace-nowrap overflow-hidden pr-3 select-none ${
              isActive
                ? 'font-semibold text-primary-dark'
                : 'font-medium text-primary-dark/85'
            }`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Hover tooltip when collapsed */}
      {!isExpanded && (
        <div className="absolute left-full ml-3 px-2.5 py-1 bg-primary-dark text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
