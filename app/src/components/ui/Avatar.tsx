import * as React from 'react';
import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  innerRef?: any;
}

export const Avatar = (
  {
    size = 'md',
    fallback,
    status,
    alt = 'Avatar',
    className = '',
    src,
    innerRef,
  }: AvatarProps
) => {
  const sizeStyles: Record<string, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors: Record<string, string> = {
    online: 'bg-[#10b981]',
    offline: 'bg-[#94a3b8]',
    busy: 'bg-[#ef4444]',
    away: 'bg-[#f59e0b]',
  };

  const statusSizes: Record<string, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div ref={innerRef} className="relative inline-block">
      {src ? (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full overflow-hidden
            border-2 border-[#334155]
            ${className}
          `.trim()}
        >
          <Image
            src={src}
            alt={alt}
            width={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
            height={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full
            bg-gradient-to-br from-[#6366f1] to-[#a78bfa]
            flex items-center justify-center
            font-semibold text-white
            border-2 border-[#334155]
            ${className}
          `.trim()}
        >
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
      {status && (
        <div
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full border-2 border-[#1e293b]
          `.trim()}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';
