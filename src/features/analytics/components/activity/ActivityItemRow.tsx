'use client';

import {
  LuUser,
  LuLock,
  LuCalendar,
  LuFileSpreadsheet,
  LuMessageSquare,
  LuCircleCheck,
} from 'react-icons/lu';
import { DetailedActivityItem } from '../../types/analytics.types';
import { MentionActivityCard } from './MentionActivityCard';
import { AccessRequestActivityCard } from './AccessRequestActivityCard';
import { EventStackActivityCard } from './EventStackActivityCard';
import { UploadActivityCard } from './UploadActivityCard';
import { CommentActivityCard } from './CommentActivityCard';
import { StandardActivityCard } from './StandardActivityCard';

interface ActivityItemRowProps {
  activity: DetailedActivityItem;
  isLast: boolean;
  onApproveAccess: (id: string, channelName: string) => void;
  onDenyAccess: (id: string, channelName: string) => void;
}

export function ActivityItemRow({
  activity,
  isLast,
  onApproveAccess,
  onDenyAccess,
}: ActivityItemRowProps) {
  // Determine timeline node icon and background matching the uploaded UI
  const getNodeConfig = () => {
    switch (activity.type) {
      case 'mention':
        return {
          icon: LuUser,
          bg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
        };
      case 'access_request':
        return {
          icon: LuLock,
          bg: 'bg-violet-50 text-violet-600 border border-violet-200/60',
        };
      case 'calendar_event':
        return {
          icon: LuCalendar,
          bg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
        };
      case 'file_upload':
        return {
          icon: LuFileSpreadsheet,
          bg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
        };
      case 'project_comment':
        return {
          icon: LuMessageSquare,
          bg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
        };
      case 'task_status_change':
      default:
        return {
          icon: LuCircleCheck,
          bg: 'bg-teal-50 text-teal-600 border border-teal-200/60',
        };
    }
  };

  const { icon: NodeIcon, bg: nodeBg } = getNodeConfig();

  return (
    <div className="relative flex items-start gap-4 sm:gap-5 group font-elms">
      {/* Continuous Timeline Vertical Line */}
      {!isLast && (
        <div className="absolute left-3.5 top-7 bottom-0 w-[1.5px] bg-neutral-200/80" />
      )}

      {/* Timeline Node Badge Icon */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-[1] transition-transform group-hover:scale-105 ${nodeBg}`}
      >
        <NodeIcon className="w-3.5 h-3.5" />
      </div>

      {/* Item Body */}
      <div className="flex-1 pb-7 sm:pb-8 min-w-0">
        {activity.type === 'mention' && (
          <MentionActivityCard activity={activity} />
        )}
        {activity.type === 'access_request' && (
          <AccessRequestActivityCard
            activity={activity}
            onApprove={onApproveAccess}
            onDeny={onDenyAccess}
          />
        )}
        {activity.type === 'calendar_event' && (
          <EventStackActivityCard activity={activity} />
        )}
        {activity.type === 'file_upload' && (
          <UploadActivityCard activity={activity} />
        )}
        {activity.type === 'project_comment' && (
          <CommentActivityCard activity={activity} />
        )}
        {activity.type === 'task_status_change' && (
          <StandardActivityCard activity={activity} />
        )}
      </div>
    </div>
  );
}
