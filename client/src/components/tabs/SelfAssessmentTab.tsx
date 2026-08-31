import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { featuresFromAssessment, predictXGBoost } from '../../lib/xgboostEngine';
import { TabPageHeader } from '../common/TabPageHeader';
import { BrandLogo } from '../common/BrandLogo';
import { BrandedLoader } from '../common/BrandedLoader';
import confetti from 'canvas-confetti';
import {
  HeartPulse,
  Activity,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  RefreshCw,
  Bot,
  ClipboardList,
  Moon,
  Brain,
  Shield,
  Watch,
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  module: 'full' | 'mood' | 'burnout' | 'sleep' | 'cognitive';
  options: { label: string; value: number }[];
}

const LIKERT = [
  { label: 'Not at all / Rarely', value: 0 },
  { label: 'Several days this fortnight', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every duty rotation', value: 3 },
];

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    module: 'sleep',
    category: 'Circadian & Sleep Architecture',
    text: 'How often have sleep disruptions, night-shift fatigue, or difficulty resting after high-tempo duties occurred?',
    options: LIKERT,
  },
  {
    id: 'q2',
    module: 'sleep',
    category: 'Circadian & Sleep Architecture',
    text: 'Do you take more than 30 minutes to fall asleep after returning from patrol or sentry duty?',
    options: LIKERT,
  },
  {
    id: 'q3',
    module: 'sleep',
    category: 'Circadian & Sleep Architecture',
    text: 'Do you wake unrested despite attempting 7+ hours in bed, or experience fragmented REM at altitude?',
    options: LIKERT,
  },
  {
    id: 'q4',
    module: 'burnout',
    category: 'Burnout & Emotional Energy',
    text: 'At the end of tactical deployments or patrol shifts, how drained or exhausted do you feel?',
    options: LIKERT,
  },
  {
    id: 'q5',
    module: 'burnout',
    category: 'Burnout & Emotional Energy',
    text: 'I feel emotionally used up by consecutive high-tempo assignments this month.',
    options: LIKERT,
  },
  {
    id: 'q6',
    module: 'burnout',
    category: 'Burnout & Emotional Energy',
    text: 'Working an entire rotation with field personnel feels like a heavy strain rather than a shared mission.',
    options: LIKERT,
  },
  {
    id: 'q7',
    module: 'mood',
    category: 'Mood & Mental Vitality (PHQ-aligned)',
    text: 'Little interest or pleasure in unit activities, recreation, or time with peers.',
    options: LIKERT,
  },
  {
    id: 'q8',
    module: 'mood',
    category: 'Mood & Mental Vitality (PHQ-aligned)',
    text: 'Feeling down, hopeless, or overwhelmed by duty load.',
    options: LIKERT,
  },
  {
    id: 'q9',
    module: 'mood',
    category: 'Mood & Mental Vitality (PHQ-aligned)',
    text: 'Feeling tired, sluggish, or depleted in physical stamina even after rest windows.',
    options: LIKERT,
  },
  {
    id: 'q10',
    module: 'mood',
    category: 'Mood & Mental Vitality (PHQ-aligned)',
    text: 'Poor appetite, skipped meals on duty, or eating far more than usual under strain.',
    options: LIKERT,
  },
  {
    id: 'q11',
    module: 'cognitive',
    category: 'Cognitive Stamina & Focus',
    text: 'Difficulty maintaining sharp cognitive focus during mission-critical tasks or shift handovers.',
    options: LIKERT,
  },
  {
    id: 'q12',
    module: 'cognitive',
    category: 'Cognitive Stamina & Focus',
    text: 'Slower reaction time or missed radio acknowledgements during night hours.',
    options: LIKERT,
  },
  {
    id: 'q13',
    module: 'cognitive',
    category: 'Cognitive Stamina & Focus',
    text: 'Trouble concentrating on briefings, maps, or written orders after consecutive night duties.',
    options: LIKERT,
  },
  {
    id: 'q14',
    module: 'full',
    category: 'Psychological Safety',
    text: 'How comfortable are you seeking peer support or speaking with the Unit Welfare Officer without concern over duty assignment?',
    options: [
      { label: 'Extremely comfortable (strong trust)', value: 0 },
      { label: 'Moderately comfortable', value: 1 },
      { label: 'Slightly hesitant', value: 2 },
      { label: 'Uncomfortable — prefer complete anonymity', value: 3 },
    ],
  },
  {
    id: 'q15',
    module: 'full',
    category: 'Psychological Safety',
    text: 'I worry that a wellness check-in could be used for appraisal or disciplinary purposes.',
    options: LIKERT,
  },
  {
    id: 'q16',
    module: 'full',
    category: 'Operational Tempo',
    text: 'How unmanageable did this week’s workload, overtime, or consecutive patrol days feel?',
    options: [
      { label: 'Optimal / energizing', value: 0 },
      { label: 'Manageable with focus', value: 1 },
      { label: 'Intense / stressful', value: 2 },
      { label: 'Overwhelming / critical', value: 3 },
    ],
  },
  {
    id: 'q17',
    module: 'full',
    category: 'Operational Tempo',
    text: 'Did you have adequate support from your section commander and peers during this rotation?',
    options: [
      { label: 'Excellent support', value: 0 },
      { label: 'Good support', value: 1 },
      { label: 'Minimal support', value: 2 },
      { label: 'Isolated / no support', value: 3 },
    ],
  },
  {
    id: 'q18',
    module: 'full',
    category: 'Physiological Strain',
    text: 'Headache, breathlessness, or hypoxia-like symptoms during high-altitude or desert sentry duty.',
    options: LIKERT,
  },
  {
    id: 'q19',
    module: 'full',
    category: 'Physiological Strain',
    text: 'Irritability, startle response, or difficulty winding down after an incident or long patrol.',
    options: LIKERT,
  },
  {
    id: 'q20',
    module: 'full',
    category: 'Recovery Behaviors',
    text: 'Skipped hydration, meals, or the 4-4-4-4 breathing reset because the tempo left no window.',
    options: LIKERT,
  },
  {
    id: 'q21',
    module: 'full',
    category: 'Family & Rear Support',
    text: 'Worry about family, leave delays, or inability to reconnect after deployment is affecting rest.',
    options: LIKERT,
  },
  {
    id: 'q22',
    module: 'full',
    category: 'Morale & Meaning',
    text: 'I still feel a clear sense of purpose and unit camaraderie in this posting.',
    options: [
      { label: 'Strong purpose every day', value: 0 },
      { label: 'Mostly present', value: 1 },
      { label: 'Fading under tempo', value: 2 },
      { label: 'Largely absent this rotation', value: 3 },
    ],
  },
];

type SubTab = 'full' | 'mood' | 'burnout' | 'sleep' | 'cognitive' | 'wearables';

const SUBS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: 'full', label: 'Full Check-In (22)', icon: ClipboardList },
  { id: 'mood', label: 'Mood / PHQ', icon: HeartPulse },
  { id: 'burnout', label: 'Burnout', icon: Activity },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'cognitive', label: 'Cognitive', icon: Brain },
  { id: 'wearables', label: 'Wearables', icon: Watch },
];

function questionsFor(tab: SubTab): Question[] {
  if (tab === 'full' || tab === 'wearables') return QUESTIONS;
  return QUESTIONS.filter((q) => q.module === tab);
}

export const SelfAssessmentTab: React.FC = () => {
  const { user, isAnonymized } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>('full');
  const [wearableHR, setWearableHR] = useState(68);
  const [wearableSpO2, setWearableSpO2] = useState(97);
  const [wearableHRV, setWearableHRV] = useState(64);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [xgb, setXgb] = useState<ReturnType<typeof predictXGBoost> | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const questions = useMemo(() => questionsFor(subTab), [subTab]);

  const handleSelectOption = (qid: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleSyncWearable = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setWearableHR(64 + Math.round(Math.random() * 10));
      setWearableSpO2(96 + Math.round(Math.random() * 3));
      setWearableHRV(58 + Math.round(Math.random() * 18));
      setIsSyncing(false);
    }, 900);
  };

  const switchSub = (id: SubTab) => {
    setSubTab(id);
    setCurrentStep(0);
    setIsCompleted(false);
    setAiAnalysis(null);
    setXgb(null);
  };

  const handleSubmit = async () => {
    const qset = questionsFor(subTab === 'wearables' ? 'full' : subTab);
    const feats = featuresFromAssessment({
      answers,
      questions: qset,
      wearable: { heartRate: wearableHR, spo2: wearableSpO2, hrv: wearableHRV },
      ops: { shiftHours: 48, sleepDeficit: 2, consecutiveDays: 6, altitude: true },
    });
    const local = predictXGBoost(feats);
    setXgb(local);
    setIsCompleted(true);
    confetti({
      particleCount: 70,
      spread: 68,
      origin: { y: 0.6 },
      colors: ['#eab308', '#6f8e5f', '#10b981'],
    });

    setIsAnalyzingAI(true);
    try {
      const remote = await api.predictXGBoost(feats);
      if (remote) setXgb(remote);
      const analysis = await api.assessStressAI({
        userRank: user.rank,
        force: user.force,
        unit: user.unit,
        xgboost: remote || local,
        answers,
        wearableMetrics: { heartRate: wearableHR, spo2: wearableSpO2, hrv: wearableHRV },
      });
      setAiAnalysis(analysis);
      await api.submitAssessment({
        assessmentCode: 'VEERWELL_COMPOSITE',
        answers,
        xgboostScore: (remote || local).stressScore,
      });
    } catch {
      setAiAnalysis({
        overallRisk: local.riskBand,
        keyTriggers: local.featureContributions.slice(0, 3).map((c) => c.name),
        copingPlan: [
          '4-4-4-4 tactical box breathing between handovers',
          'Protect a 7-hour circadian sleep window',
          'Request 48h base-camp rest if hypoxia markers persist',
        ],
        welfareDirective: 'Welfare Doctrine: scores are for recovery support only — never appraisal.',
      });
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setAiAnalysis(null);
    setXgb(null);
  };

  return (
    <div className="space-y-6">
      <TabPageHeader
        badge="Confidential Personnel Self-Assessment"
        title="Voluntary Wellness & Tactical Stress Check-In"
        subtitle="22-item welfare screener scored by on-device XGBoost plus Rakshak AI. Responses are cryptographically masked under the CAPF Welfare Doctrine."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-900/90 border border-olive-400/30 text-xs font-mono text-olive-200">
            <Lock className="w-3.5 h-3.5 text-accent-gold" />
            <span>{isAnonymized ? user.anonymizedId : user.serviceNumber}</span>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {SUBS.map((s) => {
          const Icon = s.icon;
          const active = subTab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => switchSub(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                active
                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                  : 'text-olive-300 hover:text-white hover:bg-olive-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-accent-gold" />
                Wearable Biometrics Feed
              </span>
              <button
                type="button"
                onClick={handleSyncWearable}
                disabled={isSyncing}
                className="p-1 rounded-lg bg-olive-900 hover:bg-olive-800 text-accent-gold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-olive-300 leading-relaxed">
              Optical PPG telemetry from tactical watch or chest strap is fused into the XGBoost feature vector.
            </p>
          </div>

          {isSyncing ? (
            <BrandedLoader compact label="Syncing BLE biometrics…" />
          ) : (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-olive-900/80 border border-olive-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-olive-400 block font-mono">Heart Rate (PPG)</span>
                  <span className="text-lg font-black text-white font-mono">{wearableHR} BPM</span>
                </div>
                <Activity className="w-5 h-5 text-accent-gold" />
              </div>
              <div className="p-3 rounded-2xl bg-olive-900/80 border border-olive-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-olive-400 block font-mono">SpO₂ Oxygen Saturation</span>
                  <span className="text-lg font-black text-white font-mono">{wearableSpO2}%</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">Live</span>
              </div>
              <div className="p-3 rounded-2xl bg-olive-900/80 border border-olive-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-olive-400 block font-mono">HRV Recovery (SDNN)</span>
                  <span className="text-lg font-black text-white font-mono">{wearableHRV} ms</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">Balanced</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-olive-950/80 border border-olive-500/20 text-[11px] text-olive-300 font-mono flex gap-2">
            <Shield className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
            <span>Biometric sync updates battalion health indices only — never individual appraisal files.</span>
          </div>
        </div>

        <div className="lg:col-span-8 glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 flex flex-col justify-between min-h-[480px]">
          {subTab === 'wearables' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Wearable station</h3>
              <p className="text-sm text-olive-200">
                Use Sync to refresh PPG, SpO₂ and HRV, then complete Full Check-In so XGBoost can score the fused vector.
              </p>
              <button
                type="button"
                onClick={() => switchSub('full')}
                className="px-5 py-2.5 rounded-xl bg-accent-gold text-navy-950 font-black text-xs inline-flex items-center gap-2"
              >
                Continue to 22-item check-in <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isCompleted ? (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-olive-300 font-mono mb-2">
                  <span className="text-accent-gold font-bold">{questions[currentStep]?.category}</span>
                  <span>
                    Question {currentStep + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-olive-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-gold to-emerald-400 rounded-full"
                    animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${subTab}-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                    {questions[currentStep]?.text}
                  </h3>
                  <div className="space-y-2.5">
                    {questions[currentStep]?.options.map((opt) => {
                      const isSelected = answers[questions[currentStep].id] === opt.value;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOption(questions[currentStep].id, opt.value)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-accent-gold/20 border-accent-gold text-white shadow-md shadow-amber-500/10'
                              : 'bg-olive-900/60 border-olive-700/60 text-olive-100 hover:border-olive-500 hover:bg-olive-900'
                          }`}
                        >
                          <span className="text-xs md:text-sm font-medium">{opt.label}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-accent-gold flex items-center justify-center text-navy-950 font-black text-xs">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-olive-800">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-olive-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                {currentStep < questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={answers[questions[currentStep].id] === undefined}
                    onClick={() => setCurrentStep((p) => p + 1)}
                    className="px-5 py-2.5 rounded-xl bg-accent-gold hover:bg-yellow-400 disabled:opacity-40 disabled:pointer-events-none text-navy-950 font-black text-xs flex items-center gap-1.5"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={answers[questions[currentStep].id] === undefined}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron text-navy-950 font-black text-xs flex items-center gap-2"
                  >
                    Score with XGBoost <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 my-auto">
              {isAnalyzingAI ? (
                <BrandedLoader label="XGBoost + Rakshak AI synthesizing welfare directive…" />
              ) : (
                <>
                  <div className="flex justify-center">
                    <BrandLogo size="lg" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Assessment scored</h3>
                    <p className="text-xs text-olive-300 mt-1">
                      Gradient-boosted inference fused with wearable telemetry. Protected in the battalion welfare registry.
                    </p>
                  </div>
                  {xgb && (
                    <div className="glass-card p-5 rounded-2xl border border-olive-400/30 max-w-lg mx-auto space-y-3 text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-olive-300">XGBoost composite score</span>
                        <strong className="text-xl font-mono text-accent-gold">{xgb.stressScore} / 100</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-olive-300">Resilience tier</span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                            xgb.riskBand === 'Low'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : xgb.riskBand === 'Moderate'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {xgb.riskBand} strain
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-olive-400">{xgb.model} · {xgb.latencyMs} ms</p>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-olive-800">
                        {xgb.featureContributions.map((c) => (
                          <span key={c.name} className="px-2 py-0.5 rounded-md bg-olive-900 border border-olive-700 text-olive-200 text-[11px]">
                            {c.name}: {c.impact}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiAnalysis && (
                    <div className="glass-panel p-5 rounded-2xl border border-accent-gold/40 max-w-lg mx-auto text-left space-y-3 bg-olive-950/80">
                      <span className="text-xs font-bold text-accent-gold flex items-center gap-1.5 font-mono">
                        <Bot className="w-4 h-4" />
                        Rakshak AI clinical overlay
                      </span>
                      {aiAnalysis.keyTriggers && (
                        <div className="flex flex-wrap gap-1.5">
                          {aiAnalysis.keyTriggers.map((trig: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-olive-900 border border-olive-700 text-olive-200 text-[11px]">
                              {trig}
                            </span>
                          ))}
                        </div>
                      )}
                      {aiAnalysis.copingPlan && (
                        <ul className="space-y-1 text-slate-200 text-[11px] list-disc list-inside">
                          {aiAnalysis.copingPlan.map((cp: string, i: number) => (
                            <li key={i}>{cp}</li>
                          ))}
                        </ul>
                      )}
                      {aiAnalysis.welfareDirective && (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-accent-gold/30 text-xs text-amber-200">
                          {aiAnalysis.welfareDirective}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="px-5 py-2.5 rounded-xl bg-olive-900 border border-olive-400 text-white font-bold text-xs hover:bg-olive-800"
                  >
                    Retake check-in
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
