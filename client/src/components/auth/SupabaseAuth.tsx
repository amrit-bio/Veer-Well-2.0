import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { BrandedLoader } from '../common/BrandedLoader';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  LogIn,
  UserPlus,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileBadge,
} from 'lucide-react';

interface SupabaseAuthProps {
  onSuccess?: () => void;
  showLogoutOnly?: boolean;
}

export const SupabaseAuth: React.FC<SupabaseAuthProps> = ({ onSuccess, showLogoutOnly = false }) => {
  const {
    session,
    supabaseUser,
    supabaseSignIn,
    supabaseSignUp,
    supabaseSignOut,
    supabaseResetPassword,
    supabaseVerifyOtp,
    user: profileUser,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify-otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Optional military sign-up metadata
  const [name, setName] = useState('');
  const [rank, setRank] = useState('Inspector');
  const [serviceNumber, setServiceNumber] = useState('');
  const [force, setForce] = useState('CRPF');
  const [unit, setUnit] = useState('142 Bn (Srinagar Sector HQ)');
  const [role, setRole] = useState<UserRole>('personnel');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseSignIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to authenticate. Please check your credentials.');
    } else {
      setSuccessMsg('Authentication successful! Loading your profile from the database…');
      if (onSuccess) onSuccess();
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter an email and a secure password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseSignUp(email.trim(), password, {
      name: name.trim() || email.split('@')[0],
      rank,
      serviceNumber: serviceNumber.trim() || `CRPF-${Math.floor(100000 + Math.random() * 900000)}`,
      force,
      unit,
      role,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to register account. Please try again.');
    } else {
      setSuccessMsg('✅ Account created and verified! Loading your profile…');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setErrorMsg('Please enter the OTP code from your email.');
      return;
    }

    if (otp.length < 6) {
      setErrorMsg('OTP must be 6 digits long.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseVerifyOtp(email.trim(), otp);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'OTP verification failed. Please check the code and try again.');
    } else {
      setSuccessMsg('✅ Email verified successfully! Your account is now active. Loading your profile…');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    await supabaseSignOut();
    setLoading(false);
    setSuccessMsg(null);
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseResetPassword(email.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setSuccessMsg('Password reset link sent to your email. Please check your inbox.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg(null);
      }, 3000);
    }
  };

  // If user is actively logged in and we just want to display user state & logout button
  if (session && supabaseUser) {
    return (
      <div className="p-6 rounded-3xl bg-olive-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl max-w-md mx-auto text-slate-100">
        <div className="flex items-center gap-3 pb-4 border-b border-olive-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {profileUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm truncate">{profileUser?.name || supabaseUser.email}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-olive-300 font-mono truncate">{supabaseUser.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs font-mono text-slate-300">
          <div className="flex justify-between py-1 border-b border-olive-900">
            <span className="text-olive-400">UID:</span>
            <span className="truncate max-w-[200px] text-accent-gold">{supabaseUser.id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-olive-900">
            <span className="text-olive-400">Rank & Force:</span>
            <span className="text-white font-sans">{profileUser?.rank} • {profileUser?.force}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-olive-900">
            <span className="text-olive-400">Service ID:</span>
            <span className="text-emerald-400">{profileUser?.serviceNumber}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-olive-900">
            <span className="text-olive-400">Assigned Unit:</span>
            <span className="text-white font-sans truncate max-w-[180px]">{profileUser?.unit}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-950/50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Disconnecting…' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6 md:p-8 rounded-3xl bg-olive-950/95 border border-accent-gold/40 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center pb-6 border-b border-olive-800/80 relative z-10">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-accent-gold/40 shadow-lg mb-3">
          <Shield className="w-8 h-8 text-accent-gold" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          VeerWell Identity Gateway
        </h2>
        <p className="text-xs text-olive-300 font-mono mt-1">
          Secure Authentication • Row Level Security Guard
        </p>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-olive-900/80 border border-olive-700/60 max-w-xs mx-auto mt-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-center font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 shadow-md font-black'
                : 'text-olive-300 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-center font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 shadow-md font-black'
                : 'text-olive-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Form Content */}
      <form onSubmit={
        mode === 'login' ? handleLogin :
        mode === 'signup' ? handleSignUp :
        mode === 'verify-otp' ? handleVerifyOtp :
        handleForgotPassword
      } className="mt-4 space-y-4 relative z-10">
        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-accent-gold" />
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. commander.singh@crpf.gov.in"
              className="w-full px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold text-white placeholder:text-olive-500 text-sm font-mono transition-all outline-none"
            />
          </div>
        </div>

        {/* Password */}
        {mode !== 'forgot' && (
          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent-gold" />
                Password
              </span>
              {mode === 'login' && (
                <span
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[10px] text-olive-400 hover:text-accent-gold cursor-pointer transition-colors"
                >
                  Forgot password?
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={mode === 'login' || mode === 'signup'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold text-white placeholder:text-olive-500 text-sm font-mono transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* OTP Verification */}
        {mode === 'verify-otp' && (
          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-gold" />
              OTP Code (6 digits)
            </label>
            <input
              type="text"
              maxLength={6}
              required={mode === 'verify-otp'}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold text-white placeholder:text-olive-500 text-sm font-mono text-center tracking-widest transition-all outline-none"
            />
            <p className="mt-2 text-xs text-olive-400 font-mono">
              Check your email at <strong>{email}</strong> for the verification code
            </p>
          </div>
        )}

        {/* Additional Fields for Sign Up */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t border-olive-800/60"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Col. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-sans outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">
                  Service Number / ID
                </label>
                <input
                  type="text"
                  value={serviceNumber}
                  onChange={(e) => setServiceNumber(e.target.value)}
                  placeholder="CRPF-984210"
                  className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">
                  Force
                </label>
                <select
                  value={force}
                  onChange={(e) => setForce(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 text-white text-xs outline-none"
                >
                  <option value="CRPF">CRPF</option>
                  <option value="BSF">BSF</option>
                  <option value="ITBP">ITBP</option>
                  <option value="CISF">CISF</option>
                  <option value="SSB">SSB</option>
                  <option value="Assam Rifles">Assam Rifles</option>
                  <option value="NSG">NSG</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">
                  Rank
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 text-white text-xs outline-none"
                >
                  <option value="Commandant / CO">Commandant / CO</option>
                  <option value="Chief Medical Officer">Chief Medical Officer</option>
                  <option value="Assistant Commandant">Assistant Commandant</option>
                  <option value="Inspector">Inspector</option>
                  <option value="Sub-Inspector">Sub-Inspector</option>
                  <option value="Head Constable">Head Constable</option>
                  <option value="Behavioral Analyst">Behavioral Analyst</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">
                  Command Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 text-white text-xs outline-none"
                >
                  <option value="personnel">Personnel (Jawan)</option>
                  <option value="commander">Commander (CO)</option>
                  <option value="welfare_officer">Welfare Officer</option>
                  <option value="analyst">Data Analyst</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-accent-saffron to-amber-500 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-accent-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              <span>Processing…</span>
            </div>
          ) : mode === 'login' ? (
            <>
              <span>Sign In to Command Grid</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : mode === 'signup' ? (
            <>
              <span>
                Create Secure Account
              </span>
              <ShieldCheck className="w-4 h-4" />
            </>
          ) : mode === 'verify-otp' ? (
            <>
              <span>Verify Email OTP</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          ) : mode === 'forgot' ? (
            <>
              <span>Send Reset Link</span>
              <Mail className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Footer */}
      <div className="mt-6 pt-4 border-t border-olive-800/60 flex items-center justify-between text-[11px] text-olive-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RLS Enforced</span>
        </div>
        <div>
          <span>JWT • Secure Database</span>
        </div>
      </div>
    </div>
  );
};
