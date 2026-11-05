'use client';

import { ElementType } from 'react';
import { Link } from '@/i18n/routing';
import { LuChevronRight } from 'react-icons/lu';

interface StatCardProps {
  icon: ElementType;
  title: string;
  value: number | string;
  href: string;
  viewDetailsText: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  href,
  viewDetailsText,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-primary-medium/15 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between font-elms group">
      {/* Top Row: Dark Squircle Icon & View Details Link */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
          <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-medium/85 hover:text-primary-dark transition-colors"
        >
          <span>{viewDetailsText}</span>
          <LuChevronRight className="w-4 h-4 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Bottom Area: Large Metric Number & Label */}
      <div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-dark">
          {value}
        </div>
        <p className="text-xs sm:text-sm text-primary-medium/70 font-medium mt-1">
          {title}
        </p>
      </div>
    </div>
  );
}
