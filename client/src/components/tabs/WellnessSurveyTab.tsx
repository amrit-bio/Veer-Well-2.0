import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WellnessSurvey } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquareHeart,
  PlusCircle,
  BarChart3,
  Sparkles,
  Users,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Tag,
  Quote,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const WellnessSurveyTab: React.FC = () => {
  const { role, isAnonymized } = useAuth();
  const [surveys, setSurveys] = useState<WellnessSurvey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<WellnessSurvey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Survey Form State
  const [title, setTitle] = useState<string>('Q4 Workplace Stress & Ergonomics Pulse');
  const [description, setDescription] = useState<string>('Evaluating duty shift fatigue, leadership support, and peer safety culture.');
  const [category, setCategory] = useState<string>('Workplace Culture');
  const [targetDepartment, setTargetDepartment] = useState<string>('All Departments');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.getSurveys();
      setSurveys(res.surveys);
      if (res.surveys.length > 0) {
        setSelectedSurvey(res.surveys[0]);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createSurvey({
        title,
        description,
        category,
        targetDepartment,
      });
      setShowCreateModal(false);
      loadSurveys();
    } catch (err) {
      console.error('Create survey error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = selectedSurvey || surveys[0];

  const radarData = current
    ? [
        { dimension: 'Work-Life Balance', score: current.dimensions.workLifeBalance },
        { dimension: 'Psychological Safety', score: current.dimensions.psychologicalSafety },
        { dimension: 'Physical Env', score: current.dimensions.physicalEnvironment },
        { dimension: 'Peer Support', score: current.dimensions.peerSupport },
        { dimension: 'Leadership Empathy', score: current.dimensions.leadershipEmpathy },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Workforce Sentiment Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Wellness Surveys & Cultural Sentiment Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Aggregate multi-dimensional workforce feedback, psychological safety indices, and sentiment topic clusters.
          </p>
        </div>

        {(role === 'hr_admin' || role === 'wellness_mgr') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch New Survey</span>
          </button>
        )}
      </div>

      {/* Surveys Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.map((srv) => {
          const isSelected = current?.id === srv.id;
          return (
            <motion.div
              key={srv.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedSurvey(srv)}
              className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-500/50 bg-slate-900/90 glow-emerald'
                  : 'border-white/10 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-cyan-500/20">
                  {srv.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    srv.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {srv.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">{srv.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{srv.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-mono">
                    {srv.responsesCount} / {srv.totalTarget} Responses
                  </span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">
                  {srv.participationRate}% Participation
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deep Analytics for Selected Survey */}
      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 5-Dimension Radar Chart (6 Cols) */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                5-Dimension Wellness Radar
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Overall: {current.overallScore}/100
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Smile className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-emerald-400 font-bold">{current.sentiment.positive}%</span>
                <span className="text-[10px] text-slate-400 block">Positive</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Meh className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-amber-400 font-bold">{current.sentiment.neutral}%</span>
                <span className="text-[10px] text-slate-400 block">Neutral</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Frown className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                <span className="text-rose-400 font-bold">{current.sentiment.concerning}%</span>
                <span className="text-[10px] text-slate-400 block">At Risk</span>
              </div>
            </div>
          </div>

          {/* Sentiment Word Cloud & Feedback Clusters (6 Cols) */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Sentiment Topic Clusters & Word Cloud
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Natural Language sentiment classification of anonymous staff commentary.
              </p>
            </div>

            {/* Dynamic Word Cloud Tags */}
            <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 items-center justify-center">
              {current.wordCloud.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all hover:scale-105 cursor-pointer ${
                    item.sentiment === 'pos'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.sentiment === 'neg'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                  style={{
                    fontSize: `${Math.max(11, Math.min(18, item.value / 2.2))}px`,
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>

            {/* Recent Anonymized Qualitative Feedback */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Highlighted Anonymized Feedback
              </span>
              {current.recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-semibold">
                      {isAnonymized ? fb.anonymizedId : fb.anonymizedId}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        fb.sentiment === 'Positive'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {fb.sentiment}
                    </span>
                  </div>
                  <p className="text-slate-300 italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Launch Survey Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                Launch Targeted Wellness Survey
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Deploy an automated, anonymized pulse campaign across operational units.
              </p>

              <form onSubmit={handleCreateSurvey} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Workplace Culture">Workplace Culture</option>
                    <option value="Physical Well-being">Physical Well-being</option>
                    <option value="Leadership & Support">Leadership & Support</option>
                    <option value="Shift Rotation Fatigue">Shift Rotation Fatigue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Target Cohort
                  </label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Operations">Operations</option>
                    <option value="Healthcare & Field">Healthcare & Field</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Campaign Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-navy-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all mt-2"
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy Pulse Campaign'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
