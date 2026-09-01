import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  NAV_CONFIG,
  NAV_CATEGORIES,
  getVisibleTabsForRole,
  getVisibleCategoriesForRole,
  isTabAccessible,
  getDefaultTabForRole,
  TabItem,
} from '../../config/navConfig';
import {
  Shield,
  Award,
  HeartPulse,
  Cpu,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type { TabItem };
export { NAV_CONFIG as TABS };

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { role, user, openAuthModal } = useAuth();

  const visibleCategories = getVisibleCategoriesForRole(role);
  const visibleTabs = getVisibleTabsForRole(role);

  // Auto-redirect if the activeTab is not permitted for the newly switched role
  useEffect(() => {
    if (!isTabAccessible(activeTab, role)) {
      onTabChange(getDefaultTabForRole(role));
    }
  }, [role, activeTab, onTabChange]);

  const getRoleBadge = () => {
    switch (role) {
      case 'commander':
        return { label: 'Battalion Command (CO)', color: 'text-accent-gold', bg: 'bg-accent-gold/20 border-accent-gold/40' };
      case 'welfare_officer':
        return { label: 'Medical & Clinical Officer', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' };
      case 'personnel':
        return { label: 'Frontline Sentinel (Jawan)', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' };
      case 'analyst':
        return { label: 'Behavioral Data Scientist', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' };
      default:
        return { label: 'Forces Personnel', color: 'text-olive-300', bg: 'bg-olive-800 border-olive-700' };
    }
  };

  const badge = getRoleBadge();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-olive-400/20 bg-olive-950/90 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      {/* Unit Badge Header with Active Persona Badge */}
      <div className="p-3 mb-3 rounded-2xl bg-gradient-to-br from-olive-900 via-olive-950 to-olive-900 border border-olive-400/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-[10px] font-black text-white tracking-wide">
              <span className="font-devanagari text-accent-gold">वीर</span>Well
            </span>
          </div>
          <button
            onClick={openAuthModal}
            className="text-[9px] font-mono text-accent-gold hover:underline flex items-center gap-0.5"
          >
            <span>Switch ID</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${badge.bg} ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <div className="text-xs font-bold text-slate-100 truncate">{user.name}</div>
        <div className="text-[10px] text-olive-300 truncate font-mono mt-0.5">
          {user.serviceNumber} • {user.unit}
        </div>
      </div>

      {/* Dynamic Tabs Navigation List Filtered by Role */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {visibleCategories.map((cat) => {
          // Only show tabs belonging to this category AND permitted for active role
          const catTabs = visibleTabs.filter((t) => t.category === cat);

          // If a section has 0 visible tabs, hide section header entirely
          if (catTabs.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[9px] font-mono font-bold tracking-widest text-olive-400/80 uppercase flex items-center justify-between">
                <span>{cat}</span>
                <span className="text-[8px] text-olive-600 font-normal">{catTabs.length}</span>
              </div>

              {catTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-olive-700/80 via-olive-800/60 to-transparent text-white font-bold border-l-4 border-accent-gold shadow-md shadow-olive-950/40'
                        : 'text-olive-200/80 hover:text-white hover:bg-olive-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-accent-gold/20 text-accent-gold'
                            : 'bg-olive-900 text-olive-300 group-hover:text-white group-hover:bg-olive-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs truncate">{tab.label}</div>
                      </div>
                    </div>

                    {tab.badge && (
                      <span
                        className={`ml-1 text-[8px] font-mono px-1.5 py-0.5 rounded border whitespace-nowrap ${
                          isActive
                            ? 'bg-accent-gold/20 border-accent-gold/40 text-accent-gold font-bold'
                            : 'bg-olive-900/90 border-olive-700 text-olive-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Security Badge */}
      <div className="mt-auto pt-3 border-t border-olive-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-olive-900/50 border border-olive-700/40 text-[10px] text-olive-300 font-mono">
          <div className="flex items-center gap-1.5 min-w-0">
            <Shield className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            <span className="truncate">Zero-Trust RBAC Active</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold">100%</span>
        </div>
      </div>
    </aside>
  );
};
