import React from 'react';
import { BrandLogo } from './BrandLogo';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  showLogoImage?: boolean;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  showLogoImage = true,
}) => {
  const sizeConfig = {
    sm: {
      text: 'text-lg md:text-xl',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[10px]',
    },
    md: {
      text: 'text-xl md:text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-xs',
    },
    lg: {
      text: 'text-2xl md:text-3xl',
      badge: 'text-xs px-2.5 py-0.5',
      sub: 'text-sm',
    },
    xl: {
      text: 'text-3xl md:text-4xl',
      badge: 'text-xs px-3 py-1',
      sub: 'text-sm md:text-base',
    },
  };

  const curr = sizeConfig[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        {/* Prominent Logo Image / Shield Emblem */}
        {showLogoImage && (
          <BrandLogo size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : size === 'sm' ? 'xs' : 'sm'} />
        )}

        {/* Wordmark: "वीर" (Devanagari) + "Well" (English) */}
        <div className="flex items-baseline tracking-tight font-extrabold select-none">
          <span
            className={`${curr.text} font-devanagari font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent pr-0.5`}
            style={{ textShadow: '0 0 24px rgba(251, 191, 36, 0.45)' }}
          >
            वीर
          </span>
          <span
            className={`${curr.text} font-sans font-black bg-gradient-to-r from-white via-slate-100 to-olive-100 bg-clip-text text-transparent tracking-tight`}
            style={{ textShadow: '0 0 24px rgba(255, 255, 255, 0.35)' }}
          >
            Well
          </span>
          <span className={`ml-2 font-mono font-bold rounded-md uppercase tracking-wider bg-olive-500/25 text-olive-100 border border-olive-400/40 ${curr.badge}`}>
            CAPF & Forces
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className={`text-olive-200/90 font-medium tracking-wide mt-1.5 ${curr.sub}`}>
          AI-Based Predictive Personnel Stress & Welfare Monitoring System (Rakshak AI)
        </span>
      )}
    </div>
  );
};

