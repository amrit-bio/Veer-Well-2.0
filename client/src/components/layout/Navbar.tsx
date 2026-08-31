import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wordmark } from '../common/Wordmark';
import { UserRole } from '../../types';
import {
  Bell,
  Eye,
  EyeOff,
  ChevronDown,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Radio,
  LogIn,
  UserPlus,
  Key,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, role, switchRole, isAnonymized, toggleAnonymization, openAuthModal, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesList: { role: UserRole; title: string; rank: string; force: string; id: string }[] = [
    { role: 'commander', title: 'Commander (CO)', rank: 'Commandant', force: 'CRPF Srinagar Sector', id: 'CRPF-CMD-7801' },
    { role: 'welfare_officer', title: 'Welfare Officer / Doctor', rank: 'Chief Medical Officer', force: 'CAPF Medical', id: 'CRPF-MED-8492' },
    { role: 'personnel', title: 'Personnel / Jawan', rank: 'Inspector Field Lead', force: '209 CoBRA Bn', id: 'CRPF-COBRA-1042' },
    { role: 'analyst', title: 'Data Analyst', rank: 'Lead Scientist', force: 'MHA CAPF HQ', id: 'MHA-ANA-9104' },
  ];

  const alerts = [
    {
      id: 'al-1',
      title: 'High Altitude Fatigue Surge',
      unit: 'Leh Forward Outpost Bravo (ITBP)',
      msg: 'Average HRV drop of 28% detected across night patrol rotation.',
      time: '8m ago',
      urgent: true,
    },
    {
      id: 'al-2',
      title: 'Consecutive Shift Threshold Reached',
      unit: '209 CoBRA Bn (Special Ops)',
      msg: '3 personnel exceeded 48h active tactical tempo without rest.',
      time: '45m ago',
      urgent: true,
    },
    {
      id: 'al-3',
      title: 'Voluntary Self-Assessment Completed',
      unit: '142 Bn Srinagar Sector',
      msg: 'New anonymous mood survey submitted with optimal resilience index.',
      time: '2h ago',
      urgent: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-olive-400/20 bg-olive-950/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <Wordmark size="md" />
        </div>

        {/* Center: Live Status & Privacy Shield Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-olive-900/80 border border-olive-500/30 text-accent-gold text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
            <span>Secure CAPF Grid: Active</span>
          </div>

          {/* Anonymization Privacy Toggle */}
          <button
            onClick={toggleAnonymization}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              isAnonymized
                ? 'bg-accent-gold/15 border-accent-gold/40 text-amber-200 hover:bg-accent-gold/25'
                : 'bg-olive-900 border-olive-700 text-slate-300 hover:bg-olive-800'
            }`}
            title="Toggle Privacy Mask (Anonymized Node ID vs Real Officer Name)"
          >
            {isAnonymized ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-accent-gold" />
                <span>Privacy Mode: <strong>ANONYMIZED</strong></span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>Privacy Mode: <strong>DECODED</strong></span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick Role Switcher, Military ID & Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Dedicated Login / Role Switcher Button */}
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-gold/20 to-amber-500/20 border border-accent-gold/50 text-accent-gold hover:bg-accent-gold/30 text-xs font-bold font-mono transition-all shadow-sm"
            title="Open Role-Based Login & New Member Registration Portal"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login / Switch ID</span>
          </button>

          {/* Active User Role & ID Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-900 border border-olive-500/40 hover:border-accent-gold text-xs text-slate-200 transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-accent-gold" />
              <div className="text-left hidden sm:block leading-tight">
                <div className="font-bold text-white text-[11px] capitalize">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-[9px] font-mono text-accent-gold">
                  {isAnonymized ? user.anonymizedId : user.serviceNumber}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-olive-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-2.5 shadow-2xl z-50 border border-olive-500/40 bg-olive-950 animate-in fade-in">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-olive-800">
                  <span className="text-[10px] font-mono text-accent-gold uppercase tracking-wider font-bold">
                    Active Military Identity (RBAC)
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">Online</span>
                </div>

                {/* Current Profile Card */}
                <div className="p-2.5 my-1.5 rounded-xl bg-olive-900/60 border border-olive-700/60 text-xs space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-accent-gold" />
                    <span>{isAnonymized ? user.anonymizedId : user.name}</span>
                  </div>
                  <div className="text-[11px] text-olive-300 font-mono">
                    {user.rank} • {user.force}
                  </div>
                  <div className="text-[10px] text-olive-400">
                    {user.unit}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-olive-400 px-2 py-1 uppercase">
                  Quick Switch Persona (Testing):
                </div>

                <div className="space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex flex-col items-start px-3 py-2 rounded-xl text-left transition-colors ${
                        role === r.role
                          ? 'bg-olive-800 text-white font-bold border border-accent-gold/40'
                          : 'hover:bg-olive-900 text-olive-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{r.title}</span>
                        <span className="text-[10px] font-mono text-accent-gold">{r.id}</span>
                      </div>
                      <span className="text-[10px] text-olive-300 font-mono">{r.rank} • {r.force}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-olive-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      openAuthModal();
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-olive-900 hover:bg-olive-800 border border-olive-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Login Modal</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-olive-900 border border-olive-700/50 hover:border-olive-500 text-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4 text-accent-gold" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-crimson text-[9px] font-bold flex items-center justify-center text-white">
                2
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-3 shadow-2xl z-50 border border-olive-500/40 bg-olive-950">
                <div className="flex items-center justify-between pb-2 border-b border-olive-800">
                  <span className="text-xs font-bold text-white">Welfare & Tactical Alerts</span>
                  <span className="text-[10px] text-accent-gold font-mono">2 Urgent Flags</span>
                </div>
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        al.urgent
                          ? 'bg-rose-950/40 border-rose-500/40 text-slate-100'
                          : 'bg-olive-900/60 border-olive-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-accent-gold">
                        <span>{al.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{al.time}</span>
                      </div>
                      <div className="text-[10px] font-mono text-olive-300 mt-0.5">{al.unit}</div>
                      <p className="text-[11px] text-slate-300 mt-1">{al.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-olive-800">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-xl object-cover border border-accent-gold/40 shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
