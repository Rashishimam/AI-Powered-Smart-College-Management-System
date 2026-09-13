import React, { useState } from 'react';

export default function Avatar({
  src,
  name = '',
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  status, // 'online', 'offline', 'busy'
  className = ''
}) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const statusDotSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5'
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-rose-500 ring-white',
    offline: 'bg-slate-400 ring-white'
  };

  // Generate initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover border border-slate-200 shadow-2xs`}
        />
      ) : (
        <div
          className={`
            ${sizeMap[size] || sizeMap.md}
            rounded-full flex items-center justify-center font-bold
            bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs select-none
          `}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full ring-2
            ${statusDotSize[size] || statusDotSize.md}
            ${statusColors[status] || statusColors.online}
          `}
        />
      )}
    </div>
  );
}
