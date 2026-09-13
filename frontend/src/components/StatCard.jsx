import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend,
  trendType = 'up', // 'up', 'down', 'neutral'
  className = ''
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-800',
      border: 'hover:border-blue-300',
      iconBg: 'bg-blue-600 text-white'
    },
    navy: {
      bg: 'bg-slate-100 text-slate-800',
      border: 'hover:border-slate-300',
      iconBg: 'bg-slate-900 text-white'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-800',
      border: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-600 text-white'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-900',
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-500 text-slate-950'
    },
    gold: {
      bg: 'bg-amber-50 text-amber-900',
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-500 text-slate-950'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-800',
      border: 'hover:border-rose-300',
      iconBg: 'bg-rose-600 text-white'
    },
    cyan: {
      bg: 'bg-sky-50 text-sky-800',
      border: 'hover:border-sky-300',
      iconBg: 'bg-sky-600 text-white'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-800',
      border: 'hover:border-indigo-300',
      iconBg: 'bg-indigo-600 text-white'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-800',
      border: 'hover:border-purple-300',
      iconBg: 'bg-purple-600 text-white'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`erp-card bg-white p-5 border border-slate-200 transition-all duration-200 ${scheme.border} erp-card-hover group ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg} shadow-xs transition-transform group-hover:scale-105 duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
          {value}
        </h3>
        {trend && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            trendType === 'down' 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
