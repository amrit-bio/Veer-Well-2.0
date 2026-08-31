import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Eye, Database, FileJson, FileSpreadsheet } from 'lucide-react';

export const DatasetsTab: React.FC = () => {
  const [hoveredDataset, setHoveredDataset] = useState<string | null>(null);

  const datasets = [
    {
      id: 'hr-data',
      name: 'HR & Personnel Records',
      description: 'Anonymized deployment history, leave patterns, designations',
      records: 2500,
      format: 'CSV / JSON',
      icon: FileSpreadsheet,
    },
    {
      id: 'wellness-surveys',
      name: 'Wellness Survey Responses',
      description: 'Aggregated stress levels, burnout indicators, feedback data',
      records: 5000,
      format: 'JSON',
      icon: Database,
    },
    {
      id: 'workload-data',
      name: 'Workload & Schedule Data',
      description: 'Duty patterns, overtime hours, workload distribution metrics',
      records: 15000,
      format: 'CSV',
      icon: FileSpreadsheet,
    },
    {
      id: 'biometric-data',
      name: 'Biometric & Wearable Data',
      description: 'Heart rate variability, sleep patterns, activity levels (anonymized)',
      records: 50000,
      format: 'JSON',
      icon: Database,
    },
    {
      id: 'behavioral-data',
      name: 'Simulated Behavioral Dataset',
      description: 'Synthetic dataset for ML model training and validation',
      records: 10000,
      format: 'CSV / JSON',
      icon: FileJson,
    },
    {
      id: 'deployment-records',
      name: 'Deployment Records',
      description: 'Mission duration, location generalization, stress correlations',
      records: 800,
      format: 'JSON',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Datasets & Simulation</h1>
        <p className="text-slate-600">
          Access anonymized datasets, upload custom data, and explore wellness analytics
        </p>
      </div>

      {/* Quick Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-olive-300 rounded-xl p-8 text-center bg-olive-50 hover:bg-olive-100 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 text-olive-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Your Dataset</h2>
        <p className="text-slate-600 mb-4">
          Drag and drop CSV or JSON files here, or click to select files
        </p>
        <button className="bg-olive-600 hover:bg-olive-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Select Files
        </button>
      </motion.div>

      {/* Available Datasets */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Datasets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset, idx) => {
            const Icon = dataset.icon;
            return (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredDataset(dataset.id)}
                onMouseLeave={() => setHoveredDataset(null)}
                className="bg-white border border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8 text-olive-700" />
                  <span className="text-xs font-mono bg-olive-100 text-olive-700 px-2 py-1 rounded">
                    {dataset.format}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{dataset.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{dataset.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-olive-700">{dataset.records} records</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-olive-100 hover:bg-olive-200 text-olive-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Data Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Sample Data Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <h3 className="font-bold text-slate-900 mb-4">Deployment Duration Distribution</h3>
            <div className="space-y-3">
              {[
                { range: '0-3 months', percentage: 25 },
                { range: '3-6 months', percentage: 35 },
                { range: '6-12 months', percentage: 30 },
                { range: '12+ months', percentage: 10 },
              ].map((item) => (
                <div key={item.range}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-900">{item.range}</span>
                    <span className="text-sm text-slate-700">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <h3 className="font-bold text-slate-900 mb-4">Wellness Survey Response Rate</h3>
            <div className="space-y-3">
              {[
                { category: 'Very Low Stress', percentage: 20 },
                { category: 'Low Stress', percentage: 35 },
                { category: 'Moderate Stress', percentage: 30 },
                { category: 'High Stress', percentage: 15 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-900">{item.category}</span>
                    <span className="text-sm text-slate-700">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Quality Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All datasets are fully anonymized and comply with privacy regulations. Personnel identifiers have been replaced with secure tokens, and location data has been generalized to regional levels. These datasets are suitable for research, model training, and analytics purposes.
        </p>
      </motion.div>
    </div>
  );
};
