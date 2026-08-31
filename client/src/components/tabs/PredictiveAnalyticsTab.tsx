import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';

export const PredictiveAnalyticsTab: React.FC = () => {
  const [showAnonymized, setShowAnonymized] = useState(true);

  // Sample risk prediction data
  const riskData = [
    { name: 'Low Risk', count: 45, percentage: 45, color: '#7e8f4a' },
    { name: 'Medium Risk', count: 35, percentage: 35, color: '#f59e0b' },
    { name: 'High Risk', count: 20, percentage: 20, color: '#ef4444' },
  ];

  // Trend analysis data
  const trendData = [
    { month: 'Jan', stress: 35, burnout: 28, workload: 45 },
    { month: 'Feb', stress: 38, burnout: 32, workload: 48 },
    { month: 'Mar', stress: 42, burnout: 38, workload: 52 },
    { month: 'Apr', stress: 45, burnout: 42, workload: 55 },
    { month: 'May', stress: 48, burnout: 45, workload: 58 },
    { month: 'Jun', stress: 52, burnout: 48, workload: 62 },
  ];

  // Anonymization demo data
  const anonymizationSteps = [
    {
      step: 1,
      label: 'Raw Data Collection',
      example: 'Officer ID: 1234, Name: John Doe, Heart Rate: 92, Location: Base A'
    },
    {
      step: 2,
      label: 'PII Removal',
      example: 'Officer ID: ANON-5847, Heart Rate: 92, Location: Base A'
    },
    {
      step: 3,
      label: 'Location Anonymization',
      example: 'Officer ID: ANON-5847, Heart Rate: 92, Location: Region-North'
    },
    {
      step: 4,
      label: 'Aggregation',
      example: '50 officers in Region-North with avg HR: 89, stress score: 38'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Predictive Analytics Engine</h1>
        <p className="text-slate-600">AI-powered behavioral analysis and risk prediction demo</p>
      </div>

      {/* Risk Assessment Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-olive-200 shadow-md"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-olive-700" />
          <h2 className="text-xl font-bold text-slate-900">Risk Distribution (Current Period)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {riskData.map((risk) => (
              <div key={risk.name} className="border-l-4 border-olive-300 pl-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-900">{risk.name}</h3>
                  <span className="text-2xl font-bold text-olive-700">{risk.percentage}%</span>
                </div>
                <div className="w-full bg-olive-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${risk.percentage}%`,
                      backgroundColor: risk.color,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">{risk.count} personnel</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 border border-olive-200 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Stress & Burnout Trends (6 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="stress" stroke="#7e8f4a" strokeWidth={2} name="Stress Level" />
            <Line type="monotone" dataKey="burnout" stroke="#f59e0b" strokeWidth={2} name="Burnout Index" />
            <Line type="monotone" dataKey="workload" stroke="#06b6d4" strokeWidth={2} name="Workload" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Deployment History Impact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-olive-200 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Stress Impact by Deployment Duration</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { duration: '0-3 Months', stress: 28, count: 120 },
              { duration: '3-6 Months', stress: 42, count: 95 },
              { duration: '6-12 Months', stress: 55, count: 78 },
              { duration: '12+ Months', stress: 68, count: 52 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="duration" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="stress" fill="#7e8f4a" name="Avg Stress Score" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Anonymization Demo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border border-olive-200 shadow-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-olive-700" />
            <h2 className="text-xl font-bold text-slate-900">Data Anonymization Process</h2>
          </div>
          <button
            onClick={() => setShowAnonymized(!showAnonymized)}
            className="flex items-center gap-2 px-4 py-2 bg-olive-100 hover:bg-olive-200 text-olive-700 rounded-lg transition-colors"
          >
            {showAnonymized ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {anonymizationSteps.map((item) => (
            <div key={item.step} className="border-l-4 border-olive-300 pl-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-olive-600 text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900">{item.label}</h3>
              </div>
              {showAnonymized && (
                <code className="block bg-slate-100 p-3 rounded text-sm text-slate-700 font-mono">
                  {item.example}
                </code>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            All personnel data is anonymized before analysis. Individual identities are replaced with secure tokens, and location data is generalized to regions. Analysis results are always presented in aggregated form.
          </p>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'Early Detection Rate', value: '87%', color: 'bg-green-50', textColor: 'text-green-700' },
          { label: 'Intervention Success', value: '72%', color: 'bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Privacy Compliance', value: '100%', color: 'bg-olive-50', textColor: 'text-olive-700' },
        ].map((insight) => (
          <div key={insight.label} className={`${insight.color} border border-current rounded-lg p-6`}>
            <p className="text-sm font-semibold text-slate-600 mb-2">{insight.label}</p>
            <p className={`text-4xl font-bold ${insight.textColor}`}>{insight.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
