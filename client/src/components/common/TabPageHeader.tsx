import React from 'react';
import { BrandLogo } from './BrandLogo';

interface TabPageHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const TabPageHeader: React.FC<TabPageHeaderProps> = ({ badge, title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 md:p-6 rounded-3xl border border-olive-400/30 glow-olive">
      <div className="flex items-start gap-3.5 min-w-0">
        <BrandLogo size="md" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              {badge}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-xs md:text-sm text-olive-200 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
