'use client';

import Image from 'next/image';
import { DetailedActivityItem } from '../../types/analytics.types';

interface StandardActivityCardProps {
  activity: DetailedActivityItem;
}

export function StandardActivityCard({ activity }: StandardActivityCardProps) {
  const std = activity.standardActivity;
  if (!std) return null;

  return (
    <div className="space-y-1 font-elms">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-medium/80 flex-wrap">
        <Image
          src={activity.actor.avatar}
          alt={activity.actor.name}
          width={24}
          height={24}
          unoptimized
          className="w-6 h-6 rounded-full object-cover ring-1 ring-white"
        />
        <span className="font-bold text-primary-dark">{activity.actor.name}</span>
        <span className="text-primary-medium/80">{std.title}</span>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>
      {std.description && (
        <p className="text-xs text-primary-medium/70 pl-8 leading-relaxed">
          {std.description}
        </p>
      )}
    </div>
  );
}
