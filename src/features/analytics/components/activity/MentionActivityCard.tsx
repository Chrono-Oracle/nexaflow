'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LuExternalLink, LuCornerDownRight, LuMessageSquare } from 'react-icons/lu';
import { DetailedActivityItem } from '../../types/analytics.types';

interface MentionActivityCardProps {
  activity: DetailedActivityItem;
}

export function MentionActivityCard({ activity }: MentionActivityCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const mention = activity.mention;
  if (!mention) return null;

  return (
    <div className="space-y-2.5 font-elms">
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
        <span>mentioned</span>
        <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {mention.targetUser}
        </span>
        <span>in channel</span>
        <a
          href="#channel"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 font-semibold text-primary-dark hover:underline"
        >
          <span>{mention.channel}</span>
          <LuExternalLink className="w-3 h-3 text-primary-medium/60" />
        </a>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>

      {/* Quoted Message Card matching uploaded UI with thick blue left border */}
      <div className="bg-neutral-50/80 border border-neutral-200/80 border-l-4 border-l-blue-600 rounded-r-xl p-3.5 sm:p-4 text-xs sm:text-sm text-primary-dark leading-relaxed shadow-2xs">
        <p>{mention.message}</p>
      </div>

      {/* Replies Row */}
      {mention.replyCount && (
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setShowReplies((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary-medium/70 hover:text-primary-dark cursor-pointer group"
          >
            <LuCornerDownRight className="w-3.5 h-3.5 text-primary-medium/50 group-hover:translate-x-0.5 transition-transform" />
            {mention.replyAvatars && mention.replyAvatars.length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {mention.replyAvatars.map((av, idx) => (
                  <Image
                    key={idx}
                    src={av}
                    alt="replier"
                    width={18}
                    height={18}
                    unoptimized
                    className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-white"
                  />
                ))}
              </div>
            )}
            <span>
              {mention.replyCount} {mention.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </button>
        </div>
      )}

      {/* Expanded Mock Replies Thread */}
      {showReplies && (
        <div className="pl-6 border-l-2 border-primary-medium/15 pt-2 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-primary-medium/10 text-xs">
            <span className="font-bold text-primary-dark">Joshua:</span>
            <span className="text-primary-medium/80">
              Listened to the note. Taking a look at the tab animation state right now.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
