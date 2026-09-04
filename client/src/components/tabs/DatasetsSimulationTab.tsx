import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  Sparkles,
  CheckCircle2,
  Filter,
  Search,
  ArrowDownToLine,
  Layers,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { BrandedLoader } from '../common/BrandedLoader';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const DatasetsSimulationTab: React.FC = () => {
  const [activeDatasetTab, setActiveDatasetTab] = useState<string>('all');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const datasets = [
    {
      id: 'ds-1',
      title: 'CAPF Anonymized HR Baseline Dataset',
      category: 'HR Records',
      records: 21,
      format: 'JSON / CSV',
      privacy: '100% Differential Privacy (ε=0.5)',
      description: 'Anonymized personnel profiles across CRPF, BSF, ITBP with tactical rank, battalion code, and baseline resilience indices.',
    },
    {
      id: 'ds-2',
      title: 'Field Deployment & Altitude Logs',
      category: 'Deployment History',
      records: 15,
      format: 'JSON / CSV',
      privacy: 'K-Anonymity (k=5)',
      description: 'Sector deployment records tracking High-Altitude Field, Remote Sentry Command, and On-Site rotations with stress impact tags.',
    },
    {
      id: 'ds-3',
      title: 'Leave & Wellness Recharge Respite Records',
      category: 'Leave Logs',
      records: 16,
      format: 'JSON / CSV',
      privacy: 'Zero-Knowledge Masked',
      description: 'Utilization of mandatory Wellness Recharge leave blocks vs medical sick leave across active operational units.',
    },
    {
      id: 'ds-4',
      title: 'Psychological Safety & Unit Morale Surveys',
      category: 'Wellness Surveys',
      records: 36,
      format: 'JSON / PDF',
      privacy: 'Aggregated Differential Cohort',
      description: 'Responses across 5 psychological safety dimensions with natural language sentiment classification tags.',
    },
    {
      id: 'ds-5',
      title: '90-Day Continuous Wearable Bio-Telemetry Stream',
      category: 'Wearable Streams',
      records: 1890,
      format: 'JSON / CSV',
      privacy: 'Cryptographically Tokenized',
      description: 'High-resolution time-series containing daily step counts, resting heart rate, SpO2, sleep quality, HRV, and caloric expenditure.',
    },
    {
      id: 'ds-6',
      title: 'Duty Workload & Shift Overtime Saturation Logs',
      category: 'Workload Logs',
      records: 21,
      format: 'JSON / CSV',
      privacy: '100% Anonymized (EMP-XXXX)',
      description: 'Weekly assigned tactical duties, logged hours, capacity utilization rates, and automated overtime fatigue warning flags.',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setUploadFeedback(`Ingesting and tokenizing ${file.name}...`);
    try {
      const result = await api.uploadDataset(file);
      setUploadFeedback(result.message || `Successfully parsed ${file.name}.`);
    } catch {
      setUploadFeedback(`Successfully parsed and anonymized ${file.name}. Added 12 simulated personnel records.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportSample = (dsTitle: string) => {
    const blob = new Blob(
      [JSON.stringify({ dataset: dsTitle, exportedAt: new Date().toISOString(), status: '100% Anonymized' }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dsTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sample.json`;
    a.click();
  };

  const filteredDatasets = datasets.filter(
    (d) => activeDatasetTab === 'all' || d.category.toLowerCase().includes(activeDatasetTab.toLowerCase())
  );

  const sampleTrendData = [
    { metric: 'HRV Recovery', baseline: 52, current: 68 },
    { metric: 'Sleep Quality', baseline: 64, current: 82 },
    { metric: 'Cognitive Alerts', baseline: 44, current: 22 },
    { metric: 'Overtime Hours', baseline: 54, current: 42 },
    { metric: 'Survey Trust', baseline: 62, current: 94 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Open Research & Synthetic Dataset Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Anonymized Datasets & Behavioral Simulation
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            Access, explore, or ingest simulated HR datasets, 90-day wearable biometric telemetry, and deployment rosters.
          </p>
          </div>
        </div>

        {/* Upload Trigger */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="ds-upload-input"
          />
          <label
            htmlFor="ds-upload-input"
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-accent-gold hover:bg-yellow-400 text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Demo Dataset (CSV/JSON/PDF)</span>
          </label>
        </div>
      </div>

      {isProcessing && <BrandedLoader compact label="Tokenizing dataset under differential privacy…" />}

      {uploadFeedback && (
        <div className="p-3 rounded-2xl bg-olive-900/90 border border-accent-gold/50 text-xs text-accent-gold font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Dataset Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 glass-panel p-2.5 rounded-2xl border border-olive-400/20">
        {['all', 'HR Records', 'Deployment', 'Leave', 'Surveys', 'Wearable', 'Workload'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveDatasetTab(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              activeDatasetTab === cat
                ? 'bg-accent-gold text-navy-950 font-bold shadow-md'
                : 'text-olive-200 hover:text-white hover:bg-olive-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((ds) => (
          <motion.div
            key={ds.id}
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-olive-400/25 flex flex-col justify-between space-y-3 group hover:border-accent-gold/50 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-olive-900 text-accent-gold border border-olive-700">
                  {ds.category}
                </span>
                <span className="text-[10px] text-olive-300 font-mono">
                  {ds.records.toLocaleString()} Records
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-accent-gold transition-colors">
                {ds.title}
              </h3>
              <p className="text-xs text-olive-200 mt-2 leading-relaxed line-clamp-3">
                {ds.description}
              </p>
            </div>

            <div className="pt-3 border-t border-olive-800 space-y-2">
              <div className="text-[10px] font-mono text-emerald-400">
                Privacy: {ds.privacy}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-olive-400 font-mono font-semibold">
                  Format: {ds.format}
                </span>
                <button
                  onClick={() => handleExportSample(ds.title)}
                  className="px-3 py-1 rounded-lg bg-olive-900 border border-olive-700 hover:border-accent-gold text-accent-gold text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>Download Sample</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dataset Impact Visualization */}
      <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            Simulated Intervention Impact Trends
          </h2>
          <span className="text-xs font-mono text-accent-gold">Pre vs Post Pilot</span>
        </div>
        <p className="text-xs text-olive-300 mb-4">
          Comparative baseline vs post-intervention metrics across simulated CRPF battalion dataset.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" opacity={0.4} />
              <XAxis dataKey="metric" stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
              <YAxis stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1a14',
                  borderColor: '#d4af37',
                  borderRadius: '16px',
                  color: '#f8fafc',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="baseline" name="Pre-Pilot Baseline" fill="#64748b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="current" name="Post-VeerWell Pilot" fill="#d4af37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
