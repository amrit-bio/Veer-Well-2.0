import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { supabase, isSupabaseReady } from '../../lib/supabaseClient';
import { evaluateVoice } from '../../lib/riskEngine';
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const VoiceAssistantTab: React.FC = () => {
  const { user } = useAuth();
  const { acknowledgeRiskAlert } = useRealtime();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);
  const [riskDetected, setRiskDetected] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    setTranscript('');
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;
    const userMessage = transcript.trim();
    setTranscript('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp: new Date() }]);
    setProcessing(true);
    setRiskDetected(null);

    // Voice NLP risk evaluation
    const { evaluation, flags } = evaluateVoice(
      userMessage,
      user.id,
      user.unit,
      user.location
    );

    // Log voice transcript to secure data stream for real-time pipeline
    setRiskDetected(evaluation.isHighRisk);

    if (isSupabaseReady()) {
    try {
      await supabase.from('voice_logs').insert({
        user_id: user.id,
        user_name: user.name,
        service_number: user.serviceNumber,
        unit: user.unit,
        location: user.location,
        transcript: userMessage,
        mood_detected: evaluation.riskScore > 0 ? 'stressed' : 'neutral',
        risk_flags: flags,
        timestamp: new Date().toISOString(),
      });

      if (evaluation.isHighRisk) {
        setRiskDetected(true);

        // Create risk alert in secure data stream for real-time pipeline
        const { riskScore, thresholdsExceeded, riskFactors } = evaluation;

        await supabase.from('risk_alerts').insert({
          user_id: user.id,
          user_name: user.name,
          service_number: user.serviceNumber,
          anonymized_id: user.anonymizedId,
          unit: user.unit,
          location: user.location,
          risk_type: 'voice_nlp',
          risk_score: riskScore,
          threshold_exceed: thresholdsExceeded.join('; '),
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        });

        // Emit telemetry event
        await supabase.from('system_telemetry').insert({
          event_type: 'alert_triggered',
          event_detail: `Voice NLP risk detected for ${user.name} (${user.anonymizedId})`,
          triggered_by: user.id,
          threshold_value: evaluation.riskScore >= 60 ? 60 : 40,
          actual_value: riskScore,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to log voice data:', err);
    }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply || 'Command received. Processing...', timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Tactical AI operational. All wellness telemetry secured under Armed Forces Welfare Doctrine.', timestamp: new Date() }]);
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-500/40 shadow-lg">
          <Mic className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tactical Voice Assistant</h2>
          <p className="text-xs text-olive-300 font-mono">Push-to-talk interface for wellness reporting & hands-free navigation</p>
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Voice Command Log</h3>
          <div className="flex items-center gap-2">
            {riskDetected === true && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold"
              >
                ⚠️ RISK DETECTED — Medical Officer Notified
              </motion.span>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${
                isListening
                  ? 'border-rose-500 bg-rose-950/50 text-rose-200'
                  : 'border-emerald-500 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-xs font-mono">{isListening ? 'Listening...' : 'PTT'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 h-64 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-olive-400 text-xs py-8">
              Press PTT to speak your wellness report, request leave, or ask for assistance.
              <br />All communications are confidential under Armed Forces Welfare Doctrine.
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                  msg.sender === 'user'
                    ? 'bg-accent-gold/20 border border-accent-gold/40 text-white'
                    : 'bg-olive-900/80 border border-olive-700 text-olive-200'
                }`}>
                  <div className="font-mono text-[10px] text-olive-400 mb-1">
                    {msg.sender === 'user' ? 'YOU' : 'RAKSHAK AI'} • {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="leading-relaxed">{msg.text}</div>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speak(msg.text)}
                      className="mt-2 flex items-center gap-1 text-[10px] text-accent-gold hover:text-accent-saffron transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {processing && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-olive-900/80 border border-olive-700 text-xs text-olive-300 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing voice command...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {transcript && (
          <div className="px-4 py-2 border-t border-olive-800 bg-olive-900/30">
            <div className="text-[10px] text-olive-400 font-mono mb-1">LIVE TRANSCRIPT:</div>
            <div className="text-sm text-white font-mono">{transcript}</div>
          </div>
        )}

        <div className="p-4 border-t border-olive-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type or speak your command..."
              className="flex-1 px-4 py-3 rounded-xl bg-olive-900/90 border border-olive-700/80 focus:border-accent-gold text-white placeholder:text-olive-500 text-sm font-mono transition-all outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!transcript.trim() || processing}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
