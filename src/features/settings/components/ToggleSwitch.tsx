'use client';

import React from 'react';

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const isSmall = size === 'sm';
  const trackWidth = isSmall ? 'w-9 h-5' : 'w-11 h-6';
  const thumbSize = isSmall ? 'w-4 h-4' : 'w-5 h-5';
  const thumbTranslate = isSmall ? 'translate-x-4' : 'translate-x-5.5';

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
      }`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 ${trackWidth} rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          checked
            ? 'bg-[#3b5bf5]'
            : 'bg-neutral-300 hover:bg-neutral-400'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${thumbSize} rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out my-auto ${
            checked ? thumbTranslate : 'translate-x-0.5'
          }`}
        />
      </button>

      {label && (
        <span className="text-xs sm:text-sm font-semibold text-primary-dark group-hover:text-primary transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}
