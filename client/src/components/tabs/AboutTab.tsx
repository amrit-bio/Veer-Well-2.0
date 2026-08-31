import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Zap, Github, ExternalLink } from 'lucide-react';

export const AboutTab: React.FC = () => {
  const team = [
    {
      name: 'AI Research Lead',
      role: 'Machine Learning & Analytics',
      description: 'Expert in behavioral prediction and stress modeling'
    },
    {
      name: 'Full Stack Developer',
      role: 'Platform Architecture',
      description: 'Building scalable wellness infrastructure'
    },
    {
      name: 'Security Officer',
      role: 'Data Privacy & Compliance',
      description: 'Ensuring GDPR and security standards'
    },
    {
      name: 'UX/UI Designer',
      role: 'User Experience',
      description: 'Creating intuitive welfare interfaces'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">About Rakshak</h1>
        <p className="text-slate-600">
          AI-powered wellness platform for CAPF, CRPF, and Central Armed Forces
        </p>
      </div>

      {/* Project Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-olive-600 to-olive-700 text-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
        <p className="mb-4 text-olive-100">
          Rakshak ("Guardian" in Sanskrit) is a comprehensive AI-driven wellness platform designed specifically for armed forces personnel. It leverages machine learning, behavioral analytics, and wearable device integration to provide early stress detection and personalized support recommendations.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-bold">Created</p>
            <p className="text-olive-100">2024</p>
          </div>
          <div>
            <p className="font-bold">Focus</p>
            <p className="text-olive-100">Mental Wellness</p>
          </div>
          <div>
            <p className="font-bold">Status</p>
            <p className="text-olive-100">Hackathon Demo</p>
          </div>
        </div>
      </motion.div>

      {/* Core Technology */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-olive-700" />
          Core Technologies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-3">AI & Analytics</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✓ Gemini AI for conversational wellness support</li>
              <li>✓ ML models for stress prediction</li>
              <li>✓ Behavioral analytics engine</li>
              <li>✓ Real-time data processing</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Integration</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✓ Wearable device APIs (Fitbit, Apple Watch, etc.)</li>
              <li>✓ HRMS integration capabilities</li>
              <li>✓ Secure data pipeline</li>
              <li>✓ Real-time synchronization</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-olive-700" />
          Development Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="border border-olive-200 rounded-lg p-4 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-olive-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900">{member.name}</h3>
              <p className="text-sm font-semibold text-olive-700 mb-1">{member.role}</p>
              <p className="text-sm text-slate-600">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hackathon Context */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-olive-700" />
          Hackathon Deployment
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Current Deployment:</strong> Temporary deployment on Vercel for hackathon demonstration. This allows judges and stakeholders to experience the complete platform in action with sample data and realistic scenarios.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
              <p className="font-bold text-slate-900 mb-2">Demo Status</p>
              <p className="text-sm text-slate-700">Live with sample data and mock endpoints</p>
            </div>
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
              <p className="font-bold text-slate-900 mb-2">Data</p>
              <p className="text-sm text-slate-700">Fully anonymized demonstration dataset</p>
            </div>
            <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
              <p className="font-bold text-slate-900 mb-2">Access</p>
              <p className="text-sm text-slate-700">Public demo with role-based test accounts</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Future Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Future Development Roadmap</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Mobile Application',
              description: 'Native iOS and Android apps for personnel to access wellness features on-the-go',
              timeline: 'Q2-Q3 2025'
            },
            {
              title: 'Advanced ML Models',
              description: 'Deeper behavioral prediction using advanced neural networks and time-series analysis',
              timeline: 'Q3-Q4 2025'
            },
            {
              title: 'Wearable Integration',
              description: 'Real-time integration with multiple wearable platforms and IoT devices',
              timeline: 'Q1 2026'
            },
            {
              title: 'Multilingual Support',
              description: 'Support for regional Indian languages and international languages',
              timeline: 'Q2 2026'
            },
            {
              title: 'Community Features',
              description: 'Peer support groups, wellness forums, and community-driven wellness initiatives',
              timeline: 'Q3 2026'
            },
            {
              title: 'Extended Deployment',
              description: 'Expansion to civilian government agencies and corporate wellness',
              timeline: 'Beyond 2026'
            },
          ].map((item, idx) => (
            <div key={idx} className="border-l-4 border-olive-300 pl-4 pb-4">
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-600 mb-2">{item.description}</p>
              <span className="text-xs font-mono bg-olive-100 text-olive-700 px-2 py-1 rounded">
                {item.timeline}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Links & Resources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 flex-wrap"
      >
        <a
          href="#"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Github className="w-4 h-4" />
          View Code
        </a>
        <a
          href="#"
          className="flex items-center gap-2 bg-olive-600 hover:bg-olive-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Documentation
        </a>
      </motion.div>
    </div>
  );
};
