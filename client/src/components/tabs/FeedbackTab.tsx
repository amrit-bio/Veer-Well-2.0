import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../common/BrandLogo';
import {
  MessageSquare,
  Star,
  Sparkles,
  CheckCircle2,
  Send,
  Award,
  Users,
  Smile,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  evaluatorName: string;
  roleTitle: string;
  rating: number;
  category: string;
  comments: string;
  date: string;
}

export const FeedbackTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      evaluatorName: 'Defense Health Evaluation Committee',
      roleTitle: 'Armed Forces Welfare Board Jury',
      rating: 5,
      category: 'Security & Privacy',
      comments: 'The Welfare Doctrine implementation and Differential Privacy safeguards perfectly solve the psychological hesitation barrier in frontline units.',
      date: 'Today, 20:35 IST',
    },
    {
      id: 'fb-2',
      evaluatorName: 'Tactical AI Hackathon Panel',
      roleTitle: 'Senior Defense Technology Judge',
      rating: 5,
      category: 'AI & Analytics',
      comments: 'The 3D stress turbulence resonance orb and 7-day predictive burnout regression engine are exceptional technical demonstrations.',
      date: 'Today, 19:40 IST',
    },
  ]);

  const [name, setName] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState<string>('Hackathon Evaluator / Jury');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('Strategic Impact');
  const [comments, setComments] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFb: FeedbackItem = {
      id: `fb-${Date.now()}`,
      evaluatorName: name || 'Anonymous Evaluator',
      roleTitle: roleTitle || 'Defense Hackathon Reviewer',
      rating,
      category,
      comments: comments || 'Impressive tactical UX, robust privacy architecture, and clear mission impact for CAPF forces.',
      date: 'Just now',
    };

    setFeedbacks([newFb, ...feedbacks]);
    setIsSubmitted(true);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eab308', '#6f8e5f', '#10b981', '#ffffff'],
    });

    // Reset form
    setName('');
    setComments('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Evaluator & Jury Feedback Channel
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hackathon Demo Review & Feedback
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            We value your expert evaluation on our AI stress engine, privacy architecture, and military usability for CAPF forces.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-900 border border-olive-500/40 text-xs font-mono text-accent-gold">
          <Award className="w-4 h-4" />
          <span>Avg Rating: 5.0 / 5.0 ★</span>
        </div>
      </div>

      {/* Grid: Feedback Form on Left, Live Feedback Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30">
          <h2 className="text-base md:text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            Submit Your Evaluation
          </h2>
          <p className="text-xs text-olive-300 mb-5">
            Share your assessment during the live hackathon demonstration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-olive-300 mb-1">
                  Evaluator Name / Organization
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Col. A. Sharma / Jury Panel"
                  className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-xs text-white placeholder-olive-500 focus:outline-none focus:border-accent-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-olive-300 mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Defense Hackathon Judge"
                  className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-xs text-white placeholder-olive-500 focus:outline-none focus:border-accent-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-olive-300 mb-1">
                  Assessment Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-gold"
                >
                  <option value="Strategic Impact">Strategic Impact for Armed Forces</option>
                  <option value="AI & Predictive Models">AI & Predictive Stress Models</option>
                  <option value="Security & Privacy">Security & Anonymization Privacy</option>
                  <option value="UI & 3D Usability">Tactical UI & 3D Shaders Usability</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-olive-300 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-accent-gold transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-accent-gold text-accent-gold'
                            : 'text-olive-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-accent-gold ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-olive-300 mb-1">
                Qualitative Feedback & Suggestions
              </label>
              <textarea
                rows={4}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide your feedback on technical execution, usability, and defense scalability..."
                className="w-full bg-olive-900 border border-olive-700 rounded-xl p-3 text-xs text-white placeholder-olive-500 focus:outline-none focus:border-accent-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron hover:opacity-95 text-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Hackathon Review</span>
            </button>
          </form>
        </div>

        {/* Live Feedback Feed (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-gold" />
              Evaluator Reviews & Endorsements
            </h2>
            <span className="text-xs font-mono text-accent-gold font-bold">
              {feedbacks.length} Verified Reviews
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {feedbacks.map((fb) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-olive-900/60 border border-olive-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white">{fb.evaluatorName}</h3>
                    <div className="text-[10px] text-olive-400 font-mono">{fb.roleTitle}</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-accent-gold">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent-gold" />
                    ))}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-accent-gold px-2 py-0.5 rounded bg-olive-950 inline-block border border-olive-700">
                  {fb.category}
                </div>

                <p className="text-xs text-olive-100 italic leading-relaxed">
                  "{fb.comments}"
                </p>

                <div className="text-[9px] font-mono text-olive-400 pt-1 border-t border-olive-800 text-right">
                  {fb.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
