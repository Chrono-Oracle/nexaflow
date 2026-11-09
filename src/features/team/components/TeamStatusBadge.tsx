'use client';

interface TeamStatusBadgeProps {
  isActive: boolean;
}

export function TeamStatusBadge({ isActive }: TeamStatusBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      On Standby
    </span>
  );
}
