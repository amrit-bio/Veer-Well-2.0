import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  Minimize2,
  Maximize2,
  Activity,
  HeartPulse,
  Shield,
  Zap,
  Sliders,
  Wind,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BrandLogo } from './BrandLogo';
import { predictXGBoost } from '../../lib/xgboostEngine';
import { generateRakshakIntelligence } from '../../lib/rakshakEngine';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  badge?: string;
  recommendations?: string[];
}

export const AiWelfareCopilot: React.FC = () => {
  const { user, role, isAnonymized } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'simulator' | 'breathing'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Jai Hind, ${user.rank} ${user.name}. I am Rakshak AI, powered by advanced AI. All communications are confidential under the Armed Forces Welfare Doctrine. How may I support your unit today?`,
      time: 'Just now',
      badge: 'AI Active',
      recommendations: [
        'Run 7-day burnout risk inference for High Altitude patrols',
        'Recommend post-mission decompression protocols for CoBRA scouts',
        'Start 2-minute tactical box-breathing pacer',
        'How to apply for 3-day Wellness Recharge leave?',
      ],
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Helper to format markdown text
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-accent-gold mt-2 mb-1 border-b border-olive-800/80 pb-0.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2 or 1
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="text-sm font-black text-white mt-2.5 mb-1 text-accent-gold">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      }
      // Bullet points (* or -)
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().replace(/^[\*\-]\s+/, '');
        // Replace bold **text**
        const formattedContent = content.split(/(\*\*.*?\*\*)/).map((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={sIdx} className="text-accent-gold font-bold">{seg.slice(2, -2)}</strong>;
          }
          return seg;
        });
        return (
          <li key={idx} className="ml-3 list-disc text-slate-200 my-0.5 leading-relaxed">
            {formattedContent}
          </li>
        );
      }
      // Numbered items (1. 2. etc)
      if (/^\d+\.\s/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s+/, '');
        const formattedContent = content.split(/(\*\*.*?\*\*)/).map((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={sIdx} className="text-accent-gold font-bold">{seg.slice(2, -2)}</strong>;
          }
          return seg;
        });
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 text-slate-200 leading-relaxed">
            <span className="font-mono text-accent-gold font-bold text-[11px] mt-0.5">{line.trim().match(/^\d+\./)?.[0]}</span>
            <div>{formattedContent}</div>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular paragraph with bold text parsing
      const formattedLine = line.split(/(\*\*.*?\*\*)/).map((seg, sIdx) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={sIdx} className="text-white font-bold">{seg.slice(2, -2)}</strong>;
        }
        return seg;
      });
      return <p key={idx} className="my-1 leading-relaxed text-slate-200">{formattedLine}</p>;
    });
  };


  // Stress Simulator State
  const [simShiftHours, setSimShiftHours] = useState<number>(48);
  const [simSleepDeficit, setSimSleepDeficit] = useState<number>(2.5);
  const [simAltitude, setSimAltitude] = useState<boolean>(true);
  const [simConsecutiveDays, setSimConsecutiveDays] = useState<number>(6);

  // Breathing Pacer State
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold (Rest)'>('Inhale');
  const [breathingSeconds, setBreathingSeconds] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Breathing Timer
  useEffect(() => {
    if (!isBreathingActive) return;
    const interval = setInterval(() => {
      setBreathingSeconds((prev) => {
        if (prev <= 1) {
          setBreathingPhase((curPhase) => {
            if (curPhase === 'Inhale') return 'Hold';
            if (curPhase === 'Hold') return 'Exhale';
            if (curPhase === 'Exhale') return 'Hold (Rest)';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Calculate ML Simulated Risk Score
  const calculateSimulatedRisk = () => {
    const pred = predictXGBoost({
      meanAnswer: simSleepDeficit / 3,
      sleepLoad: Math.min(3, simSleepDeficit / 2),
      burnoutLoad: Math.min(3, simShiftHours / 24),
      cognitiveLoad: Math.min(3, simConsecutiveDays / 5),
      safetyLoad: 1,
      heartRate: 62 + simShiftHours / 4,
      spo2: simAltitude ? 91 : 97,
      hrv: Math.max(28, 72 - simSleepDeficit * 6 - (simAltitude ? 8 : 0)),
      shiftHours: simShiftHours,
      sleepDeficit: simSleepDeficit,
      consecutiveDays: simConsecutiveDays,
      altitude: simAltitude ? 1 : 0,
    });
    return {
      score: pred.stressScore,
      hrvDrop: pred.hrvDropPct,
      tier: pred.riskBand === 'Critical' ? 'Critical Strain Risk' : pred.riskBand === 'High' ? 'High Burnout Warning' : pred.riskBand === 'Moderate' ? 'Moderate Strain' : 'Optimal / Low Risk',
      model: pred.model,
    };
  };

  const simResult = calculateSimulatedRisk();

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputVal('');
    setIsTyping(true);

    try {
      const result = await api.chatWithRakshak(
        text,
        {
          userRank: user.rank,
          userName: isAnonymized ? user.anonymizedId : user.name,
          force: user.force,
          unit: user.unit,
          role,
          isAnonymized,
          shiftHours: simShiftHours,
          altitudeActive: simAltitude,
        },
        updatedHistory.map((m) => ({ sender: m.sender, text: m.text }))
      );

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: result.model || 'Rakshak AI',
        recommendations: [
          'What are the 5 core views of VeerWell?',
          'What are the key symptoms of hypoxia fatigue in Leh?',
          'How does the Armed Forces Welfare Doctrine protect me?',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackIntel = generateRakshakIntelligence(text, {
        userRank: user.rank,
        userName: isAnonymized ? user.anonymizedId : user.name,
        force: user.force,
        unit: user.unit,
        role,
        isAnonymized,
        shiftHours: simShiftHours,
        altitudeActive: simAltitude,
      });
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackIntel.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: fallbackIntel.model,
        recommendations: fallbackIntel.recommendations,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };



  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-olive-700 via-olive-600 to-accent-gold text-slate-950 font-bold text-xs md:text-sm shadow-2xl shadow-olive-950/80 border border-accent-gold/50 glow-gold transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-navy-950 text-accent-gold flex items-center justify-center relative">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold animate-spin-slow" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-saffron animate-ping" />
          </div>
          <span className="text-white font-extrabold tracking-wide">
            {isOpen ? 'Close Copilot' : 'Rakshak AI Copilot'}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-950/80 text-accent-gold border border-accent-gold/40">
            Live
          </span>
        </motion.button>
      </div>

      {/* Floating Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed bottom-20 right-4 sm:right-6 z-50 rounded-3xl glass-panel border border-accent-gold/40 shadow-2xl bg-olive-950/95 flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 ${
              isExpanded
                ? 'w-[calc(100vw-2rem)] sm:w-[680px] h-[720px] max-h-[90vh]'
                : 'w-[calc(100vw-2rem)] sm:w-[480px] h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-olive-800/80 bg-gradient-to-r from-olive-900 via-olive-950 to-olive-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Rakshak AI Copilot</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      AES-256
                    </span>
                  </div>
                  <div className="text-[10px] text-olive-300 font-mono">
                    CAPF Behavioral Stress Intelligence
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-xl text-olive-400 hover:text-white hover:bg-olive-800 transition-colors"
                  title={isExpanded ? 'Standard View' : 'Expand View'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-olive-400 hover:text-white hover:bg-olive-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-around border-b border-olive-800/60 bg-olive-950/60 p-1 text-xs">
              <button
                onClick={() => setActiveMode('chat')}
                className={`flex-1 py-1.5 text-center font-bold rounded-xl transition-all ${
                  activeMode === 'chat'
                    ? 'bg-olive-800 text-accent-gold shadow-sm border border-olive-600/50'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                Welfare Copilot
              </button>
              <button
                onClick={() => setActiveMode('simulator')}
                className={`flex-1 py-1.5 text-center font-bold rounded-xl transition-all ${
                  activeMode === 'simulator'
                    ? 'bg-olive-800 text-accent-gold shadow-sm border border-olive-600/50'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                Risk Simulator
              </button>
              <button
                onClick={() => setActiveMode('breathing')}
                className={`flex-1 py-1.5 text-center font-bold rounded-xl transition-all ${
                  activeMode === 'breathing'
                    ? 'bg-olive-800 text-accent-gold shadow-sm border border-olive-600/50'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                Box Breathing
              </button>
            </div>

            {/* View 1: Chat Mode */}
            {activeMode === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-olive-400 font-mono">
                        <span>{m.sender === 'user' ? user.rank + ' ' + (isAnonymized ? user.anonymizedId : user.name) : 'Rakshak AI'}</span>
                        <span>•</span>
                        <span>{m.time}</span>
                        {m.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-olive-800 text-accent-gold text-[9px]">
                            {m.badge}
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-[94%] text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-accent-gold/20 text-slate-100 border border-accent-gold/40 rounded-tr-none'
                            : 'bg-olive-900/90 text-slate-200 border border-olive-700/60 rounded-tl-none'
                        }`}
                      >
                        {m.sender === 'ai' ? formatMarkdown(m.text) : m.text}
                      </div>

                      {/* Suggested Prompts / Actions */}
                      {m.recommendations && m.recommendations.length > 0 && (
                        <div className="mt-2 space-y-1 w-full max-w-[94%]">
                          <div className="text-[10px] font-mono text-accent-gold uppercase tracking-wider">

                            Suggested Inquiries:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {m.recommendations.map((rec, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(rec)}
                                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-olive-900 hover:bg-olive-800 text-olive-200 border border-olive-700/60 hover:border-accent-gold transition-colors"
                              >
                                ↳ {rec}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-olive-400 text-xs font-mono py-1">
                      <BrandLogo size="xs" pulse />
                      <span>Rakshak AI is formulating clinical guidance...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-olive-800/80 bg-olive-950">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Ask about shift balancing, decompression, telemetry..."
                      className="flex-1 bg-olive-900/90 border border-olive-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-olive-400 focus:outline-none focus:border-accent-gold"
                    />
                    <button
                      type="submit"
                      disabled={!inputVal.trim() || isTyping}
                      className="p-2 rounded-xl bg-accent-gold hover:bg-amber-400 text-navy-950 font-bold disabled:opacity-40 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View 2: ML Stress Simulator Mode */}
            {activeMode === 'simulator' && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
                <div className="p-3 rounded-2xl bg-olive-900/60 border border-olive-700/60 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Predictive Burnout Risk Engine</span>
                    <span className="font-mono text-accent-gold">{simResult.score}/100</span>
                  </div>
                  <p className="text-[11px] text-olive-300">
                    Adjust operational variables below to observe simulated 7-day fatigue trajectory.
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-200 text-xs">
                      <span>Weekly Active Shift Hours:</span>
                      <span className="font-mono text-accent-gold font-bold">{simShiftHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={72}
                      value={simShiftHours}
                      onChange={(e) => setSimShiftHours(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-200 text-xs">
                      <span>Night Sleep Deficit:</span>
                      <span className="font-mono text-accent-gold font-bold">{simSleepDeficit} hrs/night</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      step={0.5}
                      value={simSleepDeficit}
                      onChange={(e) => setSimSleepDeficit(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-200 text-xs">
                      <span>Consecutive Active Patrol Days:</span>
                      <span className="font-mono text-accent-gold font-bold">{simConsecutiveDays} days</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={14}
                      value={simConsecutiveDays}
                      onChange={(e) => setSimConsecutiveDays(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-olive-900/80 border border-olive-700">
                    <span className="text-slate-200">High Altitude / Hypoxia Environment</span>
                    <button
                      onClick={() => setSimAltitude(!simAltitude)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        simAltitude
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-olive-800 text-olive-300 border border-olive-700'
                      }`}
                    >
                      {simAltitude ? 'Enabled (+12 Pts)' : 'Standard Sea Level'}
                    </button>
                  </div>
                </div>

                {/* Prediction Output Card */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    simResult.score >= 70
                      ? 'bg-rose-950/40 border-rose-500/50'
                      : simResult.score >= 45
                      ? 'bg-amber-950/40 border-amber-500/50'
                      : 'bg-emerald-950/40 border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono uppercase text-[11px]">
                      Simulated Forecast Result
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-950 text-white">
                      {simResult.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-navy-950/70 p-2 rounded-xl border border-olive-800">
                      <div className="text-olive-400 text-[10px]">Autonomic HRV Drop</div>
                      <div className="text-rose-400 font-bold">-{simResult.hrvDrop}%</div>
                    </div>
                    <div className="bg-navy-950/70 p-2 rounded-xl border border-olive-800">
                      <div className="text-olive-400 text-[10px]">7-Day Burnout Risk</div>
                      <div className="text-accent-gold font-bold">{simResult.score}%</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 pt-1">
                    <strong>Recommended Action:</strong>{' '}
                    {simResult.score >= 70
                      ? 'Mandatory 48-hour base camp rest rotation with SpO2 oxygen therapy.'
                      : simResult.score >= 45
                      ? 'Rebalance night sentry shifts with Reserve detachment; encourage 2-day wellness recharge.'
                      : 'Healthy operational baseline. Maintain standard hydration and circadian sleep.'}
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Tactical Box Breathing Mode */}
            {activeMode === 'breathing' && (
              <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">4-4-4-4 Tactical Box Breathing</div>
                  <p className="text-[11px] text-olive-300 max-w-xs">
                    Military standard autonomic regulator designed to rapidly lower resting heart rate and restore cognitive focus.
                  </p>
                </div>

                {/* Animated Breathing Circle */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isBreathingActive
                        ? breathingPhase === 'Inhale'
                          ? [1, 1.3]
                          : breathingPhase === 'Hold'
                          ? 1.3
                          : breathingPhase === 'Exhale'
                          ? [1.3, 1]
                          : 1
                        : 1,
                    }}
                    transition={{
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-colors shadow-2xl ${
                      breathingPhase === 'Inhale'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 glow-emerald'
                        : breathingPhase === 'Hold'
                        ? 'border-accent-gold bg-accent-gold/20 text-amber-300 glow-gold'
                        : breathingPhase === 'Exhale'
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                        : 'border-olive-400 bg-olive-500/20 text-olive-300 glow-olive'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      {isBreathingActive ? breathingPhase : 'Ready'}
                    </span>
                    <span className="text-3xl font-black font-mono">
                      {isBreathingActive ? `${breathingSeconds}s` : '4s'}
                    </span>
                  </motion.div>
                </div>

                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                    isBreathingActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                      : 'bg-gradient-to-r from-accent-gold to-amber-500 text-navy-950 hover:opacity-95'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  <span>{isBreathingActive ? 'Pause Session' : 'Start 2-Minute Breathing Pacer'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
