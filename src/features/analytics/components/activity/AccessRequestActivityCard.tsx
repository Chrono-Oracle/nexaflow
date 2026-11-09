'use client';

import Image from 'next/image';
import { LuLock, LuExternalLink, LuCheck, LuX } from 'react-icons/lu';
import { DetailedActivityItem } from '../../types/analytics.types';

interface AccessRequestActivityCardProps {
  activity: DetailedActivityItem;
  onApprove: (id: string, channelName: string) => void;
  onDeny: (id: string, channelName: string) => void;
}

export function AccessRequestActivityCard({
  activity,
  onApprove,
  onDeny,
}: AccessRequestActivityCardProps) {
  const req = activity.accessRequest;
  if (!req) return null;

  return (
    <div className="space-y-3 font-elms">
      {/* Action Header Line */}
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
        <span>asked to join channel</span>
        <a
          href="#channel"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 font-semibold text-primary-dark hover:underline"
        >
          {req.isPrivate && <LuLock className="w-3 h-3 text-primary-medium/70" />}
          <span>{req.channel}</span>
          <LuExternalLink className="w-3 h-3 text-primary-medium/60" />
        </a>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>

      {/* Interactive Action Buttons / Outcome Badge */}
      <div className="flex items-center gap-2 pt-0.5">
        {req.status === 'pending' ? (
          <>
            <button
              type="button"
              onClick={() => onDeny(activity.id, req.channel)}
              className="px-3.5 py-1.5 rounded-lg border border-primary-medium/20 text-xs font-semibold text-primary-dark hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Deny
            </button>
            <button
              type="button"
              onClick={() => onApprove(activity.id, req.channel)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              Approve
            </button>
          </>
        ) : req.status === 'approved' ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <LuCheck className="w-3.5 h-3.5" />
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
            <LuX className="w-3.5 h-3.5" />
            Denied
          </span>
        )}
      </div>
    </div>
  );
}
