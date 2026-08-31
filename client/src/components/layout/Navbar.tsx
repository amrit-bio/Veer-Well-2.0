import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wordmark } from '../common/Wordmark';
import { UserRole } from '../../types';
import {
  Bell,
  Eye,
  EyeOff,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, role, logout, switchRole, isAnonymized, toggleAnonymization } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'hr_admin', title: 'HR Administrator', desc: 'Org analytics & Ingestion' },
    { role: 'wellness_mgr', title: 'Wellness Program Manager', desc: 'Surveys & Interventions' },
    { role: 'team_lead', title: 'Team Lead / Manager', desc: 'Workload & Team Leave' },
    { role: 'employee', title: 'Employee', desc: 'My Biometrics & Assessments' },
    { role: 'data_analyst', title: 'Data Analyst', desc: 'Correlations & Heatmaps' },
  ];

  const notifications = [
    {
      id: 1,
      title: 'High Fatigue Alert',
      desc: 'Operations unit in Leh sector recorded average HRV dip of 24%.',
      time: '10m ago',
      urgent: true,
    },
    {
      id: 2,
      title: 'Assessment Milestone',
      desc: 'Q3 Psychological Safety survey reached 90% participation.',
      time: '1h ago',
      urgent: false,
    },
    {
      id: 3,
      title: 'Wellness Leave Approved',
      desc: 'Recovery rest day confirmed for frontline staff.',
      time: '3h ago',
      urgent: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-olive-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-olive-600 to-olive-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
            R
          </div>
          <Wordmark size="md" />
        </div>

        {/* Center: Live Status & Privacy Shield Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100 border border-olive-300 text-olive-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-olive-700 animate-pulse" />
            <span>Telemetry: Live Active</span>
          </div>

          {/* Anonymization Privacy Toggle */}
          <button
            onClick={toggleAnonymization}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              isAnonymized
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Privacy Mask (Anonymized EMP IDs vs Real Names)"
          >
            {isAnonymized ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Privacy Mask: <strong>ON (EMP-XXXX)</strong></span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Privacy Mask: <strong>OFF</strong></span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick Role Switcher Pill & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Dropdown for Testing */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-50 border border-olive-300 hover:border-olive-400 text-xs text-slate-900 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-olive-700" />
              <span className="hidden sm:inline text-slate-600 font-normal">Role:</span>
              <span className="font-semibold text-olive-700 capitalize">
                {role.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2 shadow-2xl z-50 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Test Persona (RBAC)
                </div>
                <div className="mt-1 space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex flex-col items-start px-3 py-2 rounded-xl text-left transition-colors ${
                        role === r.role
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <span className="text-xs">{r.title}</span>
                      <span className="text-[10px] text-slate-400">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center text-white">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-3 shadow-2xl z-50 border border-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Alerts & Intel</span>
                  <span className="text-[10px] text-emerald-400 font-mono">3 Unresolved</span>
                </div>
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        n.urgent
                          ? 'bg-rose-500/10 border-rose-500/30 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-200">
                {isAnonymized && role !== 'employee' ? user?.anonymizedId : user?.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.department}
              </span>
            </div>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
            />
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
