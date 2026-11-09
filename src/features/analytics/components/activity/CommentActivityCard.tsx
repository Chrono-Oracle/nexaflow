'use client';

import Image from 'next/image';
import { LuFolder, LuExternalLink, LuSquareCheck } from 'react-icons/lu';
import { DetailedActivityItem } from '../../types/analytics.types';

interface CommentActivityCardProps {
  activity: DetailedActivityItem;
}

export function CommentActivityCard({ activity }: CommentActivityCardProps) {
  const pc = activity.projectComment;
  if (!pc) return null;

  return (
    <div className="space-y-3 font-elms">
      {/* Action Header Line */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-medium/80 flex-wrap">
        <span className="font-bold text-primary-dark">
          {pc.commentCount} new {pc.commentCount === 1 ? 'comment' : 'comments'} on project
        </span>
        <a
          href="#project"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 font-bold text-primary-dark hover:underline"
        >
          <LuFolder className="w-3.5 h-3.5 text-amber-600" />
          <span>{pc.projectName}</span>
          <LuExternalLink className="w-3 h-3 text-primary-medium/60" />
        </a>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 pl-1">
        {pc.comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5">
            <Image
              src={comment.avatar}
              alt={comment.author}
              width={26}
              height={26}
              unoptimized
              className="w-6.5 h-6.5 rounded-full object-cover shrink-0 ring-1 ring-white mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-dark">
                  {comment.author}
                </span>
                <span className="text-[10px] text-primary-medium/50">
                  {comment.timestamp}
                </span>
              </div>
              <p className="text-xs text-primary-dark/90 leading-relaxed mt-0.5">
                {comment.content}
                {comment.linkedTaskTitle && (
                  <span className="inline-flex items-center gap-1 font-semibold text-primary-dark underline ml-1 cursor-pointer hover:text-primary">
                    <LuSquareCheck className="w-3 h-3" />
                    <span>{comment.linkedTaskTitle}</span>
                    <LuExternalLink className="w-2.5 h-2.5 text-primary-medium/60" />
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
