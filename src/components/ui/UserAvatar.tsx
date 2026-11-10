'use client';

import React, { useState, useEffect, useMemo } from 'react';

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

export function getAvatarInitials(name?: string): string {
  if (!name || !name.trim()) return '?';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getAvatarColor(name?: string): string {
  if (!name) return 'bg-neutral-100 text-primary-dark';
  const colorStyles = [
    'bg-[#f3e8ff] text-[#7e22ce]', // purple
    'bg-[#e0e7ff] text-[#4338ca]', // indigo
    'bg-[#dbeafe] text-[#1d4ed8]', // blue
    'bg-[#ccfbf1] text-[#0f766e]', // teal
    'bg-[#dcfce7] text-[#15803d]', // emerald
    'bg-[#fef3c7] text-[#b45309]', // amber
    'bg-[#ffedd5] text-[#c2410c]', // orange
    'bg-[#ffe4e6] text-[#be123c]', // rose
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorStyles[Math.abs(hash) % colorStyles.length];
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[8.5px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-[11px]',
  lg: 'w-9 h-9 text-xs',
  xl: 'w-12 h-12 text-sm',
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  className = '',
  title,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = useMemo(() => getAvatarInitials(name), [name]);
  const colorClass = useMemo(() => getAvatarColor(name), [name]);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const hasValidImage = Boolean(src && !imageError && src.trim() !== '');

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold select-none ${sizeClass} ${
        !hasValidImage ? colorClass : 'bg-neutral-100'
      } ${className}`}
      title={title || name}
    >
      {hasValidImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="leading-none tracking-tight">{initials}</span>
      )}
    </div>
  );
}
