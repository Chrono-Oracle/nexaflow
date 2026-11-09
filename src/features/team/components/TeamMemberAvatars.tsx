'use client';

import Image from 'next/image';
import { TeamMember } from '../types/team.types';

interface TeamMemberAvatarsProps {
  members: TeamMember[];
  maxDisplay?: number;
}

export function TeamMemberAvatars({
  members = [],
  maxDisplay = 5,
}: TeamMemberAvatarsProps) {
  if (members.length === 0) {
    return (
      <span className="text-xs text-primary-medium/50 italic">
        0 members
      </span>
    );
  }

  const displayedMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {displayedMembers.map((member) => (
        <div
          key={member.id}
          className="relative inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white overflow-hidden bg-neutral-100 shrink-0"
          title={member.name}
        >
          <Image
            src={member.avatar || '/Avatar.jpg'}
            alt={member.name}
            width={32}
            height={32}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 text-primary-dark text-[11px] font-bold ring-2 ring-white">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
