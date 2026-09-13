import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'default', // 'none', 'sm', 'default', 'lg'
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div
      className={`
        erp-card bg-white text-slate-900 overflow-hidden
        ${hover ? 'erp-card-hover' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2 ${className}`}>
      <div>
        {title && <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 ${className}`}>
      {children}
    </div>
  );
}
