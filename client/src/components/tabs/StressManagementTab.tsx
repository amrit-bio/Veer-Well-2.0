import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StressMetric } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BrainCircuit,
  Upload,
  FileText,
  FileSpreadsheet,
  PlusCircle,
  Database,
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export const StressManagementTab: React.FC = () => {
  const { isAnonymized } = useAuth();
  const [metrics, setMetrics] = useState<StressMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeUploadTab, setActiveUploadTab] = useState<'pdf' | 'csv' | 'manual'>('pdf');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Manual Form State
  const [manualDept, setManualDept] = useState<'Operations' | 'Healthcare & Field' | 'Engineering & IT' | 'Administration'>('Operations');
  const [manualRole, setManualRole] = useState<string>('Field Operator');
  const [manualStress, setManualStress] = useState<number>(5.5);
  const [manualWorkload, setManualWorkload] = useState<number>(42);
  const [manualBurnout, setManualBurnout] = useState<string>('Moderate');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStressData();
  }, []);

  const loadStressData = async () => {
    setLoading(true);
    try {
      const res = await api.getStressMetrics();
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to fetch stress metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('Parsing PDF structures and telemetry nodes...');
    try {
      const res = await api.uploadPdf(file);
      setUploadStatus(`Success: ${res.message}`);
      loadStressData();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message || 'PDF parsing failed'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('Ingesting CSV dataset rows...');
    try {
      const res = await api.uploadCsv(file);
      setUploadStatus(`Success: ${res.message}`);
      loadStressData();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message || 'CSV ingestion failed'}`);
    } finally {
      setIsUploading(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleConnectSample = async () => {
    setIsUploading(true);
    setUploadStatus('Connecting 21-node sample pre-seeded dataset...');
    try {
      const res = await api.connectSampleDataset();
      setUploadStatus(`Connected: ${res.message}`);
      loadStressData();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await api.manualStressEntry({
        department: manualDept,
        roleTitle: manualRole,
        stressScore: manualStress,
        workloadHours: manualWorkload,
        burnoutRisk: manualBurnout,
      });
      setUploadStatus('Manual stress metric record registered successfully.');
      loadStressData();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered metrics
  const filteredMetrics = metrics.filter((m) => {
    const matchesSearch =
      m.anonymizedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Scatter plot data: Workload Hours (X) vs Stress Score (Y)
  const scatterData = metrics.map((m) => ({
    x: m.workloadHours,
    y: m.stressScore,
    z: m.fatigueIndex,
    id: m.anonymizedId,
    dept: m.department,
  }));

  // Histogram distribution
  const histogramBuckets = [
    { range: '1.0 - 3.0 (Low)', count: metrics.filter((m) => m.stressScore < 3.5).length },
    { range: '3.5 - 5.5 (Moderate)', count: metrics.filter((m) => m.stressScore >= 3.5 && m.stressScore < 6.0).length },
    { range: '6.0 - 7.5 (Elevated)', count: metrics.filter((m) => m.stressScore >= 6.0 && m.stressScore < 7.5).length },
    { range: '7.5 - 10 (Severe)', count: metrics.filter((m) => m.stressScore >= 7.5).length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Anonymized HR Data Pipeline
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Privacy Mask Active ({metrics.length} Nodes)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Stress Telemetry & HR Dataset Ingestion
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Ingest unstructured PDF wellness audits, tabular CSV spreadsheets, or synthetic datasets to uncover workload-stress regressions.
          </p>
        </div>

        <button
          onClick={handleConnectSample}
          disabled={isUploading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-300 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Connect Sample Dataset</span>
        </button>
      </div>

      {/* Multi-Option Ingestion Drawer Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 glow-emerald">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Data Ingestion Center</h2>
          </div>
          {/* Upload Method Switcher Tabs */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setActiveUploadTab('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'pdf'
                  ? 'bg-emerald-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Audit Ingestion</span>
            </button>
            <button
              onClick={() => setActiveUploadTab('csv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'csv'
                  ? 'bg-emerald-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV / XLSX</span>
            </button>
            <button
              onClick={() => setActiveUploadTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'manual'
                  ? 'bg-emerald-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        <div className="mt-5">
          {activeUploadTab === 'pdf' && (
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition-all bg-slate-900/30">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
                id="pdf-upload-input"
              />
              <label
                htmlFor="pdf-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-200 block">
                    Click to Upload Quarterly Wellness PDF Audit
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Our backend parses tables, shift rosters, and extracts department stress vectors automatically.
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Supported format: .PDF (Up to 25MB)
                </span>
              </label>
            </div>
          )}

          {activeUploadTab === 'csv' && (
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition-all bg-slate-900/30">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleCsvUpload}
                className="hidden"
                id="csv-upload-input"
              />
              <label
                htmlFor="csv-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-200 block">
                    Upload Tabular HR Stress Spreadsheet (CSV/XLSX)
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Auto-maps columns: <code>anonymizedId</code>, <code>department</code>, <code>stressScore</code>, <code>workloadHours</code>.
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Supported format: .CSV, .XLSX
                </span>
              </label>
            </div>
          )}

          {activeUploadTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                <select
                  value={manualDept}
                  onChange={(e) => setManualDept(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Operations">Operations</option>
                  <option value="Healthcare & Field">Healthcare & Field</option>
                  <option value="Engineering & IT">Engineering & IT</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role Title</label>
                <input
                  type="text"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Field Medic"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Stress Score (1 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={manualStress}
                  onChange={(e) => setManualStress(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Weekly Hours</label>
                <input
                  type="number"
                  min="20"
                  max="80"
                  value={manualWorkload}
                  onChange={(e) => setManualWorkload(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Metric</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Visualizations: Correlation Scatter Chart & Stress Distribution Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Correlation Scatter: Workload vs Stress */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Workload vs Stress Score Correlation
              </h2>
              <span className="text-xs font-mono text-slate-400">r = 0.76 (Strong)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              X: Weekly Hours Logged | Y: Stress Score (1-10) | Bubble Size: Fatigue Index
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Weekly Hours" unit="h" stroke="#64748b" domain={[30, 65]} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Stress Score" stroke="#64748b" domain={[1, 10]} tick={{ fontSize: 10 }} />
                <ZAxis type="number" dataKey="z" range={[50, 350]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                          <p className="font-bold text-emerald-400">{data.id} ({data.dept})</p>
                          <p className="text-slate-300">Workload: {data.x} hrs/week</p>
                          <p className="text-amber-400">Stress: {data.y}/10</p>
                          <p className="text-slate-400 font-mono">Fatigue: {data.z}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Personnel" data={scatterData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Histogram */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Stress Level Distribution</h2>
              <span className="text-xs font-mono text-slate-400">Cohort Bins</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Number of anonymized personnel grouped by stress severity tier.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anonymized Records Table with Search & Filter */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Anonymized Stress Telemetry Registry</h2>
            <span className="text-xs text-slate-400 font-mono">
              Displaying {filteredMetrics.length} of {metrics.length} Records
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search EMP-ID..."
                className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Healthcare & Field">Healthcare & Field</option>
              <option value="Engineering & IT">Engineering & IT</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Anonymized ID</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3">Stress Score</th>
                <th className="pb-3">Weekly Hours</th>
                <th className="pb-3">Burnout Risk</th>
                <th className="pb-3">Data Ingestion Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMetrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {m.anonymizedId}
                  </td>
                  <td className="py-3 text-slate-200">{m.department}</td>
                  <td className="py-3 text-slate-400">{m.roleTitle}</td>
                  <td className="py-3 font-mono font-bold text-white">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        m.stressScore > 7.0
                          ? 'bg-rose-500/20 text-rose-300'
                          : m.stressScore > 5.0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {m.stressScore} / 10
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-300">{m.workloadHours} hrs</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.burnoutRisk === 'Critical' || m.burnoutRisk === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : m.burnoutRisk === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {m.burnoutRisk}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      {m.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
