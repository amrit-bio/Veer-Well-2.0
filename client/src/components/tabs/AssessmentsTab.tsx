import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssessmentDefinition, UserAssessmentResult } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export const AssessmentsTab: React.FC = () => {
  const { user, isAnonymized } = useAuth();
  const [definitions, setDefinitions] = useState<AssessmentDefinition[]>([]);
  const [history, setHistory] = useState<UserAssessmentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Taking Assessment State
  const [activeModal, setActiveModal] = useState<AssessmentDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedResult, setCompletedResult] = useState<UserAssessmentResult | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [defsRes, histRes] = await Promise.all([
        api.getAssessmentDefinitions(),
        api.getAssessmentHistory(user?.role === 'employee' ? user?.id : undefined),
      ]);
      setDefinitions(defsRes.definitions);
      setHistory(histRes.assessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (def: AssessmentDefinition) => {
    setActiveModal(def);
    setCurrentStep(0);
    setAnswers({});
    setCompletedResult(null);
  };

  const handleSelectOption = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextStep = () => {
    if (activeModal && currentStep < activeModal.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!activeModal || !user) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitAssessment({
        assessmentCode: activeModal.code,
        employeeId: user.id,
        answers,
      });
      setCompletedResult(res.result);
      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#fbbf24'],
      });
      // Refresh history list
      loadData();
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare trend data
  const trendData = history
    .filter((h) => h.assessmentCode === 'PHQ9' || h.assessmentCode === 'BURNOUT_MBI')
    .map((h, i) => ({
      date: h.date,
      Score: h.score,
      max: h.maxScore,
      title: h.assessmentTitle.split(' ')[0],
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Psychological & Workplace Diagnostic Suite
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Wellness Check-Ins & Diagnostic Assessments
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Clinically-validated mood, burnout, sleep hygiene, and operational pulse screeners with automated resilience scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleStartAssessment(definitions[0])}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Take Quick Check-In</span>
          </button>
        </div>
      </div>

      {/* Grid: Assessment Catalog on Left, Historical Trend on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Catalog Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Standard Diagnostic Catalog
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {definitions.length} Standard Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {definitions.map((def) => (
              <motion.div
                key={def.id}
                whileHover={{ y: -3 }}
                className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800 text-emerald-400 border border-emerald-500/20">
                      {def.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {def.estMinutes} mins
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {def.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {def.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {def.questions.length} Questions
                  </span>
                  <button
                    onClick={() => handleStartAssessment(def)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all group-hover:bg-emerald-500 group-hover:text-navy-950"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Historical Assessment Trends Line Chart (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Assessment Score Progression</h2>
              <span className="text-xs font-mono text-slate-400">Score vs Baseline</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Historical timeline of psychological strain index (Lower is healthier).
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.length > 0 ? trendData : [{ date: '08-10', Score: 6 }, { date: '08-18', Score: 12 }, { date: '08-26', Score: 8 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 30]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={18} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Strain Threshold', fill: '#f43f5e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="Score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Health Band:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Optimal Resilience (Low Risk)
            </span>
          </div>
        </div>
      </div>

      {/* Completed / Scheduled Assessment Records Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Completed Assessment Logs</h2>
          <span className="text-xs font-mono text-slate-400">
            {history.length} Evaluated Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Assessment Protocol</th>
                <th className="pb-3">Subject ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Score / Max</th>
                <th className="pb-3">Risk Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Clinical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">
                    {record.assessmentTitle}
                  </td>
                  <td className="py-3 font-mono text-emerald-400">
                    {isAnonymized ? record.anonymizedId : record.employeeId}
                  </td>
                  <td className="py-3 font-mono text-slate-400">{record.date}</td>
                  <td className="py-3 font-mono font-bold text-slate-200">
                    {record.score} / {record.maxScore}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.riskLevel === 'Low'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : record.riskLevel === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {record.riskLevel} Risk
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">
                    {record.recommendations?.[0] || 'Standard monitoring'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step Animated Assessment Taking Modal (Framer Motion Step Transitions) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/30 glow-emerald shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>

              {!completedResult ? (
                <div>
                  {/* Step Progress Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="text-emerald-400 font-bold">
                        {activeModal.title}
                      </span>
                      <span>
                        Question {currentStep + 1} of {activeModal.questions.length}
                      </span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        animate={{
                          width: `${((currentStep + 1) / activeModal.questions.length) * 100}%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Animated Question Step */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -25 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5"
                    >
                      <h3 className="text-lg font-bold text-white leading-relaxed">
                        {activeModal.questions[currentStep].text}
                      </h3>

                      {/* Options List */}
                      <div className="space-y-2.5">
                        {activeModal.questions[currentStep].options.map((opt) => {
                          const isSelected =
                            answers[activeModal.questions[currentStep].id] === opt.value;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() =>
                                handleSelectOption(
                                  activeModal.questions[currentStep].id,
                                  opt.value
                                )
                              }
                              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="text-xs font-medium">{opt.label}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-navy-950 font-bold text-xs">
                                  ✓
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={currentStep === 0}
                      onClick={handlePrevStep}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    {currentStep < activeModal.questions.length - 1 ? (
                      <button
                        type="button"
                        disabled={answers[activeModal.questions[currentStep].id] === undefined}
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          answers[activeModal.questions[currentStep].id] === undefined ||
                          isSubmitting
                        }
                        onClick={handleSubmitAssessment}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:opacity-95 text-navy-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                      >
                        {isSubmitting ? 'Computing Score...' : 'Submit Assessment'}
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Completed Result Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Assessment Submitted Successfully!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your response has been computed and securely anonymized in the clinical registry.
                    </p>
                  </div>

                  {/* Score & Risk Badge */}
                  <div className="glass-card p-5 rounded-2xl border border-white/10 max-w-md mx-auto space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Calculated Score:</span>
                      <strong className="text-lg font-mono text-emerald-400">
                        {completedResult.score} / {completedResult.maxScore}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Risk Assessment:</span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                          completedResult.riskLevel === 'Low'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : completedResult.riskLevel === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {completedResult.riskLevel} Risk Profile
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 text-left pt-2 border-t border-slate-800">
                      {completedResult.summary}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="text-left max-w-md mx-auto space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Recommended Interventions:
                    </span>
                    {completedResult.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all mt-4"
                  >
                    Done & Return to Assessments
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
