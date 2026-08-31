import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Star, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

export const FeedbackTab: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [rating, setRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Feedback & Suggestions</h1>
        <p className="text-slate-600">
          Help us improve Rakshak with your valuable insights and suggestions
        </p>
      </div>

      {/* Feedback Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md max-w-2xl"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-olive-700" />
          Share Your Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block font-semibold text-slate-900 mb-3">Feedback Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'general', label: 'General Feedback' },
                { id: 'bug', label: 'Report Bug' },
                { id: 'feature', label: 'Feature Request' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFeedbackType(type.id as any)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    feedbackType === type.id
                      ? 'bg-olive-600 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block font-semibold text-slate-900 mb-3">Rate Your Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block font-semibold text-slate-900 mb-3">Your Message</label>
            <textarea
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent outline-none resize-none"
              rows={6}
              placeholder="Please share your thoughts, suggestions, or report any issues..."
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block font-semibold text-slate-900 mb-3">Email (Optional)</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent outline-none"
              placeholder="your.email@forces.gov.in"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-olive-600 hover:bg-olive-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Submit Feedback
          </button>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700"
            >
              ✓ Thank you! Your feedback has been recorded and will help us improve Rakshak.
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Common Questions & Quick Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Feedback</h2>
        <p className="text-slate-600 mb-4">Was this experience helpful?</p>
        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-4 rounded-lg transition-colors">
            <ThumbsUp className="w-5 h-5" />
            Yes, Very Helpful
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-lg transition-colors">
            <ThumbsDown className="w-5 h-5" />
            Could Be Better
          </button>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How is my data protected?',
              a: 'All personnel data is encrypted, anonymized, and stored securely. We comply with GDPR and national cybersecurity guidelines.',
            },
            {
              q: 'Can I delete my data?',
              a: 'Yes, you can request data deletion at any time. Contact your welfare officer or the data privacy team.',
            },
            {
              q: 'Who has access to my wellness information?',
              a: 'Only authorized welfare officers can access your anonymized wellness data. It is never shared for disciplinary purposes.',
            },
            {
              q: 'How often is data synced from wearables?',
              a: 'Wearable data is synced in real-time when connected. You can control frequency and data sharing settings.',
            },
            {
              q: 'Is the AI assistant confidential?',
              a: 'Yes, all conversations with Rakshak AI are confidential and used only to provide personalized wellness support.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="border-b border-slate-200 pb-4 last:border-b-0"
            >
              <details className="group cursor-pointer">
                <summary className="font-semibold text-slate-900 group-open:text-olive-700 transition-colors flex items-center gap-2">
                  <span className="text-lg">›</span>
                  {item.q}
                </summary>
                <p className="text-slate-600 mt-2 ml-6">{item.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support Resources */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-olive-50 border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Contact Welfare Officer',
              description: 'Reach out to your unit welfare officer for immediate support',
            },
            {
              title: 'Documentation',
              description: 'Browse complete user guides and platform documentation',
            },
            {
              title: 'Email Support',
              description: 'Send detailed questions to support@rakshak-wellness.gov.in',
            },
          ].map((option, idx) => (
            <button
              key={idx}
              className="text-left p-4 bg-white border border-olive-300 rounded-lg hover:shadow-lg transition-all"
            >
              <h3 className="font-bold text-slate-900 mb-2">{option.title}</h3>
              <p className="text-sm text-slate-600">{option.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
