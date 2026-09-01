import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, ROLE_PRESETS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { BrandedLoader } from '../common/BrandedLoader';
import { SupabaseAuth } from './SupabaseAuth';
import {
  Shield,
  Lock,
  User,
  Key,
  CheckCircle2,
  X,
  Award,
  Sparkles,
  HeartPulse,
  Cpu,
  Radio,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  Building2,
  BadgeAlert,
  Database,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup, role: activeContextRole, session } = useAuth();
  const [authMode, setAuthMode] = useState<'supabase' | 'login' | 'signup'>('supabase');
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeContextRole || 'commander');

  // Login form state
  const [loginId, setLoginId] = useState<string>(ROLE_PRESETS.commander.defaultLoginId);
  const [loginPassword, setLoginPassword] = useState<string>(ROLE_PRESETS.commander.defaultPassword);
  const [loginError, setLoginError] = useState<string>('');
  const [authBusy, setAuthBusy] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState<string>('');
  const [signupRank, setSignupRank] = useState<string>('Inspector');
  const [signupServiceNo, setSignupServiceNo] = useState<string>('');
  const [signupForce, setSignupForce] = useState<string>('CRPF');
  const [signupUnit, setSignupUnit] = useState<string>('142 Bn (Srinagar Sector HQ)');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  // Sync default login ID when selecting different role
  const handleRoleSelect = (r: UserRole) => {
    setSelectedRole(r);
    setLoginId(ROLE_PRESETS[r].defaultLoginId);
    setLoginPassword(ROLE_PRESETS[r].defaultPassword);
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setLoginError('Please provide your Military Login ID / Service Number.');
      return;
    }
    setAuthBusy(true);
    window.setTimeout(() => {
      login(loginId, selectedRole, loginPassword);
      setAuthBusy(false);
    }, 650);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupServiceNo.trim()) {
      setLoginError('Full name and military service number are required.');
      return;
    }

    const ok = signup({
      name: signupName,
      rank: signupRank,
      serviceNumber: signupServiceNo,
      force: signupForce,
      unit: signupUnit,
      role: selectedRole,
      password: signupPassword,
    });

    if (ok) {
      setSignupSuccess(true);
      setTimeout(() => {
        setSignupSuccess(false);
      }, 1500);
    }
  };

  if (!isAuthModalOpen) return null;

  // A live Supabase session is bound to one account. Do not expose demo role
  // switching or another enrollment form while that identity is active.
  if (session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl">
        <div className="relative w-full max-w-md rounded-3xl glass-panel border border-accent-gold/40 shadow-2xl bg-olive-950/95 p-5 md:p-6 text-slate-100">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-olive-400 hover:text-white hover:bg-olive-800 transition-colors"
            aria-label="Close account panel"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-10 mb-5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">Signed-in account</div>
            <h2 className="text-lg font-black text-white mt-1">Your assigned identity</h2>
            <p className="text-xs text-olive-300 mt-1">This session is limited to the tabs and data assigned to your post.</p>
          </div>
          <SupabaseAuth onSuccess={closeAuthModal} showLogoutOnly />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-accent-gold/40 shadow-2xl bg-olive-950/95 overflow-hidden text-slate-100"
        >
          {/* Header Banner */}
          <div className="p-5 md:p-6 border-b border-olive-800/80 bg-gradient-to-r from-olive-900 via-olive-950 to-olive-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                    Military Role Authentication Grid
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Zero-Trust RBAC
                  </span>
                </div>
                <p className="text-xs text-olive-300 font-mono">
                  VeerWell 2.0 • Distinct Logins & Granular Command Authorities
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="p-2 rounded-xl text-olive-400 hover:text-white hover:bg-olive-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
            {authBusy ? (
              <BrandedLoader label="Authenticating on the CAPF identity grid…" />
            ) : (
            <>
            {/* Mode Switcher Pills: Supabase vs Military Presets vs Sign Up */}
            <div className="flex items-center p-1 rounded-2xl bg-olive-900/80 border border-olive-700/60 max-w-md mx-auto text-xs">
              <button
                onClick={() => {
                  setAuthMode('supabase');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-center font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'supabase'
                    ? 'bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 shadow-md font-black'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Live Auth</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-center font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 shadow-md font-black'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Role Presets</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-center font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 shadow-md font-black'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enrol</span>
              </button>
            </div>

            {/* View 0: Supabase Live Email & Password Component */}
            {authMode === 'supabase' && (
              <div className="pt-2">
                <SupabaseAuth onSuccess={closeAuthModal} />
              </div>
            )}

            {authMode !== 'supabase' && (
            <>
            {/* Role Selection Cards (Distinct Military Roles) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-accent-gold font-bold">
                1. Select Military Authority & Designated Role:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['commander', 'welfare_officer', 'personnel', 'analyst'] as UserRole[]).map((r) => {
                  const preset = ROLE_PRESETS[r];
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-olive-900/90 border-accent-gold shadow-lg shadow-amber-500/10 ring-1 ring-accent-gold/60'
                          : 'bg-olive-950/60 border-olive-800/80 hover:bg-olive-900/50 hover:border-olive-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {r === 'commander' && <Award className="w-4 h-4 text-accent-gold" />}
                          {r === 'welfare_officer' && <HeartPulse className="w-4 h-4 text-rose-400" />}
                          {r === 'personnel' && <Shield className="w-4 h-4 text-emerald-400" />}
                          {r === 'analyst' && <Cpu className="w-4 h-4 text-cyan-400" />}
                          <span className="text-xs font-black text-white">{preset.roleLabel}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />}
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-olive-300">Login ID:</span>
                        <span className="font-bold text-accent-gold bg-olive-950 px-2 py-0.5 rounded border border-olive-800">
                          {preset.defaultLoginId}
                        </span>
                      </div>

                      <p className="text-[10px] text-olive-300/80 mt-1 line-clamp-1">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View 1: Login Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-olive-300 font-mono">
                      Military Service No. / Login ID:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId(ROLE_PRESETS[selectedRole].defaultLoginId);
                        setLoginPassword(ROLE_PRESETS[selectedRole].defaultPassword);
                      }}
                      className="text-[10px] font-mono text-accent-gold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use Demo Preset ID</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. CRPF-CMD-7801 or CRPF-COBRA-1042"
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent-gold"
                    />
                    <Key className="w-4 h-4 text-olive-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-olive-300 font-mono text-xs">
                    Access Passcode / Security PIN:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent-gold"
                    />
                    <Lock className="w-4 h-4 text-olive-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron text-navy-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-98 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate as {ROLE_PRESETS[selectedRole].roleLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* View 2: Sign-Up Form */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-olive-300 font-mono">Full Name & Rank:</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Sub-Insp. Rahul Sharma"
                      required
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-olive-300 font-mono">Service Number (Unique ID):</label>
                    <input
                      type="text"
                      value={signupServiceNo}
                      onChange={(e) => setSignupServiceNo(e.target.value)}
                      placeholder="e.g. CRPF-902148"
                      required
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-olive-300 font-mono">Force Branch:</label>
                    <select
                      value={signupForce}
                      onChange={(e) => setSignupForce(e.target.value)}
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold font-mono"
                    >
                      <option value="CRPF">Central Reserve Police Force (CRPF)</option>
                      <option value="BSF">Border Security Force (BSF)</option>
                      <option value="ITBP">Indo-Tibetan Border Police (ITBP)</option>
                      <option value="CISF">Central Industrial Security Force (CISF)</option>
                      <option value="SSB">Sashastra Seema Bal (SSB)</option>
                      <option value="Assam Rifles">Assam Rifles</option>
                      <option value="NSG">National Security Guard (NSG)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-olive-300 font-mono">Unit / Battalion:</label>
                    <input
                      type="text"
                      value={signupUnit}
                      onChange={(e) => setSignupUnit(e.target.value)}
                      placeholder="e.g. 209 CoBRA or 142 Bn Srinagar"
                      required
                      className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-olive-300 font-mono">Create Secure Passcode:</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-gold"
                  />
                </div>

                {/* Cryptographic Welfare Token Preview */}
                <div className="p-3 rounded-2xl bg-olive-900/60 border border-accent-gold/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-accent-gold font-bold">
                    <span>🛡️ Non-Reversible Welfare Token:</span>
                    <span>k=5 Anonymity</span>
                  </div>
                  <p className="text-[10px] text-olive-300 leading-relaxed">
                    Under the Armed Forces Welfare Doctrine, registration deterministically assigns token <code>CAPF-NODE-XXXX</code>. Psychological records cannot be accessed for disciplinary actions.
                  </p>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-navy-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enrol Personnel & Issue Protected Credential</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            </>
            )}
            </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
