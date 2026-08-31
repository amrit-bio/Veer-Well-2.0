import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, AlertCircle, Users, Zap } from 'lucide-react';
import { AlertTriangle, Heart, Clock, User } from 'lucide-react';

export const InterventionTab: React.FC = () => {
  const [selectedOfficer, setSelectedOfficer] = useState<number | null>(0);

  // Mock data for officers with intervention recommendations
  const officers = [
    {
      id: 1,
      name: 'Personnel A',
      riskLevel: 'high',
      stressScore: 75,
      lastDeployment: '12 months',
      recommendation: 'Immediate counseling + temporary duty reduction',
      actions: [
        'Schedule mandatory wellness counseling session',
        'Reduce workload by 30% for next 2 weeks',
        'Recommend 5-day planned leave',
        'Connect with unit mentor',
      ],
    },
    {
      id: 2,
      name: 'Personnel B',
      riskLevel: 'medium',
      stressScore: 52,
      lastDeployment: '6 months',
      recommendation: 'Preventive support + monitoring',
      actions: [
        'Schedule monthly check-ins',
        'Suggest stress management training',
        'Promote physical wellness activities',
        'Family support program enrollment',
      ],
    },
    {
      id: 3,
      name: 'Personnel C',
      riskLevel: 'high',
      stressScore: 81,
      lastDeployment: '8 months',
      recommendation: 'Crisis intervention + comprehensive support',
      actions: [
        'Immediate meeting with welfare officer',
        'Professional mental health referral',
        'Emergency leave approval if needed',
        'Peer support group assignment',
      ],
    },
    {
      id: 4,
      name: 'Personnel D',
      riskLevel: 'low',
      stressScore: 28,
      lastDeployment: '2 months',
      recommendation: 'Routine monitoring',
      actions: [
        'Quarterly wellness survey',
        'Participation in wellness programs',
        'Regular physical fitness activities',
      ],
    },
  ];

  const selectedData = selectedOfficer !== null ? officers[selectedOfficer] : officers[0];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    if (level === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (level === 'medium') return <AlertCircle className="w-4 h-4" />;
    return <Heart className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Intervention Recommendations</h1>
        <p className="text-slate-600">
          Automated welfare officer support with role-based recommendations for personnel support
        </p>
      </div>

      {/* Officer Selection Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-olive-200 p-6 shadow-md"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">Personnel List (Flagged for Support)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {officers.map((officer, idx) => (
            <button
              key={officer.id}
              onClick={() => setSelectedOfficer(idx)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedOfficer === idx
                  ? 'border-olive-600 bg-olive-50'
                  : 'border-slate-200 bg-slate-50 hover:border-olive-300'
              }`}
            >
              <p className="font-semibold text-slate-900">{officer.name}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold mt-2 border ${getRiskColor(officer.riskLevel)}`}>
                {getRiskIcon(officer.riskLevel)}
                {officer.riskLevel.charAt(0).toUpperCase() + officer.riskLevel.slice(1)}
              </div>
              <p className="text-sm text-slate-600 mt-2">Score: {officer.stressScore}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Detailed Recommendations */}
      <motion.div
        key={selectedData.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl border border-olive-200 p-6 shadow-md"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Overview */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedData.name}</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold mt-3 border ${getRiskColor(selectedData.riskLevel)}`}>
                {getRiskIcon(selectedData.riskLevel)}
                {selectedData.riskLevel.toUpperCase()} RISK
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-1">STRESS SCORE</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-slate-900">{selectedData.stressScore}</p>
                  <p className="text-sm text-slate-600 mb-1">/100</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      selectedData.stressScore > 70
                        ? 'bg-red-500'
                        : selectedData.stressScore > 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${selectedData.stressScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> LAST DEPLOYMENT
                </p>
                <p className="text-xl font-bold text-slate-900">{selectedData.lastDeployment}</p>
              </div>
            </div>
          </div>

          {/* Right: Recommendations */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Recommended Action</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold">{selectedData.recommendation}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Intervention Steps</h3>
              <ul className="space-y-3">
                {selectedData.actions.map((action, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 bg-olive-50 border border-olive-200 rounded-lg p-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-olive-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-slate-900 pt-0.5">{action}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-olive-600 hover:bg-olive-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Approve Intervention
              </button>
              <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Workload Balancing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-olive-200 p-6 shadow-md"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-olive-700" />
          Workload Balancing Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Duty Rotation',
              description: 'Rotate personnel with high stress scores to lower-intensity assignments',
              icon: Users,
            },
            {
              title: 'Leave Planning',
              description: 'Proactively schedule leave for personnel nearing burnout threshold',
              icon: Clock,
            },
            {
              title: 'Team Support',
              description: 'Pair high-stress personnel with experienced mentors for support',
              icon: Heart,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-olive-50 to-white border border-olive-200 rounded-lg p-4">
                <Icon className="w-6 h-6 text-olive-700 mb-2" />
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Role-Based Access Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
      >
        <Heart className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900 mb-1">Welfare-Focused Approach</p>
          <p className="text-sm text-green-700">
            All recommendations are designed to support personnel welfare and resilience, never for disciplinary action. Data is strictly confidential to welfare officers and authorized personnel.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
