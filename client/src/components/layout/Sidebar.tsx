import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  BrainCircuit,
  Compass,
  CalendarHeart,
  MessageSquareHeart,
  Kanban,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Home,
  TrendingUp,
  Target,
  Lock,
  Database,
  BarChart3,
  Users,
  Bell,
  Plug,
  MessageCircle,
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roles: string[]; // which roles can access
  description: string;
}

export const TABS: TabItem[] = [
  {
    id: 'home',
    label: 'Home / Overview',
    icon: Home,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst', 'commander'],
    description: 'Project intro, AI features & quick start',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Personnel wellness monitoring & alerts',
  },
  {
    id: 'assessments',
    label: 'Self-Assessment',
    icon: ClipboardCheck,
    badge: 'Interactive',
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Stress surveys & wearable connection',
  },
  {
    id: 'predictive',
    label: 'Predictive Analytics',
    icon: TrendingUp,
    badge: 'AI-Powered',
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'data_analyst'],
    description: 'Risk models & trend analysis demo',
  },
  {
    id: 'stress',
    label: 'Intervention Recommendations',
    icon: Target,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead'],
    description: 'Counseling & workload suggestions',
  },
  {
    id: 'deployment',
    label: 'Deployment Records',
    icon: Compass,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Deployment history & timeline',
  },
  {
    id: 'leave',
    label: 'Leave History',
    icon: CalendarHeart,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Calendar view & entitlements',
  },
  {
    id: 'surveys',
    label: 'Wellness Surveys',
    icon: MessageSquareHeart,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'data_analyst'],
    description: 'Survey responses & sentiment analysis',
  },
  {
    id: 'workload',
    label: 'Workload Data',
    icon: Kanban,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Duty schedules & workload analysis',
  },
  {
    id: 'wearables',
    label: 'Wearables Data',
    icon: HeartPulse,
    badge: 'Bio-Metrics',
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Heart rate, SpO₂ & biometric data',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Lock,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Data anonymization & access controls',
  },
  {
    id: 'datasets',
    label: 'Datasets & Simulation',
    icon: Database,
    roles: ['hr_admin', 'wellness_mgr', 'data_analyst'],
    description: 'Sample datasets & visualization tools',
  },
  {
    id: 'impact',
    label: 'Impact & Benefits',
    icon: BarChart3,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Strategic benefits & expected outcomes',
  },
  {
    id: 'about',
    label: 'About / Hackathon',
    icon: Users,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Team, roadmap & project info',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead'],
    description: 'Welfare alerts & important updates',
  },
  {
    id: 'integration',
    label: 'Integration',
    icon: Plug,
    roles: ['hr_admin', 'wellness_mgr'],
    description: 'HRMS & wearable device connections',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageCircle,
    roles: ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'],
    description: 'Collect user feedback & suggestions',
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { role } = useAuth();

  // Filter tabs based on current role permissions
  const visibleTabs = TABS.filter((t) => t.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-olive-200 bg-white/50 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      {/* Section Header */}
      <div className="px-3 mb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
          Analytics & Intel Modules
        </span>
      </div>

      {/* Tabs Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-olive-500/15 via-olive-400/10 to-transparent text-olive-700 font-semibold border-l-4 border-olive-700 shadow-sm shadow-olive-500/10'
                  : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-olive-100 text-olive-700'
                      : 'bg-slate-100 text-slate-600 group-hover:text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium truncate">{tab.label}</div>
                  <div className="text-[10px] text-slate-600 truncate font-normal">
                    {tab.description}
                  </div>
                </div>
              </div>

              {tab.badge && (
                <span
                  className={`ml-2 text-[9px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    isActive
                      ? 'bg-olive-100 border-olive-400 text-olive-700'
                      : 'bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status Card */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="bg-olive-50 rounded-2xl p-3.5 border border-olive-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-olive-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bio-Signal Node</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-olive-700 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-600">
            Real-time biometric data sync active across 21 deployed nodes.
          </p>
        </div>
      </div>
    </aside>
  );
};
