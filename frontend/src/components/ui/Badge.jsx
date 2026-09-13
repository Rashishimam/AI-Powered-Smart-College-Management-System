import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'default', 'primary', 'success', 'warning', 'danger', 'info', 'gold', 'neutral'
  size = 'md', // 'sm', 'md'
  icon: Icon,
  className = ''
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    primary: 'bg-blue-50 text-blue-800 border border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    gold: 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.default}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
