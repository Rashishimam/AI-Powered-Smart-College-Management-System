import React from 'react';

export default function Skeleton({
  variant = 'text', // 'text', 'circular', 'rectangular'
  width,
  height,
  className = ''
}) {
  const variantStyles = {
    text: 'rounded-md h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return (
    <div
      style={{ width, height }}
      className={`
        animate-pulse bg-slate-200
        ${variantStyles[variant] || variantStyles.text}
        ${className}
      `}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-slate-100 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="text" className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
