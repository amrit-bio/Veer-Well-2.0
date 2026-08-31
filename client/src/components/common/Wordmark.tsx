import React from 'react';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const sizeConfig = {
    sm: {
      text: 'text-xl',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[10px]',
      icon: 'w-6 h-6',
    },
    md: {
      text: 'text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-xs',
      icon: 'w-8 h-8',
    },
    lg: {
      text: 'text-3xl md:text-4xl',
      badge: 'text-xs px-2.5 py-0.5',
      sub: 'text-sm',
      icon: 'w-10 h-10',
    },
    xl: {
      text: 'text-4xl md:text-5xl',
      badge: 'text-sm px-3 py-1',
      sub: 'text-base',
      icon: 'w-14 h-14',
    },
  };

  const curr = sizeConfig[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Animated Emblem / Shield with Bio-Pulse & Ashoka Chakra reference */}
        <div className={`relative ${curr.icon} flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20`}>
          <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/20 opacity-80" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-3/5 h-3/5 text-emerald-400 relative z-10"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Shield outline with vital pulse */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="stroke-emerald-400" />
              <path d="M7.5 12h2l1.5-3 2 6 1.5-3h2" className="stroke-amber-400" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Lockup: "वीर" (Hindi Devanagari) + "Well" (English) */}
        <div className="flex items-baseline tracking-tight font-extrabold select-none">
          <span
            className={`${curr.text} font-devanagari font-black bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent pr-0.5`}
            style={{ textShadow: '0 0 20px rgba(251, 146, 60, 0.25)' }}
          >
            वीर
          </span>
          <span
            className={`${curr.text} font-sans font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent tracking-tight`}
            style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.25)' }}
          >
            Well
          </span>
          <span className={`ml-2 font-mono font-semibold rounded-md uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${curr.badge}`}>
            2.0
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className={`text-slate-400 font-medium tracking-wide mt-1 ${curr.sub}`}>
          HR Employee Wellness & Anonymized Workforce Intelligence
        </span>
      )}
    </div>
  );
};
