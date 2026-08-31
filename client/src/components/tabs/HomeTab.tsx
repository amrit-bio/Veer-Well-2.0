import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, TrendingUp } from 'lucide-react';

interface HomeTabProps {
  onNavigate?: (tab: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Driven Stress Monitoring',
      description: 'Real-time stress detection using Rakshak AI wellness assistant'
    },
    {
      icon: Shield,
      title: 'Privacy Safeguards',
      description: 'Data anonymization and role-based access control'
    },
    {
      icon: TrendingUp,
      title: 'Wearable Integration',
      description: 'Connect heart rate, SpO₂, and biometric devices'
    },
    {
      icon: Users,
      title: 'Welfare-Focused',
      description: 'For CAPF, CRPF and Central Armed Forces personnel'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-olive-600 to-olive-700 p-8 text-white shadow-lg"
      >
        <h1 className="text-4xl font-bold mb-4">Rakshak - AI Wellness Platform</h1>
        <p className="text-lg mb-6 text-olive-100">
          Comprehensive stress monitoring and wellness support for CAPF, CRPF, and Central Armed Forces
        </p>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="bg-white text-olive-700 px-6 py-3 rounded-lg font-semibold hover:bg-olive-50 transition-colors flex items-center gap-2"
          >
            Try Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate?.('assessments')}
            className="bg-olive-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-800 transition-colors flex items-center gap-2"
          >
            Start Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <Icon className="w-8 h-8 text-olive-700 mb-4" />
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Problem Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-olive-50 border border-olive-200 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">Problem Statement</h3>
        <p className="text-slate-700">
          Armed forces personnel face significant stress from operational demands, irregular schedules, family separation, and trauma exposure. Current welfare monitoring systems lack real-time insights, leading to missed early intervention opportunities.
        </p>
      </motion.div>

      {/* Solution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white border-l-4 border-olive-600 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">Our Solution</h3>
        <p className="text-slate-700">
          Rakshak integrates AI-powered stress monitoring, behavioral analytics, and wearable device data to provide welfare officers with actionable insights. Privacy-first design ensures personnel data is used solely for wellness support, never disciplinary action.
        </p>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Dashboard', tab: 'dashboard' },
          { label: 'Self-Assessment', tab: 'assessments' },
          { label: 'Analytics', tab: 'predictive' },
          { label: 'About', tab: 'about' },
        ].map((link) => (
          <button
            key={link.tab}
            onClick={() => onNavigate?.(link.tab)}
            className="bg-olive-100 hover:bg-olive-200 text-olive-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};
