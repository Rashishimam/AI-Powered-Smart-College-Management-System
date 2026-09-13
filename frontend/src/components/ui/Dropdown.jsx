import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  items = [], // [{ label, icon: Icon, onClick, danger, divider }]
  align = 'right', // 'left', 'right'
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 focus:outline-none animate-scale-up
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          `}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-slate-100" />;
            }

            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={(e) => {
                  setIsOpen(false);
                  if (item.onClick) item.onClick(e);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors
                  ${item.danger 
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
