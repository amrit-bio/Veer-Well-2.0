import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, CheckCircle, AlertCircle, Settings, ArrowRight } from 'lucide-react';

export const IntegrationTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hrms' | 'wearables'>('hrms');

  const hrmsIntegrations = [
    {
      name: 'SAP SuccessFactors',
      status: 'ready',
      description: 'HR payroll and employee data sync',
      connection: 'API Key',
      lastSync: '2 hours ago',
    },
    {
      name: 'Oracle HRIS',
      status: 'ready',
      description: 'Deployment records and assignments',
      connection: 'OAuth 2.0',
      lastSync: '30 minutes ago',
    },
    {
      name: 'Internal HRMS',
      status: 'ready',
      description: 'Leave records and attendance',
      connection: 'REST API',
      lastSync: 'Real-time',
    },
  ];

  const wearableIntegrations = [
    {
      name: 'Fitbit',
      status: 'coming-soon',
      description: 'Heart rate, activity, and sleep data',
      connection: 'OAuth',
      devices: 'Fitbit Charge, Ionic, Inspire',
    },
    {
      name: 'Apple HealthKit',
      status: 'coming-soon',
      description: 'Apple Watch and iPhone biometrics',
      connection: 'HealthKit API',
      devices: 'Apple Watch Series 5+',
    },
    {
      name: 'Garmin Connect',
      status: 'ready',
      description: 'Heart rate variability and stress',
      connection: 'API',
      devices: 'Garmin sports watches',
    },
    {
      name: 'Oura Ring',
      status: 'coming-soon',
      description: 'Sleep quality, heart rate, activity',
      connection: 'Cloud API',
      devices: 'Oura Ring Generation 3',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Integration</h1>
        <p className="text-slate-600">
          Connect Rakshak with your existing HRMS and wearable devices
        </p>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 border-b border-slate-300"
      >
        <button
          onClick={() => setActiveTab('hrms')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'hrms'
              ? 'border-olive-600 text-olive-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          HRMS Integration
        </button>
        <button
          onClick={() => setActiveTab('wearables')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'wearables'
              ? 'border-olive-600 text-olive-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Wearable Devices
        </button>
      </motion.div>

      {/* HRMS Integration */}
      {activeTab === 'hrms' && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>What is HRMS Integration?</strong> Connecting Rakshak to your HR system allows automatic sync of employee data, deployment records, leave history, and organizational structure. This enables contextual wellness insights.
            </p>
          </div>

          <div className="space-y-4">
            {hrmsIntegrations.map((integration, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Plug className="w-6 h-6 text-slate-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Authentication</p>
                    <p className="font-semibold text-slate-900">{integration.connection}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Last Sync</p>
                    <p className="font-semibold text-slate-900">{integration.lastSync}</p>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-olive-600 hover:text-olive-700 font-semibold flex items-center gap-1">
                      Settings
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add New Integration */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-olive-50 border-2 border-dashed border-olive-300 rounded-lg p-6 text-center hover:bg-olive-100 transition-colors cursor-pointer"
          >
            <Plug className="w-8 h-8 text-olive-700 mx-auto mb-3" />
            <p className="font-bold text-slate-900 mb-2">Connect Another HRMS</p>
            <p className="text-sm text-slate-600 mb-4">
              Support for additional HR systems coming soon
            </p>
            <button className="bg-olive-600 hover:bg-olive-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Request Integration
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Wearable Integration */}
      {activeTab === 'wearables' && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>What is Wearable Integration?</strong> Personnel can connect their fitness trackers and smartwatches to Rakshak. Real-time biometric data (heart rate, heart rate variability, sleep quality, activity levels) provides continuous stress and wellness monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wearableIntegrations.map((device, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border rounded-lg p-6 ${
                  device.status === 'ready'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{device.name}</h3>
                    <p className="text-sm text-slate-600">{device.description}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    device.status === 'ready'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {device.status === 'ready' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Coming Soon
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Authentication</p>
                    <p className="font-semibold text-slate-900">{device.connection}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Compatible Devices</p>
                    <p className="font-semibold text-slate-900">{device.devices}</p>
                  </div>
                </div>
                <button className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  device.status === 'ready'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-300 text-slate-700 cursor-not-allowed'
                }`}
                disabled={device.status !== 'ready'}>
                  {device.status === 'ready' ? 'Connect Device' : 'Coming Soon'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Data Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <p className="text-sm text-purple-700">
              <strong>Privacy Notice:</strong> All wearable data is encrypted in transit and at rest. Personnel maintain full control over device connections and can disconnect at any time. Data is used solely for wellness support, never shared with external parties.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
