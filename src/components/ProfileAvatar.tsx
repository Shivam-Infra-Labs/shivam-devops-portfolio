'use client';

import React, { useState } from 'react';

interface ProfileAvatarProps {
  src: string;
  alt: string;
  monogram: string;
  size?: 'md' | 'lg';
}

export function ProfileAvatar({
  src,
  alt,
  monogram,
  size = 'lg',
}: ProfileAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses =
    size === 'lg'
      ? 'h-20 w-20 sm:h-24 sm:w-24 text-2xl'
      : 'h-16 w-16 text-lg';

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center rounded-full p-[2px] bg-gradient-to-br from-cyan-400/70 via-slate-700 to-emerald-400/70 shadow-[0_0_28px_-6px_rgba(34,211,238,0.4)]">
      <div
        className={`${sizeClasses} relative flex items-center justify-center overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-950/90`}
      >
        {!hasError && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-label={alt}
            className="select-none font-mono font-semibold tracking-tight text-cyan-200"
          >
            {monogram}
          </span>
        )}
      </div>
    </div>
  );
}
