'use client';

import {
  LuFileText,
  LuImage,
  LuVideo,
  LuArchive,
  LuFile,
} from 'react-icons/lu';
import { getFileCategory } from './fileUpload.types';

interface FileIconBadgeProps {
  name: string;
  type?: string;
  size?: 'sm' | 'md';
}

export function FileIconBadge({
  name,
  type,
  size = 'md',
}: FileIconBadgeProps) {
  const category = getFileCategory(name, type);
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE';

  const isSmall = size === 'sm';
  const containerSize = isSmall ? 'w-8 h-9 rounded-md' : 'w-10 h-11 rounded-lg';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-5 h-5';
  const badgeText = isSmall ? 'text-[7px] px-1' : 'text-[8px] px-1 py-0.2';

  switch (category) {
    case 'pdf':
      return (
        <div
          className={`relative ${containerSize} border border-red-200 bg-red-50/60 flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuFileText className={`${iconSize} text-red-500`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-red-600 text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            PDF
          </span>
        </div>
      );

    case 'doc':
      return (
        <div
          className={`relative ${containerSize} border border-blue-200 bg-blue-50/60 flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuFileText className={`${iconSize} text-blue-600`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-blue-600 text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            {ext.length <= 4 ? ext : 'DOC'}
          </span>
        </div>
      );

    case 'image':
      return (
        <div
          className={`relative ${containerSize} border border-emerald-200 bg-emerald-50/60 flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuImage className={`${iconSize} text-emerald-600`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-emerald-600 text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            {ext.length <= 4 ? ext : 'IMG'}
          </span>
        </div>
      );

    case 'video':
      return (
        <div
          className={`relative ${containerSize} border border-purple-200 bg-purple-50/60 flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuVideo className={`${iconSize} text-purple-600`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-purple-600 text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            {ext.length <= 4 ? ext : 'MP4'}
          </span>
        </div>
      );

    case 'archive':
      return (
        <div
          className={`relative ${containerSize} border border-amber-200 bg-amber-50/60 flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuArchive className={`${iconSize} text-amber-600`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-amber-600 text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            ZIP
          </span>
        </div>
      );

    default:
      return (
        <div
          className={`relative ${containerSize} border border-primary-medium/20 bg-primary-surface flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <LuFile className={`${iconSize} text-primary-dark/70`} />
          <span
            className={`absolute -bottom-1 -left-1 bg-primary-dark text-white font-extrabold rounded shadow-2xs tracking-tight ${badgeText}`}
          >
            {ext.slice(0, 4)}
          </span>
        </div>
      );
  }
}
