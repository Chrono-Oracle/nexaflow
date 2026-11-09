'use client';

import Image from 'next/image';
import { LuLock, LuExternalLink, LuFileSpreadsheet, LuDownload } from 'react-icons/lu';
import { DetailedActivityItem } from '../../types/analytics.types';

interface UploadActivityCardProps {
  activity: DetailedActivityItem;
}

export function UploadActivityCard({ activity }: UploadActivityCardProps) {
  const upload = activity.fileUpload;
  if (!upload) return null;

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
        <span>uploaded</span>
        <span className="font-bold text-blue-600 hover:underline cursor-pointer">
          {upload.fileName}
        </span>
        <span>in channel</span>
        <a
          href="#channel"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 font-semibold text-primary-dark hover:underline"
        >
          {upload.isPrivate && <LuLock className="w-3 h-3 text-primary-medium/70" />}
          <span>{upload.channel}</span>
          <LuExternalLink className="w-3 h-3 text-primary-medium/60" />
        </a>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>

      {/* File Attachment Card */}
      <div className="max-w-xs flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/70 transition-colors cursor-pointer group">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <LuFileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary-dark truncate">
              {upload.fileName}
            </p>
            {upload.fileSize && (
              <p className="text-[10px] text-primary-medium/60">{upload.fileSize}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="p-1 text-primary-medium/50 group-hover:text-primary-dark rounded transition-colors"
          title="Download file"
        >
          <LuDownload className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
