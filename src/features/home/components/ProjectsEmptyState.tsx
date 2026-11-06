'use client';

import { useSyncExternalStore } from 'react';
import { Lottie } from 'lottie-react';
import emptyBoxAnimation from '@/assets/animations/Empty Box.json';

interface ProjectsEmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}

const emptySubscribe = () => () => {};

export function ProjectsEmptyState({
  title,
  description,
  onAction,
  actionLabel,
}: ProjectsEmptyStateProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center font-elms select-none">
      {/* Lottie Animation Container (Enlarged prominent box) */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-56 md:h-56 flex items-center justify-center">
        {isMounted ? (
          <Lottie
            src={emptyBoxAnimation}
            autoplay
            loop
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Copy */}
      <h3 className="text-base sm:text-xl font-bold text-primary-dark tracking-tight mt-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-primary-medium/70 max-w-sm mt-1.5 px-4 leading-relaxed">
        {description}
      </p>

      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-dark text-white text-xs font-medium shadow-xs hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
