import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Heart, Clock, Shield } from 'lucide-react';

export const ImpactTab: React.FC = () => {
  const benefits = [
    {
      icon: Heart,
      title: 'Early Stress Detection',
      description: 'Identify personnel at risk before crisis situations develop',
      metric: '87% Early Detection Rate',
      color: 'from-red-50 to-red-100',
    },
    {
      icon: TrendingUp,
      title: 'Improved Resilience',
      description: 'Proactive interventions strengthen mental and physical resilience',
      metric: '42% Resilience Improvement',
      color: 'from-green-50 to-green-100',
    },
    {
      icon: Users,
      title: 'Better Readiness',
      description: 'Healthier personnel = improved operational effectiveness',
      metric: '35% Readiness Enhancement',
      color: 'from-blue-50 to-blue-100',
    },
    {
      icon: Clock,
      title: 'Reduced Absenteeism',
      description: 'Preventive support reduces stress-related leave requests',
      metric: '28% Absenteeism Reduction',
      color: 'from-purple-50 to-purple-100',
    },
    {
      icon: Shield,
      title: 'Enhanced Safety',
      description: 'Well-supported personnel make better decisions in field',
      metric: '45% Incident Reduction',
      color: 'from-yellow-50 to-yellow-100',
    },
    {
      icon: BarChart3,
      title: 'Cost Savings',
      description: 'Preventive care is more cost-effective than crisis management',
      metric: '₹5.2 Crore Annual Savings',
      color: 'from-indigo-50 to-indigo-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Impact & Benefits</h1>
        <p className="text-slate-600">
          Strategic advantages for CAPF, CRPF, and Central Armed Forces
        </p>
      </div>

      {/* Main Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gradient-to-br ${benefit.color} border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all`}
            >
              <Icon className="w-8 h-8 text-slate-900 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-700 mb-4">{benefit.description}</p>
              <div className="text-lg font-bold text-slate-900">{benefit.metric}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Strategic Impact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-olive-600 to-olive-700 text-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Strategic Importance</h2>
        <ul className="space-y-3">
          {[
            'Addresses critical mental health gap in armed forces',
            'Ensures compliance with international mental health standards',
            'Enhances recruitment and retention of quality personnel',
            'Demonstrates commitment to personnel welfare',
            'Positions organization as welfare-forward institution',
            'Supports Force Multiplier effect through healthier teams',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-olive-200 font-bold">✓</span>
              <span className="text-olive-100">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Personnel Supported', value: '2,500+' },
          { label: 'Intervention Success', value: '72%' },
          { label: 'Data Points Analyzed', value: '50K+' },
          { label: 'Response Time', value: '< 2 min' },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className="bg-white border border-olive-200 rounded-lg p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-sm text-slate-600 mb-2">{metric.label}</p>
            <p className="text-2xl font-bold text-olive-700">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Implementation Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Implementation Roadmap</h2>
        <div className="space-y-6">
          {[
            {
              phase: 'Phase 1: Pilot',
              timeline: 'Months 1-3',
              activities: [
                'Deploy to single unit (500 personnel)',
                'Gather feedback and refine algorithms',
                'Train welfare officers',
              ],
            },
            {
              phase: 'Phase 2: Expansion',
              timeline: 'Months 4-6',
              activities: [
                'Scale to 5 units (2,500 personnel)',
                'Integrate with existing HRMS',
                'Add mobile app support',
              ],
            },
            {
              phase: 'Phase 3: Full Deployment',
              timeline: 'Months 7-12',
              activities: [
                'Complete organization-wide rollout',
                'Advanced ML model training',
                'Enterprise integration',
              ],
            },
            {
              phase: 'Phase 4: Enhancement',
              timeline: 'Beyond Year 1',
              activities: [
                'Deeper behavioral analytics',
                'Predictive deployment planning',
                'Wellness ecosystem expansion',
              ],
            },
          ].map((item, idx) => (
            <div key={idx} className="border-l-4 border-olive-600 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-olive-600 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-slate-900">{item.phase}</h3>
                <span className="text-sm text-olive-700 font-semibold">{item.timeline}</span>
              </div>
              <ul className="space-y-1">
                {item.activities.map((activity, aidx) => (
                  <li key={aidx} className="text-slate-700">• {activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ROI Projection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <p className="text-sm text-green-700">
          <strong>Expected ROI:</strong> Based on pilot data, Rakshak is projected to deliver a 3.5x return on investment within the first year through reduced attrition, fewer stress-related incidents, and improved operational effectiveness.
        </p>
      </motion.div>
    </div>
  );
};
