import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Mic,
  Loader2,
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

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify-otp' | 'entry'>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [rank, setRank] = useState('Inspector');
  const [serviceNumber, setServiceNumber] = useState('');
  const [force, setForce] = useState('CRPF');
  const [unit, setUnit] = useState('142 Bn (Srinagar Sector HQ)');
  const [role, setRole] = useState<UserRole>('personnel');

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ── OCR Scanner ─────────────────────────────────────────────────────────────
  const handleOcrScan = async (file: File) => {
    setOcrLoading(true);
    setOcrResult(null);
    setOcrImage(URL.createObjectURL(file));

    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrResult(`Scanning... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data?.text || '';
      setOcrResult(text || 'No text detected. Please try again with a clearer image.');

      const extract = (pattern: RegExp) => {
        const match = text.match(pattern);
        return match ? match[1].trim() : '';
      };

      const detectedServiceNumber = extract(/(?:Service Number|UFN|Service ID)[:\s]+([A-Z0-9\-]+)/i) || extract(/[A-Z]{2,5}-[A-Z0-9\-]+/);
      const detectedName = extract(/(?:Name|Full Name)[:\s]+([A-Za-z\s\.]+)/i) || extract(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
      const detectedRank = extract(/(?:Rank)[:\s]+([A-Za-z\s\/]+)/i);

      if (detectedServiceNumber) setServiceNumber(detectedServiceNumber);
      if (detectedName) setName(detectedName);
      if (detectedRank) setRank(detectedRank);

      if (detectedServiceNumber || detectedName) {
        setSuccessMsg('ID card scanned successfully. Fields populated. Switching to Secure Signup...');
        setTimeout(() => {
          setMode('signup');
          setShowOcrModal(false);
        }, 1500);
      }
    } catch (err) {
      setOcrResult('Scan failed. Please try again or enter details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  // ── Voice Assistant ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.onerror = () => {
      setVoiceListening(false);
      setErrorMsg('Voice recognition failed. Please try again or enter manually.');
    };

    recognitionRef.current = recognition;
  }, []);

  const startVoiceAuth = () => {
    if (!recognitionRef.current) {
      setErrorMsg('Voice recognition is not supported in this browser.');
      return;
    }
    setVoiceListening(true);
    setVoiceTranscript('');
    setErrorMsg(null);
    recognitionRef.current.start();
  };

  const stopVoiceAuth = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceListening(false);
  };

  const handleVoiceSubmit = () => {
    if (!voiceTranscript.trim()) return;
    setEmail(voiceTranscript);
    setMode('login');
    setShowVoiceModal(false);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Email Address / Service ID and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseSignIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to authenticate. Please check your credentials.');
    } else {
      setSuccessMsg('Authentication successful! Loading your authorized military clearance profile...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────────────────────
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
    const { error, data } = await supabaseSignUp(email.trim(), password, {
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
    } else if (data?.requiresEmailConfirmation) {
      setSuccessMsg('Account created successfully! Please check your email and confirm your address before logging in.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg(null);
      }, 2500);
    } else {
      setSuccessMsg('Account created and verified! Loading your profile...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    }
  };

  // ── OTP Verification ───────────────────────────────────────────────────────
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
      setSuccessMsg('Email verified successfully! Your account is now active. Loading your profile...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
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

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoading(true);
    await supabaseSignOut();
    setLoading(false);
    setSuccessMsg(null);
  };

  if (session && supabaseUser && showLogoutOnly) {
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
            <span className="text-white font-sans truncate max-w-[180px]}">{profileUser?.unit}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-950/50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? 'Disconnecting...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6 md:p-8 rounded-3xl bg-olive-950/95 border border-accent-gold/40 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center pb-6 border-b border-olive-800/80 relative z-10">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-accent-gold/40 shadow-lg mb-3">
          <Shield className="w-8 h-8 text-accent-gold" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          VeerWell Identity Gateway
        </h2>
        <p className="text-xs text-olive-300 font-mono mt-1">
          Secure Authentication • Military-Grade Access Guard
        </p>
      </div>

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

      {mode === 'entry' && (
        <div className="mt-6 space-y-3 relative z-10">
          <button
            onClick={() => setMode('login')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-accent-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Shield className="w-5 h-5" />
            <span>Secure Login via Service ID</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowOcrModal(true)}
            className="w-full py-4 px-6 rounded-2xl bg-olive-900/80 border border-olive-600/50 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-olive-800 transition-all"
          >
            <Camera className="w-5 h-5 text-accent-gold" />
            <span>Scan Force ID Card</span>
          </button>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="w-full py-4 px-6 rounded-2xl bg-olive-900/80 border border-olive-600/50 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-olive-800 transition-all"
          >
            <Mic className="w-5 h-5 text-accent-gold" />
            <span>Tactical Voice Access</span>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-olive-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-olive-950 text-olive-400">New Personnel</span>
            </div>
          </div>

          <button
            onClick={() => setMode('signup')}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Secure Signup</span>
          </button>
        </div>
      )}

      {mode !== 'entry' && (
        <div className="mt-4">
          <button
            onClick={() => { setMode('entry'); setErrorMsg(null); setSuccessMsg(null); }}
            className="text-xs text-olive-400 hover:text-accent-gold font-mono flex items-center gap-1 mb-4"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span>Back to entry options</span>
          </button>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="mt-4 space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-gold" />
              <span>Email Address or Military Service ID</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. commander.singh@crpf.gov.in or CRPF-CMD-7801"
                className="w-full px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold text-white placeholder:text-olive-500 text-sm font-mono transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent-gold" />
                Password
              </span>
              <span
                onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-[10px] text-olive-400 hover:text-accent-gold cursor-pointer transition-colors"
              >
                Forgot password?
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-accent-saffron to-amber-500 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-accent-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Command Grid</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Sign Up Form */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="mt-4 space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Col. Rajesh Sharma"
                className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-sans outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Service Number / ID</label>
              <input
                type="text"
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value)}
                placeholder="CRPF-984210"
                className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@crpf.gov.in"
              className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-mono outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Force</label>
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
              <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Rank</label>
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
              <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Command Role</label>
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

          <div>
            <label className="block text-[11px] font-bold text-olive-300 font-mono mb-1">Unit / Post Location</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="142 Bn (Srinagar Sector HQ)"
              className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-xs font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-accent-saffron to-amber-500 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-accent-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>Create Secure Account</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Forgot Password */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="mt-4 space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-gold" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@crpf.gov.in"
              className="w-full px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-sm font-mono transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-accent-saffron to-amber-500 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-accent-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Mail className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* OTP Verification */}
      {mode === 'verify-otp' && (
        <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-olive-300 font-mono mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent-gold" />
              OTP Code (6 digits)
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-sm font-mono text-center tracking-widest transition-all outline-none"
            />
            <p className="mt-2 text-xs text-olive-400 font-mono">
              Check your email at <strong>{email}</strong> for the verification code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-gold via-accent-saffron to-amber-500 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-accent-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <span>Verify Email OTP</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Security Footer */}
      <div className="mt-6 pt-4 border-t border-olive-800/60 flex items-center justify-between text-[11px] text-olive-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security Protocol Active</span>
        </div>
        <div>
          <span>Secure Session</span>
        </div>
      </div>

      {/* OCR Modal */}
      <AnimatePresence>
        {showOcrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setShowOcrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-olive-950 border border-olive-700 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent-gold" />
                  Scan Force ID Card
                </h3>
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="text-olive-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-olive-600 rounded-2xl p-8 text-center cursor-pointer hover:border-accent-gold transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOcrScan(file);
                    }}
                  />
                  <Camera className="w-12 h-12 text-olive-400 mx-auto mb-2" />
                  <p className="text-sm text-olive-300">Click to capture or upload ID card image</p>
                  <p className="text-xs text-olive-500 mt-1">Supports JPG, PNG</p>
                </div>

                {ocrImage && (
                  <div className="rounded-xl overflow-hidden border border-olive-700">
                    <img src={ocrImage} alt="Captured Document" className="w-full h-48 object-cover" />
                  </div>
                )}

                {ocrLoading && (
                  <div className="flex items-center gap-2 text-accent-gold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-mono">{ocrResult || 'Scanning document...'}</span>
                  </div>
                )}

                {ocrResult && !ocrLoading && (
                  <div className="p-3 rounded-xl bg-olive-900/80 border border-olive-700 text-xs font-mono text-olive-200 max-h-32 overflow-y-auto">
                    {ocrResult}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => { setShowVoiceModal(false); stopVoiceAuth(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-olive-950 border border-olive-700 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-accent-gold" />
                  Tactical Voice Access
                </h3>
                <button
                  onClick={() => { setShowVoiceModal(false); stopVoiceAuth(); }}
                  className="text-olive-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-olive-300 font-mono">
                  Speak your Service ID, Email, or identify yourself verbally
                </p>

                <button
                  onClick={voiceListening ? stopVoiceAuth : startVoiceAuth}
                  className={`w-full py-6 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                    voiceListening
                      ? 'border-rose-500 bg-rose-950/50 text-rose-200'
                      : 'border-accent-gold bg-olive-900/50 text-white hover:bg-olive-800'
                  }`}
                >
                  {voiceListening ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                      <span>Listening... Speak now</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 text-accent-gold" />
                      <span>Start Voice Authentication</span>
                    </>
                  )}
                </button>

                {voiceTranscript && (
                  <div className="p-3 rounded-xl bg-olive-900/80 border border-olive-700 text-sm text-olive-200">
                    <span className="text-[10px] font-mono text-olive-400 block mb-1">TRANSCRIPT:</span>
                    {voiceTranscript}
                  </div>
                )}

                {voiceTranscript && !voiceListening && (
                  <button
                    onClick={handleVoiceSubmit}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 font-black text-sm flex items-center justify-center gap-2"
                  >
                    <span>Continue with Voice Input</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
