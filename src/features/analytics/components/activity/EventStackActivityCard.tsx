'use client';

import Image from 'next/image';
import { DetailedActivityItem } from '../../types/analytics.types';

interface EventStackActivityCardProps {
  activity: DetailedActivityItem;
}

export function EventStackActivityCard({ activity }: EventStackActivityCardProps) {
  const ev = activity.calendarEvent;
  if (!ev) return null;

  return (
    <div className="space-y-3 font-elms">
      {/* Action Header Line */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-medium/80 flex-wrap">
        <span className="font-bold text-primary-dark">
          You have {ev.eventCount} events today
        </span>
        <span>•</span>
        <span className="text-primary-medium/60 text-xs">{activity.timestamp}</span>
      </div>

      {/* Layered Card Deck Effect matching uploaded screenshot */}
      <div className="relative max-w-md pt-1 pb-2">
        {/* Underneath layer 2 */}
        <div className="absolute inset-x-3 -bottom-1.5 h-6 bg-white/60 border border-neutral-200/60 rounded-xl shadow-2xs z-0" />
        {/* Underneath layer 1 */}
        <div className="absolute inset-x-1.5 -bottom-0.5 h-6 bg-white/80 border border-neutral-200/80 rounded-xl shadow-2xs z-10" />

        {/* Top Active Event Card */}
        <div className="relative z-20 bg-white border border-neutral-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Calendar Date Badge */}
            <div className="w-11 h-11 rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col items-center justify-center shrink-0">
              <span className="w-full text-center text-[9px] font-extrabold uppercase bg-red-500 text-white leading-none py-0.5">
                {ev.month}
              </span>
              <span className="text-sm font-extrabold text-primary-dark leading-none py-0.5">
                {ev.day}
              </span>
            </div>

            {/* Event Name & Time */}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-primary-dark truncate">
                {ev.title}
              </h4>
              <p className="text-[11px] font-medium text-primary-medium/70 mt-0.5">
                {ev.timeRange}
              </p>
            </div>
          </div>

          {/* Attendees Avatar Stack */}
          <div className="flex items-center -space-x-2 shrink-0">
            {ev.attendees.map((att, idx) => (
              <Image
                key={idx}
                src={att.avatar}
                alt={att.name}
                width={26}
                height={26}
                unoptimized
                className="w-6.5 h-6.5 rounded-full object-cover ring-2 ring-white"
                title={att.name}
              />
            ))}
            {ev.additionalAttendeeCount > 0 && (
              <span className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-neutral-100 text-primary-dark text-[10px] font-bold ring-2 ring-white">
                +{ev.additionalAttendeeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
