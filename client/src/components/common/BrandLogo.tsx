import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  pulse?: boolean;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '', pulse = false }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative ${SIZE_MAP[size]} rounded-xl overflow-hidden shadow-lg shadow-olive-950/60 border border-accent-gold/45 shrink-0 bg-olive-950 flex items-center justify-center p-0.5 ring-2 ring-accent-gold/25 ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      {!imgError ? (
        <img
          src="/logo.jpg"
          alt="VeerWell"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-[10px]"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-olive-800 via-olive-900 to-olive-950 rounded-[10px] flex items-center justify-center">
          <span className="font-devanagari text-accent-gold font-black text-sm">वीर</span>
        </div>
      )}
    </div>
  );
};
