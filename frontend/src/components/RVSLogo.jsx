import React, { useState } from 'react';
import { BRANDING, RVS_CONFIG } from '../config/rvsConfig';

export default function RVSLogo({ 
  size = 'md', 
  showText = true, 
  subtitle = true, 
  className = '', 
  variant = 'auto', // 'light' (for dark background like sidebar/navy), 'dark' (for white background like navbar), 'auto'
  textClassName = '',
  imgContainerClassName = ''
}) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: { height: 28, title: 'text-xs', sub: 'text-[9px]' },
    sm: { height: 36, title: 'text-sm', sub: 'text-[10px]' },
    md: { height: 44, title: 'text-base', sub: 'text-xs' },
    lg: { height: 54, title: 'text-lg', sub: 'text-xs' },
    xl: { height: 70, title: 'text-2xl', sub: 'text-sm' }
  };

  const s = sizeMap[size] || sizeMap.md;

  const isDarkText = variant === 'dark';
  const titleColor = isDarkText ? 'text-slate-900' : 'text-white';
  const subColor = isDarkText ? 'text-slate-500' : 'text-slate-300';
  const badgeClass = isDarkText 
    ? 'bg-blue-50 text-blue-800 border-blue-200' 
    : 'bg-blue-950/80 text-sky-300 border-blue-800/60';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official RVS College of Engineering & Technology Logo */}
      <div 
        style={{ height: `${s.height}px` }}
        className={`relative shrink-0 flex items-center justify-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200/90 overflow-hidden ${imgContainerClassName}`}
      >
        {!imgError ? (
          <img
            src={BRANDING.logo || RVS_CONFIG.logo || '/assets/rvs-logo.png'}
            alt={BRANDING.collegeName || 'RVS College of Engineering & Technology'}
            style={{ objectFit: 'contain' }}
            className="h-full w-auto max-w-full object-contain block select-none"
            onError={() => setImgError(true)}
            loading="eager"
          />
        ) : (
          <div className="h-full px-2.5 flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 text-amber-400 font-black text-xs rounded-lg">
            RVSCET
          </div>
        )}
      </div>

      {showText && (
        <div className={`leading-tight text-left ${textClassName}`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-black tracking-tight ${titleColor} ${s.title}`}>
              RVS <span className="text-amber-500">CET</span>
            </span>
            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border ${badgeClass} hidden sm:inline-block`}>
              Jamshedpur
            </span>
          </div>
          {subtitle && (
            <p className={`font-medium ${subColor} ${s.sub} truncate max-w-[260px] sm:max-w-none tracking-tight`}>
              Smart Campus Management System
            </p>
          )}
        </div>
      )}
    </div>
  );
}

