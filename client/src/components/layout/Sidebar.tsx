import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Home,
  LayoutDashboard,
  ClipboardCheck,
  LineChart,
  HeartPulse,
  ShieldCheck,
  Database,
  Award,
  Info,
  Bell,
  Cpu,
  MessageSquare,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  category: 'Core Modules' | 'Analytics & Welfare' | 'Platform & Demo';
  icon: React.ElementType;
  badge?: string;
  description: string;
  roles?: ('commander' | 'welfare_officer' | 'personnel' | 'analyst')[];
}

export const TABS: TabItem[] = [
  // 1. Core Modules
  {
    id: 'home',
    label: 'Home / Overview',
    category: 'Core Modules',
    icon: Home,
    description: 'Mission introduction & highlights',
  },
  {
    id: 'dashboard',
    label: 'Personnel Dashboard',
    category: 'Core Modules',
    icon: LayoutDashboard,
    badge: 'Live',
    description: 'Unit stress, burnout & alerts',
  },
  {
    id: 'assessment',
    label: 'Self-Assessment',
    category: 'Core Modules',
    icon: ClipboardCheck,
    badge: 'Confidential',
    description: 'Voluntary check-in & wearables',
  },

  // 2. Analytics & Welfare
  {
    id: 'analytics',
    label: 'Predictive Analytics',
    category: 'Analytics & Welfare',
    icon: LineChart,
    badge: '14-Day AI',
    description: 'Behavioral models & privacy demo',
  },
  {
    id: 'interventions',
    label: 'Welfare Interventions',
    category: 'Analytics & Welfare',
    icon: HeartPulse,
    badge: 'Rest Roster',
    description: 'Counseling & rest rotations',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    category: 'Analytics & Welfare',
    icon: ShieldCheck,
    badge: 'Zero-Trust',
    description: 'Anonymization & welfare doctrine',
  },

  // 3. Platform & Demo
  {
    id: 'datasets',
    label: 'Datasets & Simulation',
    category: 'Platform & Demo',
    icon: Database,
    badge: 'CSV / PDF',
    description: 'Simulated records & data ingestion',
  },
  {
    id: 'impact',
    label: 'Impact & Benefits',
    category: 'Platform & Demo',
    icon: Award,
    description: 'Readiness & strategic metrics',
  },
  {
    id: 'about',
    label: 'Hackathon / About',
    category: 'Platform & Demo',
    icon: Info,
    description: 'Team, Vercel & roadmap',
  },
  {
    id: 'integrations',
    label: 'Device Integrations',
    category: 'Platform & Demo',
    icon: Cpu,
    description: 'HRMS & tactical smartwatch sync',
  },
  {
    id: 'supabase-data',
    label: 'Supabase Live Data',
    category: 'Platform & Demo',
    icon: Database,
    badge: 'Postgres RLS',
    description: 'Query all 12 live backend tables',
  },
  {
    id: 'feedback',
    label: 'Hackathon Feedback',
    category: 'Platform & Demo',
    icon: MessageSquare,
    badge: 'Evaluate',
    description: 'Jury & evaluator review form',
  },
];


interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { role, user } = useAuth();

  const categories = ['Core Modules', 'Analytics & Welfare', 'Platform & Demo'] as const;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-olive-400/20 bg-olive-950/90 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      {/* Unit Badge Header */}
      <div className="p-3 mb-3 rounded-xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-400/30">
        <div className="flex items-center gap-2 mb-2">
          <BrandLogo size="sm" />
          <span className="text-[10px] font-black text-white tracking-wide">
            <span className="font-devanagari text-accent-gold">वीर</span>Well
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase text-accent-gold tracking-wider">
            {user.force} • {user.rank.split(' ')[0]}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-100 truncate">{user.name}</div>
        <div className="text-[10px] text-olive-300 truncate font-mono">{user.unit}</div>
      </div>

      {/* Tabs Navigation List */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const catTabs = TABS.filter((t) => t.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[9px] font-mono font-bold tracking-widest text-olive-400/80 uppercase">
                {cat}
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
        <div className="flex items-center gap-2 p-2 rounded-xl bg-olive-900/50 border border-olive-700/40 text-[10px] text-olive-300 font-mono">
          <Shield className="w-3.5 h-3.5 text-accent-gold shrink-0" />
          <span className="truncate">100% Welfare Doctrine Active</span>
        </div>
      </div>
    </aside>
  );
};
