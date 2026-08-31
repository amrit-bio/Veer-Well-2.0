import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, Database, Users, CheckCircle } from 'lucide-react';

export const PrivacySecurityTab: React.FC = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data encrypted at rest (AES-256) and in transit (TLS 1.3)'
    },
    {
      icon: Shield,
      title: 'Role-Based Access Control',
      description: 'Granular permissions ensure only authorized personnel access data'
    },
    {
      icon: Key,
      title: 'Secure APIs',
      description: 'OAuth 2.0 authentication with secure token management'
    },
    {
      icon: Database,
      title: 'Audit Logging',
      description: 'Complete audit trail of all data access and modifications'
    },
  ];

  const anonymizationSteps = [
    'Personal Identification Numbers (PINs) removed and replaced with secure tokens',
    'Names and personal details anonymized using one-way hashing',
    'Location data generalized to regional areas',
    'Timestamps rounded to preserve privacy',
    'Aggregation of data when displayed in reports',
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy & Security</h1>
        <p className="text-slate-600">
          Our commitment to protecting personnel welfare data with industry-leading security practices
        </p>
      </div>

      {/* Core Principles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-olive-600 to-olive-700 text-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Core Privacy Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Welfare, Not Discipline</h3>
            <p className="text-olive-100">
              Data is collected solely for personnel wellness and support. It is strictly prohibited to use this data for disciplinary or punitive actions.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Consent & Transparency</h3>
            <p className="text-olive-100">
              Personnel are informed about data collection and have control over their participation in the wellness program.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Features */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Security Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((feature, i) => {
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
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Data Anonymization Process */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-olive-700" />
          Data Anonymization Approach
        </h2>
        <div className="space-y-4">
          {anonymizationSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-olive-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-slate-700 pt-1">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Role-Based Access Control */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-olive-700" />
          Role-Based Access Control
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Role</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Can Access</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Restrictions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  role: 'Personnel',
                  access: 'Own wellness data, assessments, personal recommendations',
                  restrictions: 'Cannot see others\' data'
                },
                {
                  role: 'Welfare Officer',
                  access: 'Anonymized team data, risk alerts, recommendations',
                  restrictions: 'Cannot access raw personal data'
                },
                {
                  role: 'Commander',
                  access: 'Aggregated unit-level statistics, trend reports',
                  restrictions: 'No individual personnel data'
                },
                {
                  role: 'Data Analyst',
                  access: 'Anonymized datasets for research and modeling',
                  restrictions: 'Research purposes only'
                },
              ].map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-olive-50' : 'bg-white'}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.role}</td>
                  <td className="py-3 px-4 text-slate-700">{item.access}</td>
                  <td className="py-3 px-4 text-slate-700">{item.restrictions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Compliance & Standards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Compliance Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'GDPR Compliance',
            'ISO 27001 Standards',
            'National Cybersecurity Guidelines',
            'Defense Information Security Program',
          ].map((standard, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
              <span className="font-semibold text-slate-900">{standard}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
