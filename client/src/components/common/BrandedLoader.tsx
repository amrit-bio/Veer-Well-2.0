import React from 'react';
import { BrandLogo } from './BrandLogo';

interface BrandedLoaderProps {
  label?: string;
  fullscreen?: boolean;
  compact?: boolean;
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  label = 'Securing VeerWell command grid…',
  fullscreen = false,
  compact = false,
}) => {
  const inner = (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-2 py-4' : 'gap-4 py-10'}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-accent-gold/20 blur-xl animate-pulse" />
        <BrandLogo size={compact ? 'md' : 'xl'} pulse />
      </div>
      <div>
        <div className="text-sm font-black text-white tracking-wide">
          <span className="font-devanagari text-accent-gold">वीर</span>Well
        </div>
        <p className="text-[11px] text-olive-300 font-mono mt-1 max-w-xs">{label}</p>
      </div>
      <div className="w-40 h-1 rounded-full bg-olive-900 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-accent-gold to-emerald-400 animate-pulse rounded-full" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111a0e]/95 backdrop-blur-md">
        {inner}
      </div>
    );
  }

  return inner;
};
